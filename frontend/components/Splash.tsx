import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const LOGO_SIZE = Math.min(220, Math.floor(width * 0.48));

export default function Splash() {
  return (
    <View style={styles.container} pointerEvents="none">
      <LinearGradient
        // requested stops: 0% #4D3A28, 20% #000000, 100% #000000
        colors={["#4D3A28", "#000000", "#000000"]}
        locations={[0, 0.25, 1]}
        style={styles.gradient}
      >
        <Image source={require('../assets/images/splashlogo.png')} style={styles.logo} resizeMode="contain" />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
});
