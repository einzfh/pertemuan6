import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  SectionList,
  TextInput,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { products } from './data/products';
import ProductCard from './components/ProductCard';

const App = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [sortBy, setSortBy] = useState('rating-high'); // default rating tertinggi
  const [listMode, setListMode] = useState('flat'); // 'flat' | 'grid' | 'section'
  const [refreshing, setRefreshing] = useState(false);

  // Unique categories
  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category));
    return ['Semua', ...Array.from(cats)];
  }, []);

  // Sort options
  const sortOptions = [
    { label: 'Harga Terendah', value: 'price-low' },
    { label: 'Harga Tertinggi', value: 'price-high' },
    { label: 'Rating Tertinggi', value: 'rating-high' },
  ];

  // Filter + Sort logic
  const filteredProducts = useMemo(() => {
    let filtered = products.filter((p) => {
      const matchSearch = !searchText || p.name.toLowerCase().includes(searchText.toLowerCase());
      const matchCategory = selectedCategory === 'Semua' || p.category === selectedCategory;
      return matchSearch && matchCategory;
    });

    // Sorting
    if (sortBy === 'price-low') filtered.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-high') filtered.sort((a, b) => b.price - a.price);
    else if (sortBy === 'rating-high') filtered.sort((a, b) => b.rating - a.rating);

    return filtered;
  }, [searchText, selectedCategory, sortBy]);

  // SectionList data
  const sections = useMemo(() => {
    if (filteredProducts.length === 0) return [];
    const grouped = {};
    filteredProducts.forEach((p) => {
      if (!grouped[p.category]) grouped[p.category] = [];
      grouped[p.category].push(p);
    });
    return Object.keys(grouped).map((cat) => ({
      title: cat,
      data: grouped[cat],
    }));
  }, [filteredProducts]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const ListEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>😕</Text>
      <Text style={styles.emptyTitle}>Tidak ada produk yang cocok</Text>
      <Text style={styles.emptySubtitle}>Coba ubah kata kunci atau filter lain ya!</Text>
    </View>
  );

  const renderItem = ({ item }) => <ProductCard product={item} />;

  const renderSectionHeader = ({ section }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>
        {section.title} ({section.data.length})
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>🛍️ ShopList</Text>
        <Text style={styles.count}>{filteredProducts.length} produk</Text>
      </View>

      {/* SEARCH BAR */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔎 Cari produk (misal: sneakers)..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#999"
        />
        {searchText ? (
          <TouchableOpacity style={styles.clearBtn} onPress={() => setSearchText('')}>
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* CATEGORY FILTER */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.chip, selectedCategory === cat && styles.chipActive]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={[styles.chipText, selectedCategory === cat && styles.chipTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* TOOLBAR: Sort + View Toggle */}
      <View style={styles.toolbar}>
        {/* Sort Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortScroll}>
          {sortOptions.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.sortChip, sortBy === opt.value && styles.sortChipActive]}
              onPress={() => setSortBy(opt.value)}
            >
              <Text style={[styles.sortChipText, sortBy === opt.value && styles.sortChipTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* View Toggle */}
        <View style={styles.toggleGroup}>
          <TouchableOpacity
            style={[styles.toggleBtn, listMode === 'flat' && styles.toggleActive]}
            onPress={() => setListMode('flat')}
          >
            <Text style={styles.toggleText}>📋</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, listMode === 'grid' && styles.toggleActive]}
            onPress={() => setListMode('grid')}
          >
            <Text style={styles.toggleText}>🔲</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, listMode === 'section' && styles.toggleActive]}
            onPress={() => setListMode('section')}
          >
            <Text style={styles.toggleText}>📚</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* MAIN LIST */}
      {listMode === 'section' ? (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          ListEmptyComponent={ListEmpty}
          refreshing={refreshing}
          onRefresh={onRefresh}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={ListEmpty}
          numColumns={listMode === 'grid' ? 2 : 1}
          columnWrapperStyle={listMode === 'grid' ? styles.columnWrapper : null}
          refreshing={refreshing}
          onRefresh={onRefresh}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 24, fontWeight: '700', color: '#FF6B6B' },
  count: { fontSize: 16, color: '#666' },

  searchContainer: { flexDirection: 'row', margin: 16, backgroundColor: '#fff', borderRadius: 12, alignItems: 'center', paddingHorizontal: 16, shadowColor: '#000', shadowOpacity: 0.05, elevation: 3 },
  searchInput: { flex: 1, height: 48, fontSize: 16 },
  clearBtn: { padding: 8 },
  clearText: { fontSize: 20, color: '#999' },

  chipScroll: { paddingHorizontal: 16, marginBottom: 8 },
  chip: { paddingHorizontal: 20, paddingVertical: 8, backgroundColor: '#fff', borderRadius: 999, marginRight: 8, borderWidth: 1, borderColor: '#ddd' },
  chipActive: { backgroundColor: '#FF6B6B', borderColor: '#FF6B6B' },
  chipText: { color: '#555', fontWeight: '500' },
  chipTextActive: { color: '#fff' },

  toolbar: { flexDirection: 'row', paddingHorizontal: 16, alignItems: 'center', marginBottom: 8 },
  sortScroll: { flex: 1 },
  sortChip: { paddingHorizontal: 16, paddingVertical: 6, backgroundColor: '#f0f0f0', borderRadius: 20, marginRight: 8 },
  sortChipActive: { backgroundColor: '#FF6B6B' },
  sortChipText: { fontSize: 13, color: '#555' },
  sortChipTextActive: { color: '#fff' },

  toggleGroup: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 999, padding: 4, shadowColor: '#000', shadowOpacity: 0.1, elevation: 3 },
  toggleBtn: { paddingHorizontal: 14, paddingVertical: 6 },
  toggleActive: { backgroundColor: '#FF6B6B', borderRadius: 999 },
  toggleText: { fontSize: 18 },

  listContent: { paddingBottom: 30 },
  columnWrapper: { justifyContent: 'space-between' },

  sectionHeader: { backgroundColor: '#fff', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  sectionHeaderText: { fontSize: 18, fontWeight: '700', color: '#333' },

  emptyContainer: { alignItems: 'center', justifyContent: 'center', padding: 60 },
  emptyIcon: { fontSize: 80, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: '#555', marginBottom: 8 },
  emptySubtitle: { fontSize: 16, color: '#888', textAlign: 'center' },
});

export default App;