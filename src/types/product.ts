export type Product = {
  id: string;
  title: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  thumbnail: string;
  sku: string;
  favorite?: boolean;
};

export type StockFilter = 'All' | 'In Stock' | 'Out of Stock';
export type SortBy =
  | 'Featured'
  | 'Name (A–Z)'
  | 'Price (Low → High)'
  | 'Price (High → Low)';
