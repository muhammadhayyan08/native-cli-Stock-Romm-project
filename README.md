# StockGlass

A React Native CLI product inventory app with a calm, white glass-inspired interface. Browse the catalog, search and filter products, inspect details, and create, edit, or remove items. Products and preferences are saved on device.

## Requirements

- Node.js 22.11 or later
- Android Studio with an Android SDK and a running emulator (or a connected Android device)
- JDK 17 (the version supported by the generated Android Gradle project)

## Run on Android

```sh
npm install
adb devices
npm run android
```

For iOS, install CocoaPods dependencies from `ios/` with `bundle exec pod install`, then run `npm run ios` on macOS.

## Features

- DummyJSON catalog with pull to refresh and offline saved inventory
- Search by product name with a 300 ms debounce
- Stock filters, price/name sorting, and persistent favorites
- Product details, create/edit forms, validation, and delete confirmation
- AsyncStorage persistence for inventory and preferences
- Large product photography with a graceful image failure placeholder
- Empty and loading states

The Android run command builds and installs a debug app directly onto the connected emulator. This project does not include a release APK.

## Project layout

```text
src/
  components/   Reusable product cards and image fallback
  constants/    Theme tokens
  hooks/        Debounced search helper
  navigation/   Typed navigation params
  screens/      Inventory, detail, and product form screens
  services/     DummyJSON API client
  store/        Zustand inventory state and persistence
  types/        Product and filter types
```
