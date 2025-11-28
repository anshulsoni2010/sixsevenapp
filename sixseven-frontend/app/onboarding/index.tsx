// OnboardingStart.tsx (fixed)
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
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';

// Google Sign-In imports (dynamic)
let GoogleSignin: any = null;
let statusCodes: any = null;
if (Platform.OS !== 'web') {
  try {
    const googleSigninModule = require('@react-native-google-signin/google-signin');
    GoogleSignin = googleSigninModule.GoogleSignin;
    statusCodes = googleSigninModule.statusCodes;
  } catch (error) {
    console.warn('Google Sign-In not available:', error);
  }
}

const { width, height: SCREEN_HEIGHT } = Dimensions.get('window');
const OUTER_WIDTH = Math.floor(width * 0.9);
const LOGO_SIZE = 140;

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
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [existingEmail, setExistingEmail] = useState('');
  const [showExistingInput, setShowExistingInput] = useState(false);
  const [isAuthInProgress, setIsAuthInProgress] = useState(false);

  // animated values
  const sheetHeightRef = useRef<number>(460);
  const sheetTranslateY = useRef(new RNAnimated.Value(sheetHeightRef.current)).current;
  const overlayOpacity = useRef(new RNAnimated.Value(0)).current;

  // scale for whole card (number). Keep numeric, update via setScale
  const [scale, setScale] = useState<number>(1);

  // keep a ref for auth-in-progress to avoid stale closures
  const isAuthInProgressRef = useRef(false);
  useEffect(() => { isAuthInProgressRef.current = isAuthInProgress; }, [isAuthInProgress]);

  // Blur view (dynamic import)
  const [BlurViewComponent, setBlurViewComponent] = useState<any>(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const mod: any = await import('expo-blur');
        const Blur = mod?.BlurView || mod?.default || null;
        if (mounted && Blur) setBlurViewComponent(() => Blur);
      } catch (e) {
        // no-op
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Configure Google Sign-In if native module present
  useEffect(() => {
    if (GoogleSignin) {
      GoogleSignin.configure({
        webClientId: Constants.expoConfig?.extra?.GOOGLE_WEB_CLIENT_ID,
        iosClientId: Constants.expoConfig?.extra?.GOOGLE_IOS_CLIENT_ID,
        offlineAccess: true,
      });
    }
  }, []);

  // OAuth redirect handling
  useEffect(() => {
    const handleUrl = async (url?: string | null) => {
      if (!url) return;
      try {
        const parsed = Linking.parse(url);
        let token = parsed.queryParams?.token as string | undefined;
        let onboarded = parsed.queryParams?.onboarded === 'true';

        if (!token && url.includes('token=')) {
          const match = url.match(/[?&]token=([^&]+)/);
          if (match) token = decodeURIComponent(match[1]);
          const onboardedMatch = url.match(/[?&]onboarded=([^&]+)/);
          if (onboardedMatch) onboarded = onboardedMatch[1] === 'true';
        }

        if (token) {
          await handleAuthSuccess(token, onboarded);
        }
      } catch (e) {
        console.error('Error processing redirect URL:', e);
      }
    };

    const subscription = Linking.addEventListener?.('url', (event: { url: string }) => {
      handleUrl(event.url);
    });

    // initial URL if app cold-started from link
    Linking.getInitialURL().then((initial) => {
      if (initial) handleUrl(initial);
    }).catch((e) => {
      console.warn('getInitialURL error', e);
    });

    return () => {
      try {
        if (subscription && typeof subscription.remove === 'function') subscription.remove();
      } catch { }
    };
  }, []);

  const openSheet = (existingUser = false) => {
    setIsExistingUser(existingUser);
    setSheetVisible(true);
    // reset animated values
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
      setIsAuthInProgress(false);
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 5,
      onPanResponderMove: (_evt, gestureState) => {
        const dy = Math.max(0, gestureState.dy);
        sheetTranslateY.setValue(dy);
        const newOpacity = Math.max(0, 1 - dy / Math.max(1, sheetHeightRef.current));
        overlayOpacity.setValue(newOpacity);
      },
      onPanResponderRelease: (_evt, gestureState) => {
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
      await AsyncStorage.setItem('isLoggedIn', 'true');

      if (onboarded) {
        const BACKEND = Constants.expoConfig?.extra?.BACKEND_URL ?? 'http://localhost:3000';
        const response = await fetch(`${BACKEND}/api/user/me`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.subscribed) {
            router.replace('/chat');
          } else {
            router.replace('/paywall');
          }
        } else {
          router.replace('/paywall');
        }
      } else {
        router.push('/onboarding/setup');
      }
    } catch (e) {
      console.error('handleAuthSuccess error', e);
      router.replace('/paywall');
    }
  };

  const handleGooglePress = async () => {
    if (isAuthInProgressRef.current) return;

    try {
      setIsAuthInProgress(true);
      isAuthInProgressRef.current = true;

      const isExpoGo = Constants.executionEnvironment === 'storeClient';

      if (!GoogleSignin || isExpoGo) {
        const BACKEND = Constants.expoConfig?.extra?.BACKEND_URL ?? 'http://localhost:3000';
        const redirectUri = Linking.createURL('/');
        const authUrl = `${BACKEND}/api/auth/google/initiate?redirect_uri=${encodeURIComponent(redirectUri)}`;

        try {
          await Linking.openURL(authUrl);
        } catch (browserError) {
          Alert.alert('Browser error', `Failed to open browser: ${browserError instanceof Error ? browserError.message : 'Unknown error'}`);
          setIsAuthInProgress(false);
          isAuthInProgressRef.current = false;
          return;
        }

        // fallback timeout
        setTimeout(() => {
          if (isAuthInProgressRef.current) {
            setIsAuthInProgress(false);
            isAuthInProgressRef.current = false;
            Alert.alert('Sign-in timeout', 'Authentication took too long. Please try again.');
          }
        }, 120000);

        return;
      }

      // native google flow
      if (Platform.OS === 'android') {
        await GoogleSignin.hasPlayServices();
      }

      const signInPromise = GoogleSignin.signIn();
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Google Sign-In timed out')), 30000);
      });

      const userInfo = await Promise.race([signInPromise, timeoutPromise]);
      await AsyncStorage.setItem('user', JSON.stringify(userInfo));

      const tokens = await GoogleSignin.getTokens();

      const BACKEND = Constants.expoConfig?.extra?.BACKEND_URL ?? 'http://localhost:3000';
      const fetchPromise = fetch(`${BACKEND}/api/auth/google/callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken: tokens.idToken,
          accessToken: tokens.accessToken,
        }),
      });

      const fetchTimeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Backend request timed out')), 15000);
      });

      const response = await Promise.race([fetchPromise, fetchTimeoutPromise]) as Response;
      if (!response.ok) throw new Error(`Backend auth failed: ${response.status}`);
      const data = await response.json();

      if (data.token) {
        await handleAuthSuccess(data.token, data.onboarded);
      } else {
        throw new Error('No token received from backend');
      }
    } catch (error: any) {
      console.error('Google Sign-In error:', error);
      Alert.alert('Sign-in error', `Google sign-in failed: ${error?.message || 'Unknown error'}`);
    } finally {
      setIsAuthInProgress(false);
      isAuthInProgressRef.current = false;
    }
  };

  const handleApplePress = async () => {
    if (isAuthInProgressRef.current) return;
    try {
      setIsAuthInProgress(true);
      isAuthInProgressRef.current = true;

      const BACKEND = Constants.expoConfig?.extra?.BACKEND_URL ?? 'http://localhost:3000';
      const authUrl = `${BACKEND}/api/auth/apple/initiate`;

      const result = await WebBrowser.openAuthSessionAsync(authUrl, Linking.createURL('/'));
      if (result.type === 'success' && result.url) {
        const parsed = Linking.parse(result.url);
        const token = parsed.queryParams?.token as string;
        const onboarded = parsed.queryParams?.onboarded === 'true';
        if (token) await handleAuthSuccess(token, onboarded);
      } else if (result.type === 'cancel') {
        Alert.alert('Sign-in cancelled', 'You cancelled the sign-in flow.');
      }
    } catch (e) {
      console.error('handleApplePress error', e);
      Alert.alert('Sign-in error', 'Unable to start Apple sign-in. See console for details.');
    } finally {
      setIsAuthInProgress(false);
      isAuthInProgressRef.current = false;
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
      if (!res.ok) console.warn('check failed', data);
      // both paths currently go to Google - preserve your original logic
      handleGooglePress();
    } catch (e) {
      console.error('checkExistingAccount error', e);
    }
  };

  // Email OTP state
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!email || !email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    setIsEmailLoading(true);
    try {
      const BACKEND = Constants.expoConfig?.extra?.BACKEND_URL ?? 'http://localhost:3000';
      const response = await fetch(`${BACKEND}/api/auth/email/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        setShowEmailInput(false);
        setShowOtpInput(true);
        Alert.alert('Success', 'Code sent to your email!');
      } else {
        Alert.alert('Error', data.error || 'Failed to send code');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 6) {
      Alert.alert('Error', 'Please enter the 6-digit code');
      return;
    }
    setIsEmailLoading(true);
    try {
      const BACKEND = Constants.expoConfig?.extra?.BACKEND_URL ?? 'http://localhost:3000';
      const response = await fetch(`${BACKEND}/api/auth/email/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token: otp }),
      });
      const data = await response.json();
      if (response.ok) {
        await handleAuthSuccess(data.token, data.onboarded);
      } else {
        Alert.alert('Error', data.error || 'Invalid code');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setIsEmailLoading(false);
    }
  };

  // layout measuring: compute scale when wrapper layout measured
  const onWrapperLayout = (e: any) => {
    const h = e.nativeEvent.layout.height || 0;
    if (h > 0) {
      const s = Math.min(1, SCREEN_HEIGHT / h);
      // ensure finite number
      const final = Number.isFinite(s) ? s : 1;
      setScale(final);
    }
  };

  function handleGetStarted() {
    router.push('/onboarding/name' as any);
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right"]}>
      <LinearGradient colors={['#4D3A28', '#000000', '#000000']} locations={[0, 0.35, 1]} style={styles.gradient}>
        <View
          style={[styles.scaleWrapper, { width: OUTER_WIDTH }]}
          onLayout={onWrapperLayout}
        >
          {/*
            Use Animated.View for the card that receives a transform.
            Animated.View accepts numeric scale reliably and avoids transform errors.
          */}
          <RNAnimated.View style={[styles.card, { transform: [{ scale: Number.isFinite(scale) ? scale : 1 }] }]}>
            <View style={styles.topContainer}>
              <View style={styles.logoWrapper}>
                <Image
                  source={require('../../assets/images/splashlogo.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>

              <Image
                source={require('../../assets/images/onboardingstartchatdemoimg.png')}
                style={styles.secondContainer}
                resizeMode="contain"
              />

              <View style={styles.textBlock}>
                <Text style={styles.headline}>{`Talk the Alpha,\nWalk the Alpha`}</Text>
                <Text style={styles.subtext}>
                  Just write me your own way or send your chat ss, I&apos;ll convert you in Gen Alpha way.
                </Text>
              </View>
            </View>

            <View style={styles.bottomContainer}>
              <View style={styles.thirdContainer}>
                <View style={styles.alphaButtonWrapper}>
                  <TouchableOpacity style={styles.alphaButtonInner} onPress={handleGetStarted} activeOpacity={0.85}>
                    <Text style={styles.alphaButtonText}>Let’s Be Alpha</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.existingButtonWrapper}>
                  <TouchableOpacity style={styles.existingButtonInner} onPress={() => openSheet(true)} activeOpacity={0.85}>
                    <Text style={styles.existingButtonText}>Add an existing account</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </RNAnimated.View>
        </View>

        {sheetVisible && (
          <>
            <TouchableWithoutFeedback onPress={closeSheet}>
              <RNAnimated.View
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
            </TouchableWithoutFeedback>

            <RNAnimated.View
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
                  elevation: 10,
                },
              ]}
              {...panResponder.panHandlers}
            >
              <View style={{ flex: 1, backgroundColor: '#151515' }} pointerEvents="auto">
                {!showEmailInput && !showOtpInput && (
                  <>
                    <View style={styles.authSection} pointerEvents="auto">
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

                      <View style={styles.buttonContainer} pointerEvents="auto">
                        <TouchableOpacity
                          style={[styles.authButton, isAuthInProgress && styles.authButtonDisabled]}
                          onPress={handleGooglePress}
                          disabled={isAuthInProgress}
                          activeOpacity={0.7}
                        >
                          {isAuthInProgress ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                          ) : (
                            <Image
                              source={require('../../assets/icon/google.png')}
                              style={styles.iconImage}
                            />
                          )}
                          <Text style={styles.authButtonText}>
                            {isAuthInProgress ? 'Signing in...' : 'Continue with Google'}
                          </Text>
                        </TouchableOpacity>

                        {isAuthInProgress && (
                          <TouchableOpacity
                            style={[styles.authButton, styles.cancelButton]}
                            onPress={() => {
                              setIsAuthInProgress(false);
                              isAuthInProgressRef.current = false;
                              console.log('User cancelled Google Sign-In');
                            }}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                          </TouchableOpacity>
                        )}

                        <TouchableOpacity style={[styles.authButton, { marginTop: 14 }]} onPress={handleApplePress} activeOpacity={0.7}>
                          <Image
                            source={require('../../assets/icon/apple.png')}
                            style={styles.iconImage}
                          />
                          <Text style={styles.authButtonText}>Continue with Apple</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.authButton, { marginTop: 14, backgroundColor: '#222', borderWidth: 1, borderColor: '#333' }]}
                          onPress={() => setShowEmailInput(true)}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="mail-outline" size={24} color="#fff" />
                          <Text style={[styles.authButtonText, { color: '#fff' }]}>Continue with Email</Text>
                        </TouchableOpacity>
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
                  </>
                )}

                {showEmailInput && (
                  <View style={styles.authSection}>
                    <View style={styles.sheetHeader}>
                      <View style={styles.tabBar} />
                      <Text style={styles.sheetHeading}>Enter your email</Text>
                      <Text style={styles.sheetSubheading}>We'll send you a code to sign in</Text>
                    </View>

                    <View style={{ gap: 16, paddingTop: 8 }} pointerEvents="auto">
                      <TextInput
                        style={{
                          backgroundColor: '#222',
                          color: '#fff',
                          padding: 18,
                          borderRadius: 14,
                          fontSize: 18,
                          fontFamily: 'Outfit_400Regular',
                          borderWidth: 1,
                          borderColor: '#333'
                        }}
                        placeholder="name@example.com"
                        placeholderTextColor="#666"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        autoFocus
                      />

                      <TouchableOpacity
                        onPress={handleSendOtp}
                        disabled={isEmailLoading}
                        activeOpacity={0.8}
                        style={[styles.authButton, { backgroundColor: '#FFE0C2', marginTop: 8 }]}
                      >
                        {isEmailLoading ? (
                          <ActivityIndicator color="#000" />
                        ) : (
                          <Text style={[styles.authButtonText, { color: '#000' }]}>Send Code</Text>
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => setShowEmailInput(false)}
                        style={{ alignItems: 'center', padding: 12 }}
                      >
                        <Text style={{ color: '#666', fontFamily: 'Outfit_400Regular', fontSize: 16 }}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {showOtpInput && (
                  <View style={styles.authSection}>
                    <View style={styles.sheetHeader}>
                      <View style={styles.tabBar} />
                      <Text style={styles.sheetHeading}>Check your email</Text>
                      <Text style={styles.sheetSubheading}>
                        We sent a code to <Text style={{ color: '#fff' }}>{email}</Text>
                      </Text>
                    </View>

                    <View style={{ gap: 16, paddingTop: 8 }} pointerEvents="auto">
                      <TextInput
                        style={{
                          backgroundColor: '#222',
                          color: '#fff',
                          padding: 18,
                          borderRadius: 14,
                          fontSize: 32,
                          textAlign: 'center',
                          letterSpacing: 8,
                          fontFamily: 'Outfit_600SemiBold',
                          borderWidth: 1,
                          borderColor: '#333'
                        }}
                        placeholder="000000"
                        placeholderTextColor="#444"
                        value={otp}
                        onChangeText={setOtp}
                        keyboardType="number-pad"
                        maxLength={6}
                        autoFocus
                      />

                      <TouchableOpacity
                        onPress={handleVerifyOtp}
                        disabled={isEmailLoading}
                        activeOpacity={0.8}
                        style={[styles.authButton, { backgroundColor: '#FFE0C2', marginTop: 8 }]}
                      >
                        {isEmailLoading ? (
                          <ActivityIndicator color="#000" />
                        ) : (
                          <Text style={[styles.authButtonText, { color: '#000' }]}>Verify</Text>
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => { setShowOtpInput(false); setShowEmailInput(true); }}
                        style={{ alignItems: 'center', padding: 12 }}
                      >
                        <Text style={{ color: '#666', fontFamily: 'Outfit_400Regular', fontSize: 16 }}>Back</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  topContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 30,
    marginBottom: 48,
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  textBlock: {
    width: '100%',
    alignItems: 'center',
    gap: 20,
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
    gap: 30,
  },
  secondContainer: {
    width: '100%',
    height: 250,
  },
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
    gap: 16,
  },
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
  alphaButtonText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 18,
    color: '#111111',
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
  sheetSubheading: { color: '#FFFFFF', fontSize: 16, opacity: 0.75, marginTop: 6, textAlign: 'center' },
  buttonContainer: { paddingTop: 8 },
  authButton: {
    width: '100%',
    backgroundColor: '#222222',
    height: 56,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  authButtonDisabled: {
    opacity: 0.7,
  },
  authButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Outfit_600SemiBold',
  },
  iconImage: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  cancelButton: {
    marginTop: 12,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#333',
  },
  cancelButtonText: {
    color: '#999',
    fontSize: 16,
    fontFamily: 'Outfit_500Medium',
  },
  termsSection: {
    marginTop: 24,
    alignItems: 'center',
  },
  termsText: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    fontFamily: 'Outfit_400Regular',
  },
  termsLink: {
    color: '#FFFFFF',
    textDecorationLine: 'underline',
  },
});
