import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { fetchProducts } from '../services/products';
import { Product, SortBy, StockFilter } from '../types/product';

type State = {
  products: Product[];
  deletedIds: string[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  filter: StockFilter;
  sort: SortBy;
  favoritesOnly: boolean;
  initialize: () => Promise<void>;
  refresh: () => Promise<void>;
  add: (product: Product) => Promise<void>;
  update: (product: Product) => Promise<void>;
  remove: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => void;
  setFilter: (filter: StockFilter) => void;
  setSort: (sort: SortBy) => void;
  setFavoritesOnly: (enabled: boolean) => void;
};

const STORAGE_KEY = 'stockglass.inventory.v1';

async function persist(
  state: Pick<
    State,
    'products' | 'deletedIds' | 'filter' | 'sort' | 'favoritesOnly'
  >,
) {
  const { products, deletedIds, filter, sort, favoritesOnly } = state;
  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ products, deletedIds, filter, sort, favoritesOnly }),
  );
}

function persistInBackground(
  state: Pick<
    State,
    'products' | 'deletedIds' | 'filter' | 'sort' | 'favoritesOnly'
  >,
) {
  persist(state).catch(() => undefined);
}

export const useInventory = create<State>((set, get) => ({
  products: [],
  deletedIds: [],
  loading: true,
  refreshing: false,
  error: null,
  filter: 'All',
  sort: 'Featured',
  favoritesOnly: false,

  initialize: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const saved = raw ? JSON.parse(raw) : {};
      set({
        products: saved.products ?? [],
        deletedIds: saved.deletedIds ?? [],
        filter: saved.filter ?? 'All',
        sort: saved.sort ?? 'Featured',
        favoritesOnly: saved.favoritesOnly ?? false,
      });

      if (!saved.products) {
        try {
          const products = await fetchProducts();
          set({ products, error: null });
          await persist({ ...get(), products });
        } catch {
          set({
            error:
              'Could not reach the catalog. Your saved products are still available.',
          });
        }
      }
    } catch {
      set({ error: 'Storage could not be opened.' });
    } finally {
      set({ loading: false });
    }
  },

  refresh: async () => {
    set({ refreshing: true });
    try {
      const fresh = await fetchProducts();
      const current = get().products;
      const deletedIds = get().deletedIds;
      const existing = new Map(current.map(product => [product.id, product]));
      const remoteIds = new Set(fresh.map(product => product.id));
      const remote = fresh
        .filter(product => !deletedIds.includes(product.id))
        .map(product => existing.get(product.id) ?? product);
      const local = current.filter(
        product => !/^\d+$/.test(product.id) && !remoteIds.has(product.id),
      );
      const products = [...remote, ...local];
      set({ products, error: null });
      await persist({ ...get(), products });
    } catch {
      set({ error: 'Refresh failed. Showing your saved catalog.' });
    } finally {
      set({ refreshing: false });
    }
  },

  add: async product => {
    const products = [product, ...get().products];
    set({ products });
    await persist({ ...get(), products });
  },

  update: async product => {
    const products = get().products.map(item =>
      item.id === product.id ? product : item,
    );
    const deletedIds = get().deletedIds.filter(id => id !== product.id);
    set({ products, deletedIds });
    await persist({ ...get(), products, deletedIds });
  },

  remove: async id => {
    const products = get().products.filter(product => product.id !== id);
    const deletedIds = /^\d+$/.test(id)
      ? [...new Set([...get().deletedIds, id])]
      : get().deletedIds;
    set({ products, deletedIds });
    await persist({ ...get(), products, deletedIds });
  },

  toggleFavorite: id => {
    const products = get().products.map(product =>
      product.id === id ? { ...product, favorite: !product.favorite } : product,
    );
    set({ products });
    persistInBackground({ ...get(), products });
  },

  setFilter: filter => {
    set({ filter });
    persistInBackground({ ...get(), filter });
  },

  setSort: sort => {
    set({ sort });
    persistInBackground({ ...get(), sort });
  },

  setFavoritesOnly: favoritesOnly => {
    set({ favoritesOnly });
    persistInBackground({ ...get(), favoritesOnly });
  },
}));
