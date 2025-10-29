import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const { width, height: SCREEN_HEIGHT } = Dimensions.get('window');
const OUTER_WIDTH = Math.floor(width * 0.9);
const LOGO_SIZE = 140; // per spec

export default function OnboardingStart() {
  const router = useRouter();

  function handleGetStarted() {
    // navigate to the Name screen in the onboarding flow
    // use a relative route so expo-router resolves the nested path correctly
    // cast to any to satisfy typed router signatures in this workspace
    router.push('/onboarding/name' as any);
  }

  function handleExistingAccount() {
    router.push('/modal');
  }

  // fixed headline sizing per Figma (48px, line-height 1.08)
  const HEADLINE_SIZE = 48;

  const [scale, setScale] = useState(1);

  // Try to load react-ios-borders on iOS to get smooth outer strokes. Fallback to passthrough.
  let IOSBordersWrapper: any = ({ children }: { children: any }) => children;
  if (Platform.OS === 'ios') {
    try {
      // dynamic require so bundler doesn't fail if module is missing
      // module may export component as default or named - try default first
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require('react-ios-borders');
      IOSBordersWrapper = mod && (mod.default || mod);
    } catch (e) {
      IOSBordersWrapper = ({ children }: { children: any }) => children;
    }
  }

  // allow content to extend under the top inset so the gradient fills the status bar/notch
  // do NOT apply bottom inset so content can extend to the bottom/home-indicator
  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right"]}>
      <LinearGradient colors={['#4D3A28', '#000000', '#000000']} locations={[0, 0.35, 1]} style={styles.gradient}>
        {/* measured wrapper that scales down when content is taller than screen */}
        <View
          style={[styles.scaleWrapper, { width: OUTER_WIDTH }]}
          onLayout={(e) => {
            const h = e.nativeEvent.layout.height || 0;
            if (h > 0) {
              const s = Math.min(1, SCREEN_HEIGHT / h);
              setScale(s);
            }
          }}
        >
          <View style={[styles.card, scale !== 1 ? { transform: [{ scale }] } : null]}>
            {/* TOP CONTAINER (first main container) */}
            <View style={styles.topContainer}>
              <View style={styles.logoWrapper}>
                <Image
                  source={require('../../assets/images/splashlogo.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>

              {/* 2nd subcontainer: white box (250px high, full width) */}
              <View style={styles.secondContainer} />

              <View style={styles.textBlock}>
                <Text style={styles.headline}>{`Talk the Alpha,\nWalk the Alpha`}</Text>
                <Text style={styles.subtext}>
                  Just write me your own way or send your chat ss, I'll convert you in Gen Alpha way.
                </Text>
              </View>
            </View>

            {/* BOTTOM CONTAINER (second main container - buttons) */}
            <View style={styles.bottomContainer}>
              <View style={styles.thirdContainer}>
                <IOSBordersWrapper>
                  <View style={styles.alphaButtonWrapper}>
                    <TouchableOpacity style={styles.alphaButtonInner} onPress={handleGetStarted} activeOpacity={0.85}>
                      <Text style={styles.alphaButtonText}>Let’s Be Alpha</Text>
                    </TouchableOpacity>
                  </View>
                </IOSBordersWrapper>

                <IOSBordersWrapper>
                  <View style={styles.existingButtonWrapper}>
                    <TouchableOpacity style={styles.existingButtonInner} onPress={handleExistingAccount} activeOpacity={0.85}>
                      <Text style={styles.existingButtonText}>Add an existing account</Text>
                    </TouchableOpacity>
                  </View>
                </IOSBordersWrapper>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerContainer: {
    flex: 1,
    justifyContent: 'center', // vertically center the two main containers
    alignItems: 'center',
    // removed extra vertical padding so centering is exact
  },
  topContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 30, // 30px gap between logo | white box | text block
    marginBottom: 48, // 48px gap between top and bottom main containers
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    // content-hugging: no fixed height so it wraps the logo
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  textBlock: {
    width: '100%',
    alignItems: 'center',
    gap: 20, // 20px gap between headline and subtext
    paddingHorizontal: 8,
  },
  headline: {
    textAlign: 'center',
    letterSpacing: -2,
    color: '#FFFFFF',
    fontFamily: 'Outfit_700Bold',
    fontSize: 48,
    lineHeight: Math.round(48 * 1.08),
  },
  subtext: {
    textAlign: 'center',
    fontSize: 14,
    color: '#E6E6E6',
    fontFamily: 'Outfit_400Regular',
  },
  bottomContainer: {
    width: '100%',
    alignItems: 'center',
    // bottom container sits below the topContainer with its own content
    gap: 30,
  },
  secondContainer: {
    width: '100%',
    height: 250,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  // wrapper that measures content and allows scaling when needed
  scaleWrapper: {
    alignItems: 'center',
  },
  card: {
    width: '100%',
    alignItems: 'center',
  },
  thirdContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 16, // 16px gap between action buttons
  },
  alphaButton: {
    // deprecated: outer wrapper now provides the visual outer stroke
    width: '100%',
    backgroundColor: '#FFE0C2',
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 16,
  },
  alphaButtonText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 18,
    color: '#111111',
  },
  existingButton: {
    // deprecated: outer wrapper now provides the visual outer stroke
    width: '100%',
    backgroundColor: '#222222',
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 16,
  },
  // outer wrappers that render the border stroke fully outside the inner button
  alphaButtonWrapper: {
    width: '100%',
    borderRadius: 16,
    padding: 2,
    backgroundColor: 'rgba(255,224,194,0.9)',
  },
  alphaButtonInner: {
    width: '100%',
    backgroundColor: '#FFE0C2',
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 16,
  },
  existingButtonWrapper: {
    width: '100%',
    borderRadius: 16,
    padding: 2,
    backgroundColor: 'rgba(34,34,34,0.9)',
  },
  existingButtonInner: {
    width: '100%',
    backgroundColor: '#222222',
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 16,
  },
  existingButtonText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 18,
    color: '#FFFFFF',
  },
});
