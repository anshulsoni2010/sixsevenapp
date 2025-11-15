import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { Platform, StatusBar as RNStatusBar } from 'react-native';
import 'react-native-reanimated';
import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Splash from '@/components/Splash';
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

  useEffect(() => {
    if (fontsLoaded) {
      const t = setTimeout(() => setSplashVisible(false), 400);
      return () => clearTimeout(t);
    }
    setSplashVisible(true);
  }, [fontsLoaded]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View style={styles.root}>
        {/* Navigation stack (hidden behind onboarding/splash) */}
        <View style={styles.stackContainer}>
          <Stack screenOptions={{ headerShown: false }}>
            {/* File-based routing - all screens auto-registered */}
          </Stack>
        </View>

  {/* Layered fullscreen container for splash */}
  <View style={styles.overlayContainer}>{splashVisible ? <Splash /> : null}</View>

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
