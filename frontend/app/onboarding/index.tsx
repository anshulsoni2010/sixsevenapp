import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  Dimensions, 
  Platform,
  Animated as RNAnimated,
  PanResponder,
  TouchableWithoutFeedback,
  Pressable,
  TextInput,
  Alert
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const { width, height: SCREEN_HEIGHT } = Dimensions.get('window');
const OUTER_WIDTH = Math.floor(width * 0.9);
const LOGO_SIZE = 140; // per spec

const SP = {
  xs: 8,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
};

export default function OnboardingStart() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [sheetVisible, setSheetVisible] = useState(false);
  const [isExistingUser, setIsExistingUser] = useState(false); // track which sheet to show
  const [existingEmail, setExistingEmail] = useState('');
  const [showExistingInput, setShowExistingInput] = useState(false);

  const sheetHeightRef = useRef<number>(460);
  const sheetTranslateY = useRef(new RNAnimated.Value(sheetHeightRef.current)).current;
  const overlayOpacity = useRef(new RNAnimated.Value(0)).current;

  const [BlurViewComponent, setBlurViewComponent] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const mod: any = await import('expo-blur');
        const Blur = mod?.BlurView || mod?.default || null;
        if (mounted && Blur) setBlurViewComponent(() => Blur);
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, []);

  function handleGetStarted() {
    router.push('/onboarding/name' as any);
  }

  const openSheet = (existingUser = false) => {
    setIsExistingUser(existingUser);
    setSheetVisible(true);
    overlayOpacity.setValue(0);
    sheetTranslateY.setValue(sheetHeightRef.current);
    RNAnimated.parallel([
      RNAnimated.timing(overlayOpacity, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
      RNAnimated.timing(sheetTranslateY, {
        toValue: 0,
        duration: 320,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeSheet = () => {
    RNAnimated.parallel([
      RNAnimated.timing(overlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      RNAnimated.timing(sheetTranslateY, {
        toValue: sheetHeightRef.current,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setSheetVisible(false);
      setShowExistingInput(false);
      setExistingEmail('');
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        const dy = Math.max(0, gestureState.dy);
        sheetTranslateY.setValue(dy);
        overlayOpacity.setValue(Math.max(0, 1 - dy / sheetHeightRef.current));
      },
      onPanResponderRelease: (evt, gestureState) => {
        const dy = gestureState.dy;
        const vy = gestureState.vy || 0;
        if (dy > 120 || vy > 0.8) {
          closeSheet();
        } else {
          RNAnimated.parallel([
            RNAnimated.timing(overlayOpacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
            RNAnimated.timing(sheetTranslateY, {
              toValue: 0,
              duration: 220,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
    })
  ).current;

  const handleAuthSuccess = async (token: string, onboarded: boolean) => {
    try {
      await SecureStore.setItemAsync('session_token', token);
      if (onboarded) {
        await AsyncStorage.setItem('isLoggedIn', 'true');
        router.replace('/(tabs)');
      } else {
        // new user: go to setup screen to save onboarding data
        // Don't set isLoggedIn yet - setup screen will set it after saving data
        router.push('/onboarding/setup');
      }
    } catch (e) {
      console.error('handleAuthSuccess error', e);
    }
  };

  const handleGooglePress = async () => {
    try {
      const BACKEND = Constants.expoConfig?.extra?.BACKEND_URL ?? 'http://localhost:3000';
      const authUrl = `${BACKEND}/api/auth/google/initiate`;

      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        Linking.createURL('/')
      );

      if (result.type === 'success' && result.url) {
        const parsed = Linking.parse(result.url);
        const token = parsed.queryParams?.token as string;
        const onboarded = parsed.queryParams?.onboarded === 'true';
        
        if (token) {
          await handleAuthSuccess(token, onboarded);
        }
      } else if (result.type === 'cancel') {
        Alert.alert('Sign-in cancelled', 'You cancelled the sign-in flow.');
      }
    } catch (e) {
      console.error('handleGooglePress error', e);
      Alert.alert('Sign-in error', 'Unable to start Google sign-in. See console for details.');
    }
  };

  const checkExistingAccount = async (email: string) => {
    try {
      const BACKEND = Constants.expoConfig?.extra?.BACKEND_URL ?? 'http://localhost:3000';
      const res = await fetch(`${BACKEND}/api/auth/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.exists) {
          handleGooglePress();
        } else {
          handleGooglePress();
        }
      } else {
        console.warn('check failed', data);
      }
    } catch (e) {
      console.error('checkExistingAccount error', e);
    }
  };

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
                    <TouchableOpacity style={styles.existingButtonInner} onPress={() => openSheet(true)} activeOpacity={0.85}>
                      <Text style={styles.existingButtonText}>Add an existing account</Text>
                    </TouchableOpacity>
                  </View>
                </IOSBordersWrapper>
              </View>
            </View>
          </View>
        </View>

        {/* Auth Bottom Sheet */}
        {sheetVisible && (
          <>
            <RNAnimated.View
              pointerEvents="auto"
              style={[StyleSheet.absoluteFill, { zIndex: 998, opacity: overlayOpacity }]}
            >
              {BlurViewComponent ? (
                <BlurViewComponent intensity={50} tint="dark" style={StyleSheet.absoluteFill}>
                  <LinearGradient
                    colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.4)', 'transparent']}
                    style={StyleSheet.absoluteFill}
                  />
                </BlurViewComponent>
              ) : (
                <LinearGradient
                  colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.4)', 'transparent']}
                  style={StyleSheet.absoluteFill}
                />
              )}
            </RNAnimated.View>

            <TouchableWithoutFeedback onPress={closeSheet}>
              <View pointerEvents="box-only" style={[StyleSheet.absoluteFill, { zIndex: 999 }]} />
            </TouchableWithoutFeedback>

            <RNAnimated.View
              {...panResponder.panHandlers}
              onLayout={(e) => {
                const h = e.nativeEvent.layout.height;
                if (h && sheetHeightRef.current !== h) {
                  sheetHeightRef.current = h;
                  sheetTranslateY.setValue(h);
                  RNAnimated.timing(sheetTranslateY, {
                    toValue: 0,
                    duration: 260,
                    useNativeDriver: true,
                  }).start();
                }
              }}
              style={[
                styles.sheetContainer,
                {
                  paddingBottom: SP.lg + insets.bottom,
                  transform: [{ translateY: sheetTranslateY }],
                  zIndex: 1000,
                },
              ]}
            >
              <View style={styles.authSection}>
                <View style={styles.sheetHeader}>
                  <View style={styles.tabBar} />
                  <Text style={styles.sheetHeading}>
                    {isExistingUser ? 'Sign in to existing account' : 'Sign in to continue'}
                  </Text>
                  <Text style={styles.sheetSubheading}>
                    {isExistingUser 
                      ? 'Sign in with the account you already have'
                      : 'Choose how you wanna roll with 6 7'
                    }
                  </Text>
                </View>

                <View style={styles.buttonContainer}>
                  <Pressable style={styles.authButton} onPress={handleGooglePress}>
                    <Image
                      source={require('../../assets/icon/google.png')}
                      style={styles.iconImage}
                    />
                    <Text style={styles.authButtonText}>Continue with Google</Text>
                  </Pressable>

                  <Pressable style={[styles.authButton, { marginTop: 14 }]}>
                    <Image
                      source={require('../../assets/icon/apple.png')}
                      style={styles.iconImage}
                    />
                    <Text style={styles.authButtonText}>Continue with Apple</Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.termsSection}>
                <Text style={styles.termsText}>
                  By continuing, you accept our{' '}
                  <Text style={styles.termsLink} onPress={() => router.push('/terms')}>
                    Terms
                  </Text>
                  {' & '}
                  <Text style={styles.termsLink} onPress={() => router.push('/privacy')}>
                    Privacy Policy
                  </Text>
                </Text>
              </View>
            </RNAnimated.View>
          </>
        )}
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
  // Auth Sheet Styles
  sheetContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#151515',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 28,
    paddingTop: SP.lg,
  },
  authSection: { gap: 20 },
  sheetHeader: { alignItems: 'center', marginBottom: 20 },
  tabBar: {
    width: 56,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginBottom: 14,
  },
  sheetHeading: { color: '#FFFFFF', fontSize: 22, fontWeight: '700' },
  sheetSubheading: { color: '#FFFFFF', fontSize: 16, opacity: 0.75, marginTop: 6 },
  buttonContainer: { paddingTop: 8 },
  authButton: {
    width: '100%',
    backgroundColor: '#222222',
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: 18,
  },
  iconImage: { width: 24, height: 24, marginRight: 12 },
  authButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  existingInput: {
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    color: '#FFFFFF',
    fontSize: 16,
  },
  termsSection: { paddingTop: 12 },
  termsText: { color: '#888888', fontSize: 12, textAlign: 'center' },
  termsLink: { color: '#FFE0C2', textDecorationLine: 'underline' },
});
