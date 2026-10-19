import axios from 'axios';
import { Product } from '../types/product';

const api = axios.create({ baseURL: 'https://dummyjson.com', timeout: 12000 });
export async function fetchProducts(): Promise<Product[]> {
  const { data } = await api.get('/products?limit=100');
  return data.products.map((p: any) => ({
    id: String(p.id),
    title: p.title,
    category: p.category,
    price: p.price,
    stock: p.stock,
    description: p.description,
    thumbnail: p.thumbnail,
    sku: p.sku ?? `SKU-${p.id}`,
    favorite: false,
  }));
}
