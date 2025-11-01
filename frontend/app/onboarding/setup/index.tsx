import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Dimensions, 
  ImageBackground, 
  Image, 
  ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const OUTER_WIDTH = Math.round(SCREEN_WIDTH * 0.9);

const SP = {
  xs: 8,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
};

export default function NameScreen() {
  const bg = require('../../../assets/images/setupdonebg.png');
  const successImg = require('../../../assets/images/success.png');

  const router = useRouter();

  // Disable mount animation: initialize values to final state
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);

  const aStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  // On mount, read onboarding data and send to backend
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const onboard = await AsyncStorage.getItem('onboarding');
        if (!onboard) {
          if (mounted) router.replace('/onboarding' as any);
          return;
        }
        const data = JSON.parse(onboard);
        const token = await SecureStore.getItemAsync('session_token');
        const BACKEND = Constants.expoConfig?.extra?.BACKEND_URL ?? 'http://localhost:3000';

        // Show the setup animation for at least 2 seconds
        const startTime = Date.now();

        const res = await fetch(`${BACKEND}/api/auth/onboard`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(data),
        });

        if (res.ok) {
          await AsyncStorage.removeItem('onboarding');
          await AsyncStorage.setItem('isLoggedIn', 'true');
          
          // Calculate remaining time to reach 2 seconds
          const elapsed = Date.now() - startTime;
          const remainingTime = Math.max(0, 2000 - elapsed);
          
          // Wait for remaining time before navigating
          setTimeout(() => {
            if (mounted) router.replace('/(tabs)' as any);
          }, remainingTime);
        } else {
          console.warn('onboard failed', await res.text());
        }
      } catch (e) {
        console.error('setup/onboard error', e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [router]);

  return (
    <ImageBackground source={bg} style={styles.bg} imageStyle={styles.bgImage}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <Animated.View style={[styles.screen, aStyle]}>
          <View style={styles.contentWrapper}>
            <Image source={successImg} style={styles.successImage} />
            <Text style={styles.title}>Setting up 6 7 for you...</Text>
            <ActivityIndicator size="large" color="#ffffff" style={styles.loader} />
          </View>
        </Animated.View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  bg: {
    flex: 1,
    width: '100%',
  },
  bgImage: {
    resizeMode: 'cover',
  },
  screen: {
    flex: 1,
    justifyContent: 'center', // center vertically
    alignItems: 'center', // center horizontally
  },
  contentWrapper: {
    width: OUTER_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontFamily: 'SpaceGrotesk_700Bold',
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 16,
  },
  successImage: {
    width: 150,
    height: 150,
    marginBottom: 16,
  },
  loader: {
    marginTop: SP.md,
  },
});
