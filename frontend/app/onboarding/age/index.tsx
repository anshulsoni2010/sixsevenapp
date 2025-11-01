import React, { useEffect, useState, useRef } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Pressable,
    Dimensions,
    Platform,
} from 'react-native';
import OnboardingHeader from '../OnboardingHeader';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar as RNStatusBar } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    useAnimatedScrollHandler,
    interpolate,
    interpolateColor,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const OUTER_WIDTH = Math.round(SCREEN_WIDTH * 0.9);


const SP = {
    xs: 8,
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48,
};


// left arrow handled by OnboardingHeader



export default function AgeScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [progress, setProgress] = useState(60);
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

    // Age item subcomponent for smooth animation
    function AgeItem({ index, value, scrollY, itemHeight, selectedAge }: { index: number; value: number; scrollY: any; itemHeight: number; selectedAge: number }) {
        const centerY = index * itemHeight;
        const aStyle = useAnimatedStyle(() => {
            const dist = (scrollY.value - centerY) / itemHeight; // 0 when centered
            // multi-step scale: far -> smallest, then small, then big at center
            const scale = interpolate(dist, [-3, -2, -1, 0, 1, 2, 3], [0.86, 0.92, 0.98, 1.12, 0.98, 0.92, 0.86]);
            return { transform: [{ scale }] } as any;
        });

        const textStyle = useAnimatedStyle(() => {
            const center = index * itemHeight;
            const stops = [center - 3 * itemHeight, center - 2 * itemHeight, center - itemHeight, center, center + itemHeight, center + 2 * itemHeight, center + 3 * itemHeight];
            const color = interpolateColor(scrollY.value, stops, ['#666666', '#888888', '#999999', '#FFE0C2', '#999999', '#888888', '#666666']);
            const rawFontSize = interpolate(scrollY.value, stops, [18, 20, 22, 30, 22, 20, 18]);
            // Ensure fontSize is a positive value (Android Fabric requires > 0)
            const fontSize = Math.max(1, rawFontSize);
            const fontWeight = Math.abs((scrollY.value - center) / itemHeight) < 0.5 ? '700' : '400';
            return {
                color,
                fontWeight,
                fontSize,
            } as any;
        });

        return (
            <Animated.View style={[styles.wheelItem, { height: itemHeight }, aStyle]}> 
                <Animated.Text style={[styles.wheelItemText, textStyle]}>{String(value)}</Animated.Text>
            </Animated.View>
        );
    }

    const aStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }));

    // Wheel picker setup
    const ITEM_HEIGHT = 56;
    const VISIBLE_COUNT = 5;
    const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_COUNT;
    const ages = Array.from({ length: 88 }, (_, i) => i + 13); // 13..100
    const [selectedAge, setSelectedAge] = useState<number>(25);
    const scrollRef = useRef<any>(null);

    // shared scroll position for smooth animation
    const scrollY = useSharedValue(0);

    const scrollHandler = useAnimatedScrollHandler((event) => {
        scrollY.value = event.contentOffset.y;
    });

    const onMomentumScrollEnd = (e: any) => {
        const offsetY = e.nativeEvent.contentOffset.y || 0;
        const index = Math.round(offsetY / ITEM_HEIGHT);
        const age = ages[index];
        if (age) setSelectedAge(age);
    };

    useEffect(() => {
        // position wheel to the currently selected age on mount
        const idx = ages.indexOf(selectedAge);
        if (scrollRef.current && idx >= 0) {
            scrollRef.current.scrollTo({ y: idx * ITEM_HEIGHT, animated: false });
            // also initialize shared scroll value so animated items render correctly
            scrollY.value = idx * ITEM_HEIGHT;
        }
    }, []);

    return (
        <SafeAreaView edges={["top"]} style={styles.safeArea}>
            {Platform.OS === 'android' ? <RNStatusBar backgroundColor="#111111" barStyle="light-content" /> : null}
            <Animated.View style={[styles.screen, aStyle]}>
                <View style={styles.contentWrapper}>
                    <View style={styles.contentContainer}>
                        <OnboardingHeader
                            step={3}
                            totalSteps={4}
                            onBack={() => router.back()}
                            title={"Chat, What’s your age?"}
                            subtitle={"Age check, how many laps you’ve done around the sun?"}
                        />


                        <View style={styles.inputWrapper}>
                            {/* Age wheel picker (snap / iOS wheel style) */}
                            <View style={styles.wheelContainer}>
                                <View style={[styles.wheelInner, { height: CONTAINER_HEIGHT }]}>
                                    {/* center highlight - placed behind the scroll content so selected text remains visible */}
                                    <View pointerEvents="none" style={[styles.wheelOverlay, { height: ITEM_HEIGHT, top: (CONTAINER_HEIGHT - ITEM_HEIGHT) / 2 }]} />
                                    <Animated.ScrollView
                                        ref={scrollRef}
                                        showsVerticalScrollIndicator={false}
                                        snapToInterval={ITEM_HEIGHT}
                                        decelerationRate="fast"
                                        onMomentumScrollEnd={onMomentumScrollEnd}
                                        onScroll={scrollHandler}
                                        scrollEventThrottle={16}
                                        contentContainerStyle={{ paddingTop: (CONTAINER_HEIGHT - ITEM_HEIGHT) / 2, paddingBottom: (CONTAINER_HEIGHT - ITEM_HEIGHT) / 2 }}
                                    >
                                        {ages.map((a, idx) => {
                                            return <AgeItem key={a} index={idx} value={a} scrollY={scrollY} itemHeight={ITEM_HEIGHT} selectedAge={selectedAge} />;
                                        })}
                                    </Animated.ScrollView>
                                </View>
                            </View>
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
                                        obj.age = Number(selectedAge);
                                        await AsyncStorage.setItem('onboarding', JSON.stringify(obj));
                                    } catch (e) {}
                                    router.push('/onboarding/alphaConfirm' as any);
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
    },
    wheelContainer: {
        width: '100%',
        backgroundColor: '#141414',
        borderColor: '#191919',
        borderWidth: 2,
        borderRadius: 16,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
    },
    wheelInner: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    wheelItem: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    wheelItemSelected: {},
    wheelItemText: {
        color: '#666666',
        fontSize: 22,
        fontFamily: 'SpaceGrotesk_400Regular',
    },
    wheelItemTextSelected: {
        color: '#FFE0C2',
        fontFamily: 'SpaceGrotesk_700Bold',
        fontWeight: '700',
    },
    wheelOverlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        backgroundColor: '#131313',
        borderRadius: 12,
        alignSelf: 'center',
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