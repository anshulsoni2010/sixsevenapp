import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    Linking,
    Dimensions,
    Image,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../constants/theme';
import { useThemeColor } from '../../hooks/use-theme-color';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const OUTER_WIDTH = Math.round(SCREEN_WIDTH * 0.9);

export default function AboutScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState<any>(null);

    // Theme colors
    const backgroundColor = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');
    const iconColor = useThemeColor({}, 'icon');
    const tintColor = useThemeColor({}, 'tint');

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const storedData = await AsyncStorage.getItem('user');
            if (storedData) {
                const data = JSON.parse(storedData);
                console.log('About screen - User data from storage:', data);
                console.log('About screen - createdAt:', data.createdAt);
                setUserData(data);
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatJoinedDate = (dateString?: string) => {
        if (!dateString) return 'Recently';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Recently';
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const handleLink = (url: string) => {
        Linking.openURL(url);
    };

    return (
        <SafeAreaView edges={['top', 'bottom']} style={[styles.safeArea, { backgroundColor }]}>
            <View style={styles.mainContainer}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.iconButton} onPress={() => router.back()} activeOpacity={0.7}>
                        <Ionicons name="chevron-back" size={24} color={textColor} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: textColor }]}>About</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* App Info */}
                    <View style={styles.section}>
                        <View style={styles.appIconContainer}>
                            <Image
                                source={require('../../assets/images/icon.png')}
                                style={styles.appLogo}
                                resizeMode="contain"
                            />
                        </View>
                        <Text style={[styles.appName, { color: textColor }]}>Six Seven</Text>
                        <Text style={[styles.appVersion, { color: iconColor }]}>Version 1.0.0</Text>
                        <Text style={[styles.appTagline, { color: iconColor }]}>
                            Your Gen Alpha Translation Companion
                        </Text>
                        {!loading && userData?.createdAt && (
                            <Text style={[styles.joinedDate, { color: iconColor }]}>
                                Member since {formatJoinedDate(userData.createdAt)}
                            </Text>
                        )}
                    </View>

                    {/* Description */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: iconColor }]}>About the App</Text>
                        <View style={[styles.card, { backgroundColor: textColor + '05' }]}>
                            <Text style={[styles.description, { color: textColor }]}>
                                Six Seven helps you understand and communicate in Gen Alpha slang. Whether you're trying to decode what your kids are saying or want to stay current with the latest internet culture, we've got you covered.
                            </Text>
                        </View>
                    </View>

                    {/* Features */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: iconColor }]}>Features</Text>
                        <View style={[styles.card, { backgroundColor: textColor + '05' }]}>
                            <View style={styles.featureItem}>
                                <Ionicons name="chatbubbles-outline" size={20} color={tintColor} />
                                <Text style={[styles.featureText, { color: textColor }]}>Instant Gen Alpha translations</Text>
                            </View>
                            <View style={styles.featureItem}>
                                <Ionicons name="camera-outline" size={20} color={tintColor} />
                                <Text style={[styles.featureText, { color: textColor }]}>Screenshot analysis</Text>
                            </View>
                            <View style={styles.featureItem}>
                                <Ionicons name="flash-outline" size={20} color={tintColor} />
                                <Text style={[styles.featureText, { color: textColor }]}>Real-time slang updates</Text>
                            </View>
                            <View style={styles.featureItem}>
                                <Ionicons name="shield-checkmark-outline" size={20} color={tintColor} />
                                <Text style={[styles.featureText, { color: textColor }]}>Privacy-focused design</Text>
                            </View>
                        </View>
                    </View>

                    {/* Contact & Links */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: iconColor }]}>Get in Touch</Text>
                        <View style={[styles.menuGroup, { backgroundColor: textColor + '05' }]}>
                            <TouchableOpacity
                                style={[styles.menuItem, { borderBottomColor: textColor + '10' }]}
                                onPress={() => handleLink('mailto:support@sixseven.app')}
                                activeOpacity={0.7}
                            >
                                <View style={styles.menuItemLeft}>
                                    <Ionicons name="mail-outline" size={20} color={textColor} />
                                    <Text style={[styles.menuItemText, { color: textColor }]}>support@sixseven.app</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={16} color={iconColor} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.menuItem, { borderBottomColor: textColor + '10' }]}
                                onPress={() => handleLink('https://sixseven.app')}
                                activeOpacity={0.7}
                            >
                                <View style={styles.menuItemLeft}>
                                    <Ionicons name="globe-outline" size={20} color={textColor} />
                                    <Text style={[styles.menuItemText, { color: textColor }]}>sixseven.app</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={16} color={iconColor} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={() => router.push('/privacy' as any)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.menuItemLeft}>
                                    <Ionicons name="document-text-outline" size={20} color={textColor} />
                                    <Text style={[styles.menuItemText, { color: textColor }]}>Privacy Policy</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={16} color={iconColor} />
                            </TouchableOpacity>
                        </View>
                    </View>

                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    mainContainer: {
        flex: 1,
        alignItems: 'center',
    },
    header: {
        width: OUTER_WIDTH,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        fontFamily: 'SpaceGrotesk_600SemiBold',
    },
    iconButton: {
        padding: 8,
    },
    scrollView: {
        flex: 1,
        width: '100%',
    },
    scrollContent: {
        alignItems: 'center',
        paddingBottom: 40,
    },

    // Sections
    section: {
        width: OUTER_WIDTH,
        marginBottom: 24,
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        fontFamily: 'SpaceGrotesk_600SemiBold',
        marginBottom: 8,
        alignSelf: 'flex-start',
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    // App Info
    appIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        overflow: 'hidden',
    },
    appLogo: {
        width: '100%',
        height: '100%',
    },
    appName: {
        fontSize: 28,
        fontWeight: '700',
        fontFamily: 'SpaceGrotesk_700Bold',
        marginBottom: 4,
    },
    appVersion: {
        fontSize: 14,
        fontFamily: 'SpaceGrotesk_400Regular',
        marginBottom: 8,
    },
    appTagline: {
        fontSize: 15,
        fontFamily: 'SpaceGrotesk_400Regular',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    joinedDate: {
        fontSize: 13,
        fontFamily: 'SpaceGrotesk_400Regular',
        textAlign: 'center',
        marginTop: 12,
    },

    // Card
    card: {
        width: '100%',
        borderRadius: 16,
        padding: 20,
    },
    description: {
        fontSize: 15,
        fontFamily: 'SpaceGrotesk_400Regular',
        lineHeight: 24,
    },

    // Features
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    featureText: {
        fontSize: 15,
        fontFamily: 'SpaceGrotesk_400Regular',
        flex: 1,
    },

    // Menu
    menuGroup: {
        width: '100%',
        borderRadius: 16,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'transparent',
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    menuItemText: {
        fontSize: 16,
        fontFamily: 'SpaceGrotesk_400Regular',
    },


});
