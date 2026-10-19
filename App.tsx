import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootStackParamList } from './src/navigation/types';
import { InventoryScreen } from './src/screens/InventoryScreen';
import { ProductDetailsScreen } from './src/screens/ProductDetailsScreen';
import { ProductFormScreen } from './src/screens/ProductFormScreen';
import { colors } from './src/constants/theme';
const Stack = createNativeStackNavigator<RootStackParamList>();
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.canvas,
    card: colors.canvas,
    text: colors.ink,
    border: colors.canvas,
    primary: colors.green,
  },
};
export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <NavigationContainer theme={theme}>
        <Stack.Navigator
          screenOptions={{
            headerShadowVisible: false,
            headerStyle: { backgroundColor: colors.canvas },
            headerTintColor: colors.ink,
            headerTitleStyle: { fontWeight: '700' },
            headerBackTitle: 'Back',
          }}
        >
          <Stack.Screen
            name="Inventory"
            component={InventoryScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ProductDetails"
            component={ProductDetailsScreen}
            options={{ title: 'Product details' }}
          />
          <Stack.Screen
            name="ProductForm"
            component={ProductFormScreen}
            options={({ route }) => ({
              title: route.params?.productId ? 'Edit product' : 'New product',
            })}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
