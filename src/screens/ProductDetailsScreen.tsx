import React from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useInventory } from '../store/useInventory';
import { ProductImage } from '../components/ProductImage';
import { colors, shadow } from '../constants/theme';
type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetails'>;
export function ProductDetailsScreen({ route, navigation }: Props) {
  const product = useInventory(s =>
    s.products.find(p => p.id === route.params.productId),
  );
  const remove = useInventory(s => s.remove);
  if (!product)
    return (
      <View style={styles.screen}>
        <Text>Product not found.</Text>
      </View>
    );
  const del = () =>
    Alert.alert(
      'Delete product?',
      'This product will be removed from your saved inventory.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () =>
            remove(product.id)
              .then(() => navigation.popToTop())
              .catch(() => Alert.alert('Could not delete product.')),
        },
      ],
    );
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.imageWrap}>
        <ProductImage uri={product.thumbnail} style={styles.image} />
        <Pressable
          style={styles.heart}
          onPress={() => useInventory.getState().toggleFavorite(product.id)}
        >
          <Text
            style={[
              styles.heartGlyph,
              product.favorite && styles.heartGlyphActive,
            ]}
          >
            {product.favorite ? '♥' : '♡'}
          </Text>
        </Pressable>
      </View>
      <View style={styles.heading}>
        <Text style={styles.category}>{product.category}</Text>
        <Text style={styles.name}>{product.title}</Text>
        <Text style={styles.price}>${product.price.toFixed(2)}</Text>
      </View>
      <View style={styles.glass}>
        <View style={styles.stockRow}>
          <View
            style={[
              styles.dot,
              {
                backgroundColor:
                  product.stock > 0 ? colors.green : colors.danger,
              },
            ]}
          />
          <Text style={styles.stockText}>
            {product.stock > 0 ? 'In stock' : 'Out of stock'}
          </Text>
          <Text style={styles.qty}>{product.stock} units</Text>
        </View>
        <View style={styles.divider} />
        <Text style={styles.label}>DESCRIPTION</Text>
        <Text style={styles.description}>
          {product.description || 'No description provided.'}
        </Text>
        <View style={styles.divider} />
        <View style={styles.skuRow}>
          <Text style={styles.label}>SKU</Text>
          <Text style={styles.sku}>{product.sku}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <Pressable
          onPress={() =>
            navigation.navigate('ProductForm', { productId: product.id })
          }
          style={styles.edit}
        >
          <Text style={styles.editText}>Edit product</Text>
        </Pressable>
        <Pressable onPress={del} style={styles.delete}>
          <Text style={styles.deleteText}>Delete</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: 18, paddingBottom: 40 },
  imageWrap: { height: 300, borderRadius: 18, overflow: 'hidden', ...shadow },
  image: { width: '100%', height: '100%' },
  heart: {
    position: 'absolute',
    right: 15,
    top: 15,
    backgroundColor: 'rgba(255,255,255,.88)',
    width: 45,
    height: 45,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartGlyph: { fontSize: 24, color: '#74877A' },
  heartGlyphActive: { color: '#D87578' },
  heading: { paddingHorizontal: 4, paddingTop: 20, paddingBottom: 17 },
  category: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
    color: colors.muted,
  },
  name: {
    fontSize: 27,
    fontWeight: '800',
    letterSpacing: -0.7,
    color: colors.ink,
    marginTop: 7,
  },
  price: { fontSize: 22, fontWeight: '800', color: colors.green, marginTop: 7 },
  glass: {
    borderRadius: 16,
    padding: 18,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadow,
  },
  stockRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 5 },
  stockText: { fontSize: 13, fontWeight: '800', color: colors.ink },
  qty: { marginLeft: 'auto', fontSize: 12, color: colors.muted },
  divider: { height: 1, backgroundColor: colors.line, marginVertical: 16 },
  label: {
    fontSize: 9,
    letterSpacing: 0.3,
    fontWeight: '800',
    color: colors.muted,
  },
  description: { fontSize: 13, lineHeight: 21, color: '#526159', marginTop: 9 },
  skuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sku: { fontSize: 12, fontWeight: '700', color: colors.ink },
  actions: { flexDirection: 'row', gap: 10, marginTop: 19 },
  edit: {
    flex: 1,
    backgroundColor: colors.green,
    borderRadius: 17,
    padding: 16,
    alignItems: 'center',
  },
  editText: { color: '#FFFFFF', fontWeight: '800' },
  delete: {
    paddingHorizontal: 22,
    justifyContent: 'center',
    backgroundColor: '#F9EDED',
    borderRadius: 17,
  },
  deleteText: { color: colors.danger, fontWeight: '800' },
});
