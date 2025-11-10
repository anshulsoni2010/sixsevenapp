import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Pressable,
    TextInput,
    Dimensions,
    Platform,
    KeyboardAvoidingView,
    ActivityIndicator,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import OnboardingHeader from '../OnboardingHeader';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar as RNStatusBar } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

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



export default function NameScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [progress, setProgress] = useState(20);
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

    const [name, setName] = React.useState('');

    // Validation state
    const [isNameValid, setIsNameValid] = useState(false);
    const [showValidation, setShowValidation] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    // Validate name in real-time
    useEffect(() => {
        const trimmed = name.trim();
        const valid = trimmed.length >= 2 && trimmed.length <= 50 && /^[a-zA-Z\s'-]+$/.test(trimmed);
        setIsNameValid(valid);
        if (name.length > 0) {
            setShowValidation(true);
        }
    }, [name]);

    return (
        <SafeAreaView edges={["top"]} style={styles.safeArea}>
            {Platform.OS === 'android' ? <RNStatusBar backgroundColor="#111111" barStyle="light-content" /> : null}
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <Animated.View style={[styles.screen, aStyle]}>
                    <View style={styles.contentWrapper}>
                        <View style={styles.contentContainer}>

                            <OnboardingHeader step={1} totalSteps={4} onBack={() => router.back()} />


                            <View style={styles.titleBlock}>
                                <Text style={styles.title}>Hey there! What's your name? 👋</Text>
                                <Text style={styles.subtitle}>Let's get to know the real you - drop your name and let's start this journey! 🚀</Text>
                            </View>


                            <View style={styles.inputWrapper}>
                                <TextInput
                                    placeholder={showValidation && !isNameValid && name.length > 0 
                                        ? "Please enter a valid name (2-50 characters)" 
                                        : "Enter Your Name"
                                    }
                                    placeholderTextColor={showValidation && !isNameValid && name.length > 0 ? "#ff6b6b" : "#727272"}
                                    style={[
                                        styles.input,
                                        showValidation && !isNameValid && name.length > 0 && styles.inputError,
                                        showValidation && isNameValid && styles.inputSuccess
                                    ]}
                                    returnKeyType="done"
                                    accessibilityLabel="Name input"
                                    value={name}
                                    onChangeText={(text) => {
                                        setName(text);
                                        if (text.length > 0 && !showValidation) {
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                        }
                                    }}
                                    maxLength={50}
                                    autoCapitalize="words"
                                    autoCorrect={false}
                                />
                                {showValidation && name.length > 0 && (
                                    <Text style={[
                                        styles.validationText,
                                        isNameValid ? styles.validationTextSuccess : styles.validationTextError
                                    ]}>
                                        {isNameValid ? "✨ Awesome name! Let's continue..." : "Please enter a valid name (2-50 characters, letters only)"}
                                    </Text>
                                )}
                            </View>
                        </View>
                    </View>

                    <View style={[styles.bottomContainer, { paddingBottom: SP.md + insets.bottom }]}>
                        <IOSBordersWrapper>
                            <View style={styles.nextButtonWrapper}>
                                <Pressable
                                    style={styles.nextButtonInner}
                                    onPress={async () => {
                                        if (!isNameValid) {
                                            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                                            return;
                                        }
                                        
                                        setIsSaving(true);
                                        setSaveError(null);
                                        
                                        try {
                                            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                            
                                            const existing = await AsyncStorage.getItem('onboarding');
                                            const obj = existing ? JSON.parse(existing) : {};
                                            obj.name = name.trim();
                                            await AsyncStorage.setItem('onboarding', JSON.stringify(obj));
                                            router.push('/onboarding/age' as any);
                                        } catch (error) {
                                            console.error('Failed to save name:', error);
                                            setSaveError('Failed to save your name. Please try again.');
                                            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                                        } finally {
                                            setIsSaving(false);
                                        }
                                    }}
                                    accessibilityRole="button"
                                    accessibilityLabel="Next"
                                    disabled={isSaving}
                                >
                                    {isSaving ? (
                                        <ActivityIndicator color="#000000" size="small" />
                                    ) : (
                                        <Text style={styles.nextButtonText}>Next</Text>
                                    )}
                                </Pressable>
                            </View>
                        </IOSBordersWrapper>
                        
                        {saveError && (
                            <Text style={styles.errorText}>{saveError}</Text>
                        )}
                    </View>
                </Animated.View>
            </KeyboardAvoidingView>
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
    inputError: {
        borderColor: '#ff6b6b',
        backgroundColor: '#1a1414',
    },
    inputSuccess: {
        borderColor: '#4ade80',
        backgroundColor: '#141a14',
    },
    validationText: {
        fontSize: 14,
        fontFamily: 'SpaceGrotesk_400Regular',
        marginTop: 8,
        marginLeft: 4,
    },
    validationTextError: {
        color: '#ff6b6b',
    },
    validationTextSuccess: {
        color: '#4ade80',
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
    errorText: {
        color: '#ff6b6b',
        fontSize: 14,
        fontFamily: 'Outfit_400Regular',
        textAlign: 'center',
        marginTop: 8,
    },
});