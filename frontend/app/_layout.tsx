import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { Platform, StatusBar as RNStatusBar } from 'react-native';
import 'react-native-reanimated';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    if (fontsLoaded) {
      const t = setTimeout(() => setSplashVisible(false), 400);
      return () => clearTimeout(t);
    }
    setSplashVisible(true);
  }, [fontsLoaded]);

  // read a simple persisted auth flag so we can restrict navigation for
  // unauthenticated users. This uses a lightweight AsyncStorage key so we
  // don't depend on a full auth provider here. Key: 'isLoggedIn' = 'true'.
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const v = await AsyncStorage.getItem('isLoggedIn');
        if (mounted) setIsAuthenticated(v === 'true');
      } catch (e) {
        if (mounted) setIsAuthenticated(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // after splash hides, navigate to the onboarding route once so the router
  // can manage nested onboarding screens (this avoids the overlay blocking
  // router screens). Use a ref to ensure we only replace once.
  useEffect(() => {
    // Wait until splash is hidden, fonts are loaded, and we've resolved auth.
    if (!splashVisible && fontsLoaded && isAuthenticated !== null && !navigatedRef.current) {
      navigatedRef.current = true;
      // If the user is authenticated, send them to the tabs, otherwise
      // direct them to onboarding and keep the main tabs out of the
      // navigation stack (below) so unauthenticated users cannot navigate
      // to app screens.
      if (isAuthenticated) {
        router.replace('/(tabs)' as any);
      } else {
        router.replace('/onboarding' as any);
      }
    }
  }, [splashVisible, fontsLoaded, isAuthenticated, router]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View style={styles.root}>
        {/* Navigation stack (hidden behind onboarding/splash) */}
        <View style={styles.stackContainer}>
          <Stack screenOptions={{ headerShown: false }}>
            {/* Only register the main tabs when authenticated. When
                unauthenticated we avoid exposing the (tabs) group so the
                router can't navigate there. Modal remains available. */}
            {isAuthenticated ? <Stack.Screen name="(tabs)" /> : null}
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
        </View>

  {/* Layered fullscreen container for splash (also show while auth is resolving) */}
  <View style={styles.overlayContainer}>{splashVisible || isAuthenticated === null ? <Splash /> : null}</View>

        {/* Use native StatusBar so we can set translucent + transparent on Android
            This allows page backgrounds (gradients/images/dark pages) to show
            behind the status bar while keeping light-content icons. */}
        <RNStatusBar
          barStyle="light-content"
          translucent={true}
          // keep transparent so pages that extend under the inset can show
          // their own background. Individual screens that use SafeAreaView
          // with a top background will set an Android-only backgroundColor
          // to match their page where needed.
          backgroundColor="transparent"
        />
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
