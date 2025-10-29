import React, { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
  Dimensions,
  Platform,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const OUTER_WIDTH = Math.round(SCREEN_WIDTH * 0.9);

// 8px-based spacing scale
const SP = {
  xs: 8,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
};

// inline SVG content from frontend/assets/icon/left-arrow.svg
const leftArrowSvg = `
<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12.5 16.6L7.06664 11.1667C6.42497 10.525 6.42497 9.475 7.06664 8.83334L12.5 3.4" stroke="white" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

export default function NameScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Try to load react-ios-borders on iOS to get smooth outer strokes. Fallback to passthrough.
  let IOSBordersWrapper: any = ({ children }: { children: any }) => children;
  if (Platform.OS === 'ios') {
    try {
      // dynamic require so bundler doesn't fail if module is missing
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require('react-ios-borders');
      IOSBordersWrapper = mod && (mod.default || mod);
    } catch (e) {
      IOSBordersWrapper = ({ children }: { children: any }) => children;
    }
  }

  // mount animation
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(12);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 360 });
    translateY.value = withTiming(0, { duration: 360 });
  }, []);

  const aStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <Animated.View style={[styles.screen, aStyle]}>
        <View style={styles.contentWrapper}>
          <View style={styles.contentContainer}>
            {/* Header Section */}
            <View style={styles.headerRow}>
              <Pressable
                style={styles.backButton}
                onPress={() => router.back()}
                accessibilityLabel="Back"
              >
                <SvgXml xml={leftArrowSvg} width={20} height={20} />
              </Pressable>

              <View style={styles.progressContainer}>
                <View style={styles.progressTrack}>
                  <View style={styles.progressFill} />
                </View>
              </View>
            </View>

            {/* Title + Subheading */}
            <View style={styles.titleBlock}>
              <Text style={styles.title}>Chat, What's my name?</Text>
              <Text style={styles.subtitle}>Tell us the name you'd like to use in the app.</Text>
            </View>

            {/* Input */}
            <View style={styles.inputWrapper}>
              <TextInput
                placeholder="Enter Your Name"
                placeholderTextColor="#727272"
                style={styles.input}
                returnKeyType="done"
                accessibilityLabel="Name input"
              />
            </View>
          </View>
        </View>

        {/* Bottom Button Section */}
        <View style={[styles.bottomContainer, { paddingBottom: SP.md + insets.bottom }]}> 
          <IOSBordersWrapper>
            <View style={styles.nextButtonWrapper}>
              <Pressable
                style={styles.nextButtonInner}
                onPress={() => router.push('/onboarding/gender' as any)}
                accessibilityRole="button"
                accessibilityLabel="Next"
              >
                <Text style={styles.nextButtonText}>Next</Text>
              </Pressable>
            </View>
          </IOSBordersWrapper>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#111111',
  },
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contentWrapper: {
    width: '100%',
    alignItems: 'center',
    paddingTop: SP.lg,
  },
  contentContainer: {
    width: OUTER_WIDTH,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SP.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#222222',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SP.md,
  },
  backIcon: {
    color: '#fff',
    fontSize: 18,
    lineHeight: 18,
  },
  progressContainer: {
    flex: 1,
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#222222',
    borderRadius: 8,
    overflow: 'hidden',
  },
  progressFill: {
    width: '28%',
    height: '100%',
    backgroundColor: '#FFE0C2',
  },
  titleBlock: {
    // reduced spacing between title/subtitle and input for tighter layout
    marginBottom: SP.md,
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontFamily: 'SpaceGrotesk_700Bold',
    fontWeight: '700',
  },
  subtitle: {
    color: '#fff',
    fontSize: 16,
    marginTop: 4,
    fontFamily: 'SpaceGrotesk_400Regular',
  },
  inputWrapper: {
    marginBottom: SP.xl,
  },
  input: {
    width: '100%',
    backgroundColor: '#141414',
    borderColor: '#191919',
    borderWidth: 2,
    borderRadius: 16,
  paddingVertical: 12,
    paddingHorizontal: 24,
    color: '#ffffff',
    fontSize: 22,
    fontFamily: 'SpaceGrotesk_400Regular',
  },
  bottomContainer: {
    width: '101%',
    paddingTop: SP.lg,
    paddingHorizontal: SP.sm,
    backgroundColor: 'transparent',
    borderTopWidth: 1,
    borderWidth:1,
    borderColor: '#1B1B1B',
    borderTopRightRadius: 18,
    borderTopLeftRadius: 18
  },
  // outer wrapper that provides the visual outer stroke (iOS smoothing friendly)
  nextButtonWrapper: {
    width: OUTER_WIDTH,
    borderRadius: 16,
    padding: 2,
    backgroundColor: 'rgba(255,224,194,0.9)',
  },
  nextButtonInner: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    backgroundColor: '#FFE0C2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    color: '#000000',
    fontSize: 22,
    fontFamily: 'Outfit_600SemiBold',
    fontWeight: '600',
  },
});