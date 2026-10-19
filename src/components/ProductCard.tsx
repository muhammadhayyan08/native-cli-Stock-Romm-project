import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Product } from '../types/product';
import { colors } from '../constants/theme';
import { ProductImage } from './ProductImage';
function ProductCardView({
  product,
  onPress,
  onFavorite,
}: {
  product: Product;
  onPress: () => void;
  onFavorite: () => void;
}) {
  const inStock = product.stock > 0;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && { transform: [{ scale: 0.985 }] },
      ]}
    >
      <ProductImage uri={product.thumbnail} style={styles.image} />
      <View style={styles.body}>
        <View style={styles.top}>
          <Text style={styles.category} numberOfLines={1}>
            {product.category.toUpperCase()}
          </Text>
          <Pressable hitSlop={10} onPress={onFavorite}>
            <Text style={[styles.heart, product.favorite && styles.loved]}>
              {product.favorite ? '♥' : '♡'}
            </Text>
          </Pressable>
        </View>
        <Text numberOfLines={2} style={styles.name}>
          {product.title}
        </Text>
        <View style={styles.bottom}>
          <Text style={styles.price}>${product.price.toFixed(2)}</Text>
          <View style={[styles.stock, inStock ? styles.in : styles.out]}>
            <View
              style={[
                styles.dot,
                { backgroundColor: inStock ? colors.green : colors.danger },
              ]}
            />
            <Text
              style={[
                styles.stockText,
                { color: inStock ? colors.green : colors.danger },
              ]}
            >
              {inStock ? `${product.stock} in stock` : 'Out of stock'}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
export const ProductCard = React.memo(ProductCardView);
const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.glass,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.9)',
    overflow: 'hidden',
  },
  image: { height: 150, width: '100%' },
  body: { paddingHorizontal: 11, paddingTop: 10, paddingBottom: 12 },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  category: {
    fontSize: 9,
    color: colors.muted,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  heart: { fontSize: 23, color: '#91A099' },
  loved: { color: '#D87578' },
  name: {
    fontSize: 13,
    color: colors.ink,
    fontWeight: '700',
    lineHeight: 19,
    minHeight: 38,
    marginTop: 7,
  },
  bottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  price: { fontSize: 15, color: colors.green, fontWeight: '800' },
  stock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 20,
    paddingHorizontal: 7,
    paddingVertical: 5,
  },
  in: { backgroundColor: '#E7F4EC' },
  out: { backgroundColor: '#FBECEC' },
  dot: { width: 5, height: 5, borderRadius: 5 },
  stockText: { fontSize: 9, fontWeight: '700' },
});
