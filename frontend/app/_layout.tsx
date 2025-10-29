import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Splash from '@/components/Splash';
import { useRouter } from 'expo-router';
import { useRef } from 'react';
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_700Bold,
  useFonts as useSpaceFonts,
} from '@expo-google-fonts/space-grotesk';
import {
  Outfit_400Regular,
  Outfit_700Bold,
  Outfit_600SemiBold,
  useFonts as useOutfitFonts,
} from '@expo-google-fonts/outfit';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [splashVisible, setSplashVisible] = useState(true);

  const [spaceLoaded] = useSpaceFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_700Bold,
  });
  const [outfitLoaded] = useOutfitFonts({
    Outfit_400Regular,
    Outfit_700Bold,
    Outfit_600SemiBold,
  });
  const fontsLoaded = spaceLoaded && outfitLoaded;

  const router = useRouter();
  const navigatedRef = useRef(false);

  useEffect(() => {
    if (fontsLoaded) {
      const t = setTimeout(() => setSplashVisible(false), 400);
      return () => clearTimeout(t);
    }
    setSplashVisible(true);
  }, [fontsLoaded]);

  // after splash hides, navigate to the onboarding route once so the router
  // can manage nested onboarding screens (this avoids the overlay blocking
  // router screens). Use a ref to ensure we only replace once.
  useEffect(() => {
    if (!splashVisible && fontsLoaded && !navigatedRef.current) {
      navigatedRef.current = true;
      router.replace('/onboarding' as any);
    }
  }, [splashVisible, fontsLoaded, router]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View style={styles.root}>
        {/* Navigation stack (hidden behind onboarding/splash) */}
        <View style={styles.stackContainer}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
        </View>

        {/* Layered fullscreen container for splash */}
        <View style={styles.overlayContainer}>{splashVisible ? <Splash /> : null}</View>

        <StatusBar style="light" />
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  stackContainer: {
    flex: 1,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    backgroundColor: 'transparent',
  },
});
