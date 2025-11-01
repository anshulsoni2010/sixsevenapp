import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Pressable,
    Dimensions,
    Platform,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import OnboardingHeader from '../OnboardingHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar as RNStatusBar } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
} from 'react-native-reanimated';
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


const leftArrowSvg = `
<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12.5 16.6L7.06664 11.1667C6.42497 10.525 6.42497 9.475 7.06664 8.83334L12.5 3.4" stroke="white" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

const bellSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2zm6-6V11c0-3.07-1.63-5.64-4.5-6.32V4a1.5 1.5 0 0 0-3 0v.68C7.63 5.36 6 7.92 6 11v5l-1.99 2h15.98L18 16z" fill="#FFE0C2"/>
</svg>
`;



export default function NameScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [progress, setProgress] = useState(100);
    const maskWidthPx = Math.round((OUTER_WIDTH * Math.max(0, Math.min(100, progress))) / 100);
    const tightOverlayWidth = Math.max(Math.round(maskWidthPx * 0.6), 60);
    const wideOverlayWidth = Math.max(Math.round(maskWidthPx * 1.6), 140);

    let IOSBordersWrapper: any = ({ children }: { children: any }) => children;
    if (Platform.OS === 'ios') {
        try {

            const mod = require('react-ios-borders');
            IOSBordersWrapper = mod && (mod.default || mod);
        } catch (e) {
            IOSBordersWrapper = ({ children }: { children: any }) => children;
        }
    }

    // Disable mount animation: initialize values to final state so the
    // screen renders instantly when navigated to.
    const opacity = useSharedValue(1);
    const translateY = useSharedValue(0);

    const aStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }));

    // automatically request notification permission when this screen mounts
    useEffect(() => {
        (async () => {
            try {
                // @ts-ignore - dynamic import of expo-notifications
                const Notifications: any = await import('expo-notifications');
                await Notifications.requestPermissionsAsync();
            } catch (e) {
                try {
                    const { Linking }: any = await import('react-native');
                    Linking.openSettings && Linking.openSettings();
                } catch (_err) {
                    // ignore
                }
            }
        })();
    }, []);

    return (
        <SafeAreaView edges={["top"]} style={styles.safeArea}>
            {Platform.OS === 'android' ? <RNStatusBar backgroundColor="#111111" barStyle="light-content" /> : null}
            <Animated.View style={[styles.screen, aStyle]}>
                <View style={styles.contentWrapper}>
                    <View style={styles.contentContainer}>

                        <OnboardingHeader step={4} totalSteps={4} onBack={() => router.back()} />


                        <View style={styles.titleBlock}>
                            <Text style={styles.title}>Allow notification access</Text>
                            <Text style={styles.subtitle}>Enable notifications so we can send you updates and reminders.</Text>
                        </View>


                        <View style={styles.inputWrapper}>
                            <SvgXml xml={bellSvg} width="96" height="96" />
                        </View>
                    </View>
                </View>

                <View style={[styles.bottomContainer, { paddingBottom: SP.md + insets.bottom }]}>
                    <IOSBordersWrapper>
                        <View style={styles.nextButtonWrapper}>
                            <Pressable
                                style={styles.nextButtonInner}
                                onPress={async () => {
                                    try {
                                        const existing = await AsyncStorage.getItem('onboarding');
                                        const obj = existing ? JSON.parse(existing) : {};
                                        obj.notifications = true;
                                        await AsyncStorage.setItem('onboarding', JSON.stringify(obj));
                                    } catch (e) {}
                                    router.push('/onboarding/setup' as any);
                                }}
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
        alignItems: 'center',
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
        height: 10,
        backgroundColor: '#222222',
        borderRadius: 10,
        overflow: 'hidden',
    },
    progressFill: {
        width: '28%',
        height: '100%',
        backgroundColor: '#FFE0C2',
    },
    progressMask: {
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
    },
    innerShadowOverlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: '100%',
        opacity: 0.65,
        borderRadius: 10,
        pointerEvents: 'none',
    },


    titleBlock: {

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
        alignItems: 'center',
        justifyContent: 'center',
    },
    input: {
        width: '100%',
        backgroundColor: '#141414',
        borderColor: '#191919',
        borderWidth: 2,
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 24,
        color: '#ffffff',
        fontSize: 20,
        fontFamily: 'SpaceGrotesk_400Regular',
    },
    bell: {
        fontSize: 56,
        marginBottom: SP.md,
        color: '#fff',
        textAlign: 'center',
    },
    bottomContainer: {
        width: '100.5%',
        paddingTop: SP.lg,
        paddingHorizontal: SP.sm,
        backgroundColor: 'transparent',
        borderTopWidth: 1,
        borderWidth: 1,
        borderColor: '#1B1B1B',
        borderTopRightRadius: 18,
        borderTopLeftRadius: 18
    },
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