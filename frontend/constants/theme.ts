/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** Use Space Grotesk everywhere for now */
    sans: 'SpaceGrotesk_400Regular',
    /** fallback names also point to Space Grotesk */
    serif: 'SpaceGrotesk_400Regular',
    rounded: 'SpaceGrotesk_400Regular',
    mono: 'SpaceGrotesk_400Regular',
  },
  default: {
    sans: 'SpaceGrotesk_400Regular',
    serif: 'SpaceGrotesk_400Regular',
    rounded: 'SpaceGrotesk_400Regular',
    mono: 'SpaceGrotesk_400Regular',
  },
  web: {
    sans: "SpaceGrotesk_400Regular, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "SpaceGrotesk_400Regular, Georgia, 'Times New Roman', serif",
    rounded: "SpaceGrotesk_400Regular, 'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SpaceGrotesk_400Regular, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
