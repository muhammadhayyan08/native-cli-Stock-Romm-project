import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useInventory } from '../store/useInventory';
import { ProductCard } from '../components/ProductCard';
import { colors, shadow } from '../constants/theme';
import { SortBy, StockFilter } from '../types/product';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
type Props = NativeStackScreenProps<RootStackParamList, 'Inventory'>;
const filters: StockFilter[] = ['All', 'In Stock', 'Out of Stock'];
const sorts: SortBy[] = [
  'Featured',
  'Name (A–Z)',
  'Price (Low → High)',
  'Price (High → Low)',
];
export function InventoryScreen({ navigation }: Props) {
  const {
    products,
    loading,
    refreshing,
    error,
    filter,
    sort,
    favoritesOnly,
    initialize,
    refresh,
    setFilter,
    setSort,
    setFavoritesOnly,
    toggleFavorite,
  } = useInventory();
  const [search, setSearch] = useState('');
  const [sortOpen, setSortOpen] = useState(false);
  useEffect(() => {
    initialize().catch(() => undefined);
  }, [initialize]);
  const debouncedSearch = useDebouncedValue(search);
  const shown = useMemo(() => {
    let list = products.filter(p =>
      p.title.toLowerCase().includes(debouncedSearch.trim().toLowerCase()),
    );
    if (filter === 'In Stock') list = list.filter(p => p.stock > 0);
    if (filter === 'Out of Stock') list = list.filter(p => p.stock <= 0);
    if (favoritesOnly) list = list.filter(p => p.favorite);
    return [...list].sort((a, b) =>
      sort === 'Name (A–Z)'
        ? a.title.localeCompare(b.title)
        : sort === 'Price (Low → High)'
        ? a.price - b.price
        : sort === 'Price (High → Low)'
        ? b.price - a.price
        : 0,
    );
  }, [products, debouncedSearch, filter, sort, favoritesOnly]);
  const total = products.length;
  const inStock = products.filter(p => p.stock > 0).length;
  return (
    <View style={styles.screen}>
      <FlatList
        data={shown}
        keyExtractor={p => p.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => refresh().catch(() => undefined)}
            tintColor={colors.green}
          />
        }
        ListHeaderComponent={
          <>
            <View style={styles.hero}>
              <View style={styles.orb} />
              <Text style={styles.eyebrow}>CATALOG</Text>
              <View style={styles.heroRow}>
                <View>
                  <Text style={styles.title}>Products</Text>
                  <Text style={styles.subtitle}>
                    Stock and pricing at a glance
                  </Text>
                </View>
                <Pressable
                  onPress={() => navigation.navigate('ProductForm', {})}
                  style={styles.add}
                >
                  <Text style={styles.addText}>＋</Text>
                </Pressable>
              </View>
              <View style={styles.stats}>
                <View style={styles.stat}>
                  <Text style={styles.statNum}>{total}</Text>
                  <Text style={styles.statLabel}>PRODUCTS</Text>
                </View>
                <View style={styles.statLine} />
                <View style={styles.stat}>
                  <Text style={styles.statNum}>{inStock}</Text>
                  <Text style={styles.statLabel}>IN STOCK</Text>
                </View>
                <View style={styles.statLine} />
                <View style={styles.stat}>
                  <Text style={styles.statNum}>{total - inStock}</Text>
                  <Text style={styles.statLabel}>OUT OF STOCK</Text>
                </View>
              </View>
            </View>
            <View style={styles.searchBox}>
              <Text style={styles.searchGlyph}>⌕</Text>
              <TextInput
                style={styles.input}
                value={search}
                onChangeText={setSearch}
                placeholder="Search products"
                placeholderTextColor="#A2ADA6"
                returnKeyType="search"
              />
              <Pressable onPress={() => setFavoritesOnly(!favoritesOnly)}>
                <Text
                  style={[styles.favToggle, favoritesOnly && styles.favActive]}
                >
                  {favoritesOnly ? '♥' : '♡'}
                </Text>
              </Pressable>
            </View>
            <View style={styles.toolbar}>
              <View style={styles.filterRow}>
                {filters.map(f => (
                  <Pressable
                    key={f}
                    onPress={() => setFilter(f)}
                    style={[
                      styles.filterChip,
                      filter === f && styles.filterSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        filter === f && styles.filterSelectedText,
                      ]}
                    >
                      {f}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <Pressable
                onPress={() => setSortOpen(!sortOpen)}
                style={styles.sort}
              >
                <Text style={styles.sortText}>Sort ⌄</Text>
              </Pressable>
            </View>
            {sortOpen && (
              <View style={styles.sortMenu}>
                {sorts.map(s => (
                  <Pressable
                    key={s}
                    onPress={() => {
                      setSort(s);
                      setSortOpen(false);
                    }}
                    style={styles.sortItem}
                  >
                    <Text
                      style={[styles.sortOption, s === sort && styles.chosen]}
                    >
                      {s}
                    </Text>
                    <Text style={styles.check}>{s === sort ? '✓' : ''}</Text>
                  </Pressable>
                ))}
              </View>
            )}
            <View style={styles.sectionTitle}>
              <Text style={styles.sectionHeading}>
                {favoritesOnly ? 'Favorites' : 'All products'}
              </Text>
              <Text style={styles.count}>{shown.length}</Text>
            </View>
            {!!error && <Text style={styles.notice}>{error}</Text>}
          </>
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.loading}>
              <View style={styles.loadingMessage}>
                <ActivityIndicator color={colors.green} />
                <Text style={styles.emptySubtitle}>
                  Gathering your products…
                </Text>
              </View>
              <View style={styles.skeletonRow}>
                {[0, 1].map(item => (
                  <View key={item} style={styles.skeletonCard}>
                    <View style={styles.skeletonImage} />
                    <View style={styles.skeletonLine} />
                    <View style={[styles.skeletonLine, styles.shortLine]} />
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>◌</Text>
              <Text style={styles.emptyTitle}>
                {search
                  ? 'No matches found'
                  : total
                  ? 'Nothing in this view'
                  : 'No products yet'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {search
                  ? 'Try a different product name.'
                  : total
                  ? 'Try another filter.'
                  : 'Add a product to start tracking your inventory.'}
              </Text>
              {!search && !total && (
                <Pressable
                  style={styles.emptyButton}
                  onPress={() => navigation.navigate('ProductForm', {})}
                >
                  <Text style={styles.emptyButtonText}>Add a product</Text>
                </Pressable>
              )}
            </View>
          )
        }
        renderItem={({ item }) => (
          <View style={styles.cell}>
            <ProductCard
              product={item}
              onPress={() =>
                navigation.navigate('ProductDetails', { productId: item.id })
              }
              onFavorite={() => toggleFavorite(item.id)}
            />
          </View>
        )}
      />
      <Pressable
        style={styles.fab}
        onPress={() => navigation.navigate('ProductForm', {})}
      >
        <Text style={styles.fabText}>＋</Text>
        <Text style={styles.fabLabel}>Add product</Text>
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 110 },
  hero: {
    backgroundColor: 'transparent',
    paddingHorizontal: 2,
    paddingTop: 10,
    paddingBottom: 18,
    borderRadius: 0,
    overflow: 'hidden',
    marginBottom: 4,
  },
  orb: {
    position: 'absolute',
    right: -42,
    top: -67,
    width: 190,
    height: 190,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,.42)',
  },
  eyebrow: {
    fontSize: 9,
    letterSpacing: 1.9,
    color: '#6D8D78',
    fontWeight: '800',
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 7,
  },
  title: {
    fontSize: 30,
    color: colors.ink,
    fontWeight: '800',
    letterSpacing: -1.2,
  },
  subtitle: { fontSize: 12, color: '#74877A', marginTop: 1 },
  add: {
    width: 46,
    height: 46,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  addText: { fontSize: 29, color: colors.green, marginTop: -2 },
  stats: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(93,126,103,.13)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stat: { flex: 1 },
  statNum: { fontSize: 19, color: colors.ink, fontWeight: '800' },
  statLabel: {
    fontSize: 8,
    color: '#819287',
    fontWeight: '800',
    letterSpacing: 0.8,
    marginTop: 3,
  },
  statLine: {
    height: 28,
    width: 1,
    backgroundColor: 'rgba(93,126,103,.17)',
    marginHorizontal: 7,
  },
  searchBox: {
    height: 48,
    borderRadius: 17,
    backgroundColor: colors.glass,
    borderColor: '#FFFFFF',
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    ...shadow,
  },
  searchGlyph: { fontSize: 27, color: '#708278', marginRight: 9 },
  input: { flex: 1, fontSize: 13, color: colors.ink },
  favToggle: { fontSize: 20, color: '#9AA79F' },
  favActive: { color: '#D87578' },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  filterRow: { flexDirection: 'row', gap: 5, flex: 1 },
  filterChip: { paddingVertical: 8, paddingHorizontal: 10, borderRadius: 15 },
  filterSelected: { backgroundColor: colors.green },
  filterText: { fontSize: 10, color: '#76847B', fontWeight: '700' },
  filterSelectedText: { color: '#FFFFFF' },
  sort: { padding: 7 },
  sortText: {
    fontSize: 9,
    letterSpacing: 0.9,
    color: '#78877D',
    fontWeight: '800',
  },
  sortMenu: {
    position: 'absolute',
    right: 19,
    top: 352,
    zIndex: 10,
    width: 195,
    borderRadius: 16,
    padding: 6,
    backgroundColor: '#FFFFFF',
    ...shadow,
  },
  sortItem: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sortOption: { fontSize: 11, color: colors.ink },
  chosen: { color: colors.green, fontWeight: '800' },
  check: { color: colors.green, fontWeight: '800' },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 21,
    marginBottom: 13,
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.3,
  },
  count: { fontSize: 9, fontWeight: '800', letterSpacing: 1, color: '#93A097' },
  row: { gap: 10, marginBottom: 10 },
  cell: { flex: 1, minWidth: 0 },
  empty: { alignItems: 'center', paddingHorizontal: 30, paddingVertical: 45 },
  emptyIcon: { fontSize: 45, color: '#B4C7BA' },
  emptyTitle: {
    fontSize: 17,
    color: colors.ink,
    fontWeight: '800',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  emptyButton: {
    backgroundColor: colors.green,
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 16,
  },
  emptyButtonText: { color: '#FFFFFF', fontWeight: '700' },
  loading: { paddingTop: 18, gap: 12 },
  loadingMessage: { alignItems: 'center', padding: 15, gap: 6 },
  skeletonRow: { flexDirection: 'row', gap: 11 },
  skeletonCard: {
    flex: 1,
    gap: 10,
    padding: 10,
    borderRadius: 22,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  skeletonImage: {
    height: 150,
    borderRadius: 14,
    backgroundColor: '#E5ECE6',
  },
  skeletonLine: {
    width: '86%',
    height: 11,
    borderRadius: 8,
    backgroundColor: '#E5ECE6',
  },
  shortLine: { width: '55%' },
  notice: { color: colors.amber, fontSize: 11, marginTop: 9 },
  fab: {
    position: 'absolute',
    bottom: 18,
    alignSelf: 'center',
    height: 53,
    paddingHorizontal: 20,
    borderRadius: 19,
    backgroundColor: colors.green,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    ...shadow,
  },
  fabText: { fontSize: 23, color: '#FFFFFF', marginTop: -2 },
  fabLabel: {
    fontSize: 10,
    letterSpacing: 1,
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
