import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useInventory } from '../store/useInventory';
import { colors } from '../constants/theme';
type Props = NativeStackScreenProps<RootStackParamList, 'ProductForm'>;
type Values = {
  title: string;
  category: string;
  price: string;
  stock: string;
  description: string;
  thumbnail: string;
  sku: string;
};
const schema = yup.object({
  title: yup.string().trim().required('Product name is required.'),
  category: yup.string().trim().required('Category is required.'),
  price: yup
    .number()
    .typeError('Enter a valid price.')
    .moreThan(0, 'Price must be greater than 0.')
    .required('Price is required.'),
  stock: yup
    .number()
    .typeError('Enter a whole number.')
    .integer('Use a whole number.')
    .min(0, 'Quantity cannot be negative.')
    .required('Quantity is required.'),
  description: yup.string().trim().required('Description is required.'),
  thumbnail: yup
    .string()
    .trim()
    .url('Enter a valid image URL.')
    .nullable()
    .default(''),
  sku: yup.string().trim().required('SKU is required.'),
});
export function ProductFormScreen({ route, navigation }: Props) {
  const { productId } = route.params ?? {};
  const product = useInventory(s => s.products.find(p => p.id === productId));
  const add = useInventory(s => s.add);
  const update = useInventory(s => s.update);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      title: product?.title ?? '',
      category: product?.category ?? '',
      price: product ? String(product.price) : '',
      stock: product ? String(product.stock) : '0',
      description: product?.description ?? '',
      thumbnail: product?.thumbnail ?? '',
      sku: product?.sku ?? `STK-${Date.now().toString().slice(-6)}`,
    },
  });
  const submit = handleSubmit(async values => {
    const next = {
      id: product?.id ?? `local-${Date.now()}`,
      title: values.title.trim(),
      category: values.category.trim(),
      price: Number(values.price),
      stock: Number(values.stock),
      description: values.description.trim(),
      thumbnail: values.thumbnail.trim(),
      sku: values.sku.trim(),
      favorite: product?.favorite ?? false,
    };
    if (product) await update(next);
    else await add(next);
    navigation.goBack();
  });
  const field = (
    name: keyof Values,
    label: string,
    placeholder: string,
    options: {
      multiline?: boolean;
      keyboardType?: 'default' | 'decimal-pad' | 'number-pad';
      required?: boolean;
    } = {},
  ) => (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}
        {options.required ? ' *' : ''}
      </Text>
      <Controller
        control={control}
        name={name}
        render={({ field: f }) => (
          <TextInput
            value={f.value}
            onChangeText={f.onChange}
            onBlur={f.onBlur}
            placeholder={placeholder}
            placeholderTextColor="#A2ADA6"
            multiline={options.multiline}
            keyboardType={options.keyboardType ?? 'default'}
            textAlignVertical={options.multiline ? 'top' : 'center'}
            style={[
              styles.input,
              options.multiline && styles.multiline,
              errors[name] && styles.invalid,
            ]}
          />
        )}
      />
      {errors[name]?.message && (
        <Text style={styles.error}>{String(errors[name]?.message)}</Text>
      )}
    </View>
  );
  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.intro}>
          <Text style={styles.kicker}>
            {product ? 'PRODUCT DETAILS' : 'NEW PRODUCT'}
          </Text>
          <Text style={styles.title}>
            {product ? 'Edit product' : 'Add a product'}
          </Text>
          <Text style={styles.subtitle}>
            Enter the product information below.
          </Text>
        </View>
        {field('title', 'Product name', 'e.g. Ceramic pour-over dripper', {
          required: true,
        })}
        {field('category', 'Category', 'e.g. Home & Living', {
          required: true,
        })}
        <View style={styles.halfRow}>
          <View style={styles.halfField}>
            {field('price', 'Price', '0.00', {
              keyboardType: 'decimal-pad',
              required: true,
            })}
          </View>
          <View style={styles.halfField}>
            {field('stock', 'Quantity', '0', {
              keyboardType: 'number-pad',
              required: true,
            })}
          </View>
        </View>
        {field('sku', 'SKU', 'e.g. STOCK-024', { required: true })}
        {field(
          'description',
          'Description',
          'Add a short product description',
          { multiline: true, required: true },
        )}
        {field(
          'thumbnail',
          'Product image URL',
          'https://example.com/image.jpg',
        )}
        <Pressable
          disabled={isSubmitting}
          onPress={() => submit()}
          style={({ pressed }) => [styles.save, pressed && { opacity: 0.8 }]}
        >
          <Text style={styles.saveText}>
            {product ? 'Save changes' : 'Add to inventory'}
          </Text>
        </Pressable>
        <Text style={styles.requiredNote}>* Required fields</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: 20, paddingBottom: 40 },
  intro: { marginBottom: 18 },
  kicker: {
    fontSize: 9,
    color: '#7E9384',
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 29,
    color: colors.ink,
    fontWeight: '800',
    letterSpacing: -0.8,
    marginTop: 6,
  },
  subtitle: { fontSize: 12, color: colors.muted, marginTop: 4 },
  field: { marginBottom: 14 },
  label: { fontSize: 11, color: '#526159', fontWeight: '700', marginBottom: 7 },
  input: {
    backgroundColor: 'rgba(255,255,255,.86)',
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 14,
    height: 49,
    color: colors.ink,
    fontSize: 13,
  },
  multiline: { height: 105, paddingTop: 13 },
  invalid: { borderColor: '#E6B8B8' },
  error: { color: colors.danger, fontSize: 10, marginTop: 4 },
  halfRow: { flexDirection: 'row', gap: 12 },
  halfField: { flex: 1 },
  save: {
    height: 54,
    backgroundColor: colors.green,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 7,
  },
  saveText: { fontSize: 13, color: '#FFFFFF', fontWeight: '800' },
  requiredNote: {
    fontSize: 10,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 11,
  },
});
