import React, { useState } from 'react';
import { Image, StyleSheet, Text, View, ViewStyle } from 'react-native';
export function ProductImage({
  uri,
  style,
}: {
  uri: string;
  style?: ViewStyle;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <View style={[styles.wrap, style]}>
      {uri && !failed ? (
        <Image
          source={{ uri }}
          style={styles.image}
          resizeMode="cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <View style={styles.fallback}>
          <Text style={styles.glyph}>◈</Text>
          <Text style={styles.label}>IMAGE UNAVAILABLE</Text>
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  wrap: { overflow: 'hidden', backgroundColor: '#E9F0EA' },
  image: { width: '100%', height: '100%' },
  fallback: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 5 },
  glyph: { fontSize: 27, color: '#9DB1A3' },
  label: {
    fontSize: 8,
    color: '#9AA89E',
    letterSpacing: 1.2,
    fontWeight: '700',
  },
});
