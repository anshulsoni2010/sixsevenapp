import React, { useEffect, useState, useRef } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Pressable,
    Dimensions,
    Platform,
    Animated as RNAnimated,
    PanResponder,
    TextInput,
    TouchableWithoutFeedback,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar as RNStatusBar } from 'react-native';
import Reanimated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import OnboardingHeader from '../OnboardingHeader';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const OUTER_WIDTH = Math.round(SCREEN_WIDTH * 0.9);

const SP = {
    xs: 8,
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48,
};

export default function AlphaConfirmScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [selectedAlpha, setSelectedAlpha] = useState<string | null>(null);
    const [sheetVisible, setSheetVisible] = useState(false);
    const [isAuthInProgress, setIsAuthInProgress] = useState(false);

    // Configure Google Sign-In
    useEffect(() => {
        GoogleSignin.configure({
            webClientId: Constants.expoConfig?.extra?.GOOGLE_WEB_CLIENT_ID,
            iosClientId: Constants.expoConfig?.extra?.GOOGLE_IOS_CLIENT_ID,
            offlineAccess: true,
        });
    }, []);

    const sheetHeightRef = useRef<number>(460);
    const sheetTranslateY = useRef(new RNAnimated.Value(sheetHeightRef.current)).current;
    const overlayOpacity = useRef(new RNAnimated.Value(0)).current;

    const openSheet = async () => {
        // Save alpha level to AsyncStorage before opening auth sheet
        if (selectedAlpha) {
            try {
                const existing = await AsyncStorage.getItem('onboarding');
                const obj = existing ? JSON.parse(existing) : {};
                obj.alphaLevel = selectedAlpha;
                await AsyncStorage.setItem('onboarding', JSON.stringify(obj));
            } catch (e) {
                console.error('Error saving alpha level:', e);
            }
        }

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
        ]).start(() => setSheetVisible(false));
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

    // Server-side OAuth flow: open backend initiate endpoint in browser
    const [existingEmail, setExistingEmail] = useState('');
    const [showExistingInput, setShowExistingInput] = useState(false);

    // Listen for deep link callback from OAuth flow
    useEffect(() => {
        const handleUrl = ({ url }: { url: string }) => {
            console.log('Deep link received:', url);
            const parsed = Linking.parse(url);
            const token = parsed.queryParams?.token as string;
            const onboarded = parsed.queryParams?.onboarded === 'true';
            const error = parsed.queryParams?.error as string;

            if (error) {
                Alert.alert('Sign-in error', 'Google sign-in was cancelled or failed.');
                return;
            }

            if (token) {
                handleAuthSuccess(token, onboarded);
            }
        };

        const subscription = Linking.addEventListener('url', handleUrl);

        // Check if app was opened with a URL (cold start)
        Linking.getInitialURL().then((url) => {
            if (url) handleUrl({ url });
        });

        return () => subscription.remove();
    }, []);

    const handleAuthSuccess = async (token: string, onboarded: boolean) => {
        try {
            console.log('handleAuthSuccess: onboarded =', onboarded);
            // Store token in SecureStore for native clients
            await SecureStore.setItemAsync('session_token', token);
            await AsyncStorage.setItem('isLoggedIn', 'true');

            if (onboarded) {
                // User already onboarded - check subscription and route accordingly
                console.log('handleAuthSuccess: user already onboarded, checking subscription...');
                const BACKEND = Constants.expoConfig?.extra?.BACKEND_URL ?? 'http://localhost:3000';
                const response = await fetch(`${BACKEND}/api/user/me`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.subscribed) {
                        console.log('handleAuthSuccess: user subscribed, going to chat');
                        router.replace('/chat');
                    } else {
                        console.log('handleAuthSuccess: user not subscribed, going to paywall');
                        router.replace('/paywall');
                    }
                } else {
                    // Error - default to paywall
                    console.log('handleAuthSuccess: error checking subscription, going to paywall');
                    router.replace('/paywall');
                }
            } else {
                console.log('handleAuthSuccess: new user, going to setup screen');
                // new user: go to setup screen to save onboarding data
                router.push('/onboarding/setup');
            }
        } catch (e) {
            console.error('handleAuthSuccess error', e);
        }
    };

    const handleGooglePress = async () => {
        if (isAuthInProgress) {
            console.log('Auth already in progress, ignoring click');
            return;
        }

        try {
            setIsAuthInProgress(true);

            // Check if Google Play Services are available (Android only)
            await GoogleSignin.hasPlayServices();

            // Sign in with Google
            const userInfo = await GoogleSignin.signIn();
            console.log('Google Sign-In success:', userInfo);

            // Get the ID token
            const tokens = await GoogleSignin.getTokens();
            console.log('Google tokens:', tokens);

            // Send the ID token to your backend
            const BACKEND = Constants.expoConfig?.extra?.BACKEND_URL ?? 'http://localhost:3000';
            const response = await fetch(`${BACKEND}/api/auth/google/callback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    idToken: tokens.idToken,
                    accessToken: tokens.accessToken,
                }),
            });

            if (!response.ok) {
                throw new Error(`Backend auth failed: ${response.status}`);
            }

            const data = await response.json();
            console.log('Backend auth response:', data);

            if (data.token) {
                await handleAuthSuccess(data.token, data.onboarded);
            } else {
                throw new Error('No token received from backend');
            }

        } catch (error: any) {
            console.error('Google Sign-In error:', error);

            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                Alert.alert('Sign-in cancelled', 'You cancelled the sign-in flow.');
            } else if (error.code === statusCodes.IN_PROGRESS) {
                Alert.alert('Sign-in in progress', 'Please wait for the current sign-in to complete.');
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                Alert.alert('Google Play Services', 'Google Play Services are not available on this device.');
            } else {
                Alert.alert('Sign-in error', 'Unable to sign in with Google. Please try again.');
            }
        } finally {
            setIsAuthInProgress(false);
        }
    };

    const handleApplePress = async () => {
        if (isAuthInProgress) {
            console.log('Auth already in progress, ignoring click');
            return;
        }

        try {
            setIsAuthInProgress(true);
            const BACKEND = Constants.expoConfig?.extra?.BACKEND_URL ?? 'http://localhost:3000';
            const authUrl = `${BACKEND}/api/auth/apple/initiate`;

            console.log('Opening Apple OAuth flow:', authUrl);

            const result = await WebBrowser.openAuthSessionAsync(
                authUrl,
                Linking.createURL('/')
            );

            console.log('Apple WebBrowser result:', result);

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
            console.error('handleApplePress error', e);
            Alert.alert('Sign-in error', 'Unable to start Apple sign-in. See console for details.');
        } finally {
            setIsAuthInProgress(false);
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
                // If exists, prompt the user to sign in with Google to complete login.
                if (data.exists) {
                    // quick UX: tell user and open Google prompt
                    // Auto-open Google sign-in so they can authenticate
                    handleGooglePress();
                } else {
                    // Not found: offer to create via Google sign in
                    handleGooglePress();
                }
            } else {
                console.warn('check failed', data);
            }
        } catch (e) {
            console.error('checkExistingAccount error', e);
        }
    };

    const opacity = useSharedValue(1);
    const translateY = useSharedValue(0);
    const aStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }));

    return (
        <SafeAreaView edges={['top']} style={styles.safeArea}>
            {Platform.OS === 'android' && (
                <RNStatusBar backgroundColor="#111111" barStyle="light-content" />
            )}

            <Reanimated.View style={[styles.screen, aStyle]}>
                <View style={styles.contentWrapper}>
                    <View style={styles.contentContainer}>
                        <OnboardingHeader
                            step={4}
                            totalSteps={4}
                            onBack={() => router.back()}
                            title="How alpha I wanna be?"
                            subtitle="Select 1x to 4x — how much Alpha you feeling?"
                        />
                        <View style={styles.inputWrapper}>
                            <View style={styles.optionsContainer}>
                                {['1x', '2x', '3x', '4x'].map((o) => (
                                    <Pressable
                                        key={o}
                                        onPress={() => setSelectedAlpha(o)}
                                        style={[
                                            styles.option,
                                            selectedAlpha === o && styles.optionSelected,
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.optionText,
                                                selectedAlpha === o && styles.optionTextSelected,
                                            ]}
                                        >
                                            {o}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>
                    </View>
                </View>

                <View style={[styles.bottomContainer, { paddingBottom: SP.md + insets.bottom }]}>
                    <View style={styles.confirmButtonWrapper}>
                        <Pressable 
                            style={[
                                styles.confirmButtonInner,
                                !selectedAlpha && styles.confirmButtonDisabled
                            ]} 
                            onPress={openSheet}
                            disabled={!selectedAlpha}
                        >
                            <Text style={styles.confirmButtonText}>Confirm</Text>
                        </Pressable>
                    </View>
                </View>
            </Reanimated.View>

            {sheetVisible && (
                <>
                    {/* Blur + Gradient Overlay */}
                    <RNAnimated.View
                        pointerEvents="auto"
                        style={[StyleSheet.absoluteFill, { zIndex: 998, opacity: overlayOpacity }]}
                    >
                        {BlurViewComponent ? (
                            <BlurViewComponent intensity={50} tint="dark" style={StyleSheet.absoluteFill}>
                                <LinearGradient
                                    colors={[
                                        'rgba(0,0,0,0.6)',
                                        'rgba(0,0,0,0.4)',
                                        'transparent',
                                    ]}
                                    style={StyleSheet.absoluteFill}
                                />
                            </BlurViewComponent>
                        ) : (
                            <LinearGradient
                                colors={[
                                    'rgba(0,0,0,0.6)',
                                    'rgba(0,0,0,0.4)',
                                    'transparent',
                                ]}
                                style={StyleSheet.absoluteFill}
                            />
                        )}
                    </RNAnimated.View>

                    <TouchableWithoutFeedback onPress={closeSheet}>
                        <View pointerEvents="box-only" style={[StyleSheet.absoluteFill, { zIndex: 999 }]} />
                    </TouchableWithoutFeedback>

                    {/* Bottom Sheet */}
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
                                <Text style={styles.sheetHeading}>Sign in to continue</Text>
                                <Text style={styles.sheetSubheading}>
                                    Choose how you wanna roll with 6 7
                                </Text>
                            </View>

                            <View style={styles.buttonContainer}>
                                <Pressable style={styles.authButton} onPress={handleGooglePress}>
                                    <Image
                                        source={require('../../../assets/icon/google.png')}
                                        style={styles.iconImage}
                                    />
                                    <Text style={styles.authButtonText}>
                                        Continue with Google
                                    </Text>
                                </Pressable>

                                <Pressable style={[styles.authButton, { marginTop: 14 }]} onPress={handleApplePress}>
                                    <Image
                                        source={require('../../../assets/icon/apple.png')}
                                        style={styles.iconImage}
                                    />
                                    <Text style={styles.authButtonText}>Continue with Apple</Text>
                                </Pressable>
                            </View>
                        </View>

                        <View style={styles.termsSection}>
                            <Text style={styles.termsText}>
                                By continuing, you accept our{' '}
                                <Text style={styles.termsLink} onPress={() => router.push('/terms' as any)}>
                                    Terms
                                </Text>
                                {' & '}
                                <Text style={styles.termsLink} onPress={() => router.push('/privacy' as any)}>
                                    Privacy Policy
                                </Text>
                            </Text>
                        </View>
                    </RNAnimated.View>
                </>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#111111' },
    screen: { flex: 1, alignItems: 'center', justifyContent: 'space-between' },
    contentWrapper: { width: '100%', alignItems: 'center', paddingTop: SP.lg },
    contentContainer: { width: OUTER_WIDTH },
    inputWrapper: { marginBottom: SP.xl },
    optionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: SP.sm,
    },
    option: {
        flexBasis: '48%',
        marginBottom: SP.md,
        paddingVertical: 22,
        borderRadius: 16,
        backgroundColor: '#141414',
        borderWidth: 2,
        borderColor: '#191919',
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionSelected: { backgroundColor: '#1E1E1E', borderColor: '#FFE0C2' },
    optionText: { color: '#fff', fontSize: 22, fontWeight: '700' },
    optionTextSelected: { color: '#FFE0C2' },
    bottomContainer: {
        width: '100.5%',
        paddingTop: SP.lg,
        paddingHorizontal: SP.sm,
        borderColor: '#1B1B1B',
        borderWidth: 1,
        borderTopRightRadius: 18,
        borderTopLeftRadius: 18,
    },
    confirmButtonWrapper: {
        width: OUTER_WIDTH,
        borderRadius: 18,
        padding: 2,
        backgroundColor: 'rgba(255,224,194,0.9)',
    },
    confirmButtonInner: {
        width: '100%',
        height: 58,
        borderRadius: 16,
        backgroundColor: '#FFE0C2',
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmButtonDisabled: {
        backgroundColor: '#444444',
        opacity: 0.5,
    },
    confirmButtonText: { color: '#000000', fontSize: 22, fontWeight: '600' },
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
    iconImage: { width: 24, height: 24, marginRight: 12, resizeMode: 'contain' },
    authButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
        flex: 1,
        textAlign: 'center',
    },
    termsSection: { paddingHorizontal: 12, paddingTop: 16, marginBottom: 6 },
    termsText: { color: '#999999', fontSize: 12.5, textAlign: 'center', lineHeight: 18 },
    termsLink: { color: '#FFE0C2', textDecorationLine: 'underline' },
    existingInput: {
        height: 48,
        borderRadius: 12,
        backgroundColor: '#0F0F0F',
        paddingHorizontal: 12,
        color: '#fff',
    },
});
