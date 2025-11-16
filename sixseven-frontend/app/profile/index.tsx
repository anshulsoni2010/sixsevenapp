import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ImageBackground,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const OUTER_WIDTH = Math.round(SCREEN_WIDTH * 0.9);

export default function ProfileScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const token = await SecureStore.getItemAsync('session_token');
      if (token) {
        const BACKEND = Constants.expoConfig?.extra?.BACKEND_URL ?? 'http://localhost:3000';
        const response = await fetch(`${BACKEND}/api/user/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        } else {
          // Fallback to AsyncStorage
          const storedData = await AsyncStorage.getItem('user');
          if (storedData) {
            setUserData(JSON.parse(storedData));
          }
        }
      } else {
        // Fallback to AsyncStorage
        const storedData = await AsyncStorage.getItem('user');
        if (storedData) {
          setUserData(JSON.parse(storedData));
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await SecureStore.deleteItemAsync('session_token');
              await AsyncStorage.multiRemove(['user', 'onboarding']);
              router.replace('/' as any);
            } catch (error) {
              console.error('Error during logout:', error);
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = async () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted, including your subscription.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await SecureStore.getItemAsync('session_token');
              if (!token) {
                Alert.alert('Error', 'Authentication required');
                return;
              }

              const BACKEND = Constants.expoConfig?.extra?.BACKEND_URL ?? 'http://localhost:3000';
              const response = await fetch(`${BACKEND}/api/user/me`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              });

              if (response.ok) {
                // Clear all local data
                await SecureStore.deleteItemAsync('session_token');
                await AsyncStorage.removeItem('user');
                await AsyncStorage.removeItem('onboarding');

                Alert.alert(
                  'Account Deleted',
                  'Your account has been successfully deleted.',
                  [
                    {
                      text: 'OK',
                      onPress: () => router.replace('/' as any),
                    },
                  ]
                );
              } else {
                const errorData = await response.json();
                Alert.alert('Error', errorData.error || 'Failed to delete account');
              }
            } catch (error) {
              console.error('Error deleting account:', error);
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <ImageBackground
        source={require('../../assets/images/chatscreenbg.png')}
        style={styles.container}
        resizeMode="cover"
      >
        <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
          <View style={styles.mainContainer}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#ffffff" />
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require('../../assets/images/chatscreenbg.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        <View style={styles.mainContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <Ionicons name="chevron-back" size={24} color="#FFE0C2" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Profile</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Profile Content */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Profile Picture */}
            <View style={styles.avatarContainer}>
              <View style={styles.avatarWrapper}>
                <Image
                  source={userData?.picture ? { uri: userData.picture } : require('../../assets/images/icon.png')}
                  style={styles.avatar}
                  resizeMode="cover"
                  onError={(e) => {
                    console.log('Avatar load error:', e.nativeEvent.error);
                  }}
                />
                <TouchableOpacity
                  style={styles.editAvatarButton}
                  onPress={() => {
                    // TODO: Implement avatar editing
                    Alert.alert('Coming Soon', 'Profile picture editing will be available soon!');
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="camera" size={16} color="#FFE0C2" />
                </TouchableOpacity>
              </View>
            </View>

            {/* User Info */}
            <View style={styles.infoContainer}>
              <Text style={styles.name}>{userData?.name || 'User'}</Text>
              <Text style={styles.email}>{userData?.email}</Text>
            </View>

            {/* Subscription Info */}
            {userData?.subscribed && (
              <View style={styles.subscriptionContainer}>
                <LinearGradient
                  colors={['#FFE0C2', '#FFD700', '#FFA500']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.subscriptionBadge}
                >
                  <View style={styles.subscriptionBadgeContent}>
                    <Ionicons name="star" size={16} color="#000000" />
                    <Text style={styles.subscriptionText}>
                      {userData?.plan === 'yearly' ? 'Yearly' : 'Monthly'} Pro
                    </Text>
                    <Ionicons name="star" size={16} color="#000000" />
                  </View>
                </LinearGradient>
                {userData?.endsAt && (
                  <Text style={styles.subscriptionExpiry}>
                    Expires: {formatDate(userData.endsAt)}
                  </Text>
                )}
              </View>
            )}

            {/* Account Information */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Account Information</Text>
              <View style={styles.infoGrid}>
                {userData?.age && (
                  <View style={styles.infoItem}>
                    <Ionicons name="calendar" size={20} color="#FFE0C2" />
                    <Text style={styles.infoLabel}>Age</Text>
                    <Text style={styles.infoValue}>{userData.age} years old</Text>
                  </View>
                )}
                {userData?.gender && (
                  <View style={styles.infoItem}>
                    <Ionicons name="person" size={20} color="#FFE0C2" />
                    <Text style={styles.infoLabel}>Gender</Text>
                    <Text style={styles.infoValue}>{userData.gender}</Text>
                  </View>
                )}
                {userData?.alphaLevel && (
                  <View style={styles.infoItem}>
                    <Ionicons name="star" size={20} color="#FFE0C2" />
                    <Text style={styles.infoLabel}>Alpha Level</Text>
                    <Text style={styles.infoValue}>{userData.alphaLevel}</Text>
                  </View>
                )}
                {userData?.createdAt && (
                  <View style={styles.infoItem}>
                    <Ionicons name="time" size={20} color="#FFE0C2" />
                    <Text style={styles.infoLabel}>Member Since</Text>
                    <Text style={styles.infoValue}>{formatDate(userData.createdAt)}</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.sectionDivider} />

            {/* Usage Stats */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Your Activity</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <LinearGradient
                    colors={['rgba(255, 224, 194, 0.1)', 'rgba(255, 224, 194, 0.05)']}
                    style={styles.statGradient}
                  >
                    <Ionicons name="chatbubble" size={24} color="#FFE0C2" />
                    <Text style={styles.statNumber}>
                      {userData?.stats?.messagesTranslated || '0'}
                    </Text>
                    <Text style={styles.statLabel}>Messages Translated</Text>
                  </LinearGradient>
                </View>
                <View style={styles.statItem}>
                  <LinearGradient
                    colors={['rgba(255, 224, 194, 0.1)', 'rgba(255, 224, 194, 0.05)']}
                    style={styles.statGradient}
                  >
                    <Ionicons name="calendar" size={24} color="#FFE0C2" />
                    <Text style={styles.statNumber}>
                      {userData?.stats?.daysActive || '0'}
                    </Text>
                    <Text style={styles.statLabel}>Days Active</Text>
                  </LinearGradient>
                </View>
                <View style={styles.statItem}>
                  <LinearGradient
                    colors={['rgba(255, 224, 194, 0.1)', 'rgba(255, 224, 194, 0.05)']}
                    style={styles.statGradient}
                  >
                    <Ionicons name="star" size={24} color="#FFE0C2" />
                    <Text style={styles.statNumber}>
                      {userData?.stats?.rating || '0.0'}
                    </Text>
                    <Text style={styles.statLabel}>Avg. Rating</Text>
                  </LinearGradient>
                </View>
                <View style={styles.statItem}>
                  <LinearGradient
                    colors={['rgba(255, 224, 194, 0.1)', 'rgba(255, 224, 194, 0.05)']}
                    style={styles.statGradient}
                  >
                    <Ionicons name="trophy" size={24} color="#FFE0C2" />
                    <Text style={styles.statNumber}>
                      {userData?.alphaPoints || '0'}
                    </Text>
                    <Text style={styles.statLabel}>Alpha Points</Text>
                  </LinearGradient>
                </View>
              </View>
            </View>

            <View style={styles.sectionDivider} />

            {/* Preferences */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Preferences</Text>
              <TouchableOpacity
                style={styles.preferenceItem}
                onPress={async () => {
                  try {
                    const token = await SecureStore.getItemAsync('session_token');
                    if (!token) {
                      Alert.alert('Error', 'Authentication required');
                      return;
                    }

                    const BACKEND = Constants.expoConfig?.extra?.BACKEND_URL ?? 'http://localhost:3000';
                    const response = await fetch(`${BACKEND}/api/user/me`, {
                      method: 'PATCH',
                      headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        notifications: !userData?.notifications,
                      }),
                    });

                    if (response.ok) {
                      const updatedUser = await response.json();
                      setUserData(updatedUser);
                      Alert.alert('Success', 'Notification preferences updated!');
                    } else {
                      Alert.alert('Error', 'Failed to update preferences');
                    }
                  } catch (error) {
                    console.error('Error updating preferences:', error);
                    Alert.alert('Error', 'Failed to update preferences');
                  }
                }}
                activeOpacity={0.8}
              >
                <View style={styles.preferenceLeft}>
                  <Ionicons name="notifications" size={24} color="#FFE0C2" />
                  <View style={styles.preferenceText}>
                    <Text style={styles.preferenceTitle}>Push Notifications</Text>
                    <Text style={styles.preferenceSubtitle}>
                      Receive updates about new features and tips
                    </Text>
                  </View>
                </View>
                <View style={[styles.toggle, userData?.notifications && styles.toggleActive]}>
                  <View style={[styles.toggleKnob, userData?.notifications && styles.toggleKnobActive]} />
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.sectionDivider} />

            {/* Support */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Support</Text>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  // Open email client or show contact options
                  Alert.alert(
                    'Contact Support',
                    'support@sixseven.app',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Copy Email',
                        onPress: () => {
                          // In a real app, you'd use Clipboard.setString()
                          Alert.alert('Copied!', 'Email address copied to clipboard');
                        }
                      }
                    ]
                  );
                }}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#2E2E2E', '#2A2A2A']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={styles.actionButtonGradient}
                >
                  <Ionicons name="help-circle" size={24} color="#FFE0C2" />
                  <Text style={styles.actionButtonText}>Help & Support</Text>
                  <Ionicons name="chevron-forward" size={20} color="#FFE0C2" />
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  Alert.alert(
                    'About 6 7',
                    `Version 1.0.0\n\nTalk the Alpha, Walk the Alpha\n\nTransform your messages into Gen Alpha slang! 🔥\n\n© 2025 Six Seven`,
                    [{ text: 'OK' }]
                  );
                }}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#2E2E2E', '#2A2A2A']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={styles.actionButtonGradient}
                >
                  <Ionicons name="information-circle" size={24} color="#FFE0C2" />
                  <Text style={styles.actionButtonText}>About</Text>
                  <Ionicons name="chevron-forward" size={20} color="#FFE0C2" />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Support */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Support</Text>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  // Open email client or show contact options
                  Alert.alert(
                    'Contact Support',
                    'support@sixseven.app',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Copy Email',
                        onPress: () => {
                          // In a real app, you'd use Clipboard.setString()
                          Alert.alert('Copied!', 'Email address copied to clipboard');
                        }
                      }
                    ]
                  );
                }}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#2E2E2E', '#2A2A2A']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={styles.actionButtonGradient}
                >
                  <Ionicons name="help-circle" size={24} color="#FFE0C2" />
                  <Text style={styles.actionButtonText}>Help & Support</Text>
                  <Ionicons name="chevron-forward" size={20} color="#FFE0C2" />
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  Alert.alert(
                    'About 6 7',
                    `Version 1.0.0\n\nTalk the Alpha, Walk the Alpha\n\nTransform your messages into Gen Alpha slang! 🔥\n\n© 2025 Six Seven`,
                    [{ text: 'OK' }]
                  );
                }}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#2E2E2E', '#2A2A2A']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={styles.actionButtonGradient}
                >
                  <Ionicons name="information-circle" size={24} color="#FFE0C2" />
                  <Text style={styles.actionButtonText}>About</Text>
                  <Ionicons name="chevron-forward" size={20} color="#FFE0C2" />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={styles.sectionDivider} />

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push('/subscription' as any)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#2E2E2E', '#2A2A2A']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={styles.actionButtonGradient}
                >
                  <Ionicons name="card" size={24} color="#FFE0C2" />
                  <Text style={styles.actionButtonText}>Manage Subscription</Text>
                  <Ionicons name="chevron-forward" size={20} color="#FFE0C2" />
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push('/privacy' as any)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#2E2E2E', '#2A2A2A']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={styles.actionButtonGradient}
                >
                  <Ionicons name="shield-checkmark" size={24} color="#FFE0C2" />
                  <Text style={styles.actionButtonText}>Privacy Policy</Text>
                  <Ionicons name="chevron-forward" size={20} color="#FFE0C2" />
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push('/terms' as any)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#2E2E2E', '#2A2A2A']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={styles.actionButtonGradient}
                >
                  <Ionicons name="document-text" size={24} color="#FFE0C2" />
                  <Text style={styles.actionButtonText}>Terms of Service</Text>
                  <Ionicons name="chevron-forward" size={20} color="#FFE0C2" />
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleDeleteAccount}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#FF6B6B', '#FF4757']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.actionButtonGradient}
                >
                  <Ionicons name="trash" size={24} color="#FFFFFF" />
                  <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Delete Account</Text>
                  <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Logout Button */}
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
  },
  mainContainer: {
    width: OUTER_WIDTH,
    height: '100%',
    flexDirection: 'column',
  },

  // Header
  header: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFE0C2',
    fontFamily: 'SpaceGrotesk_400Regular',
  },

  // Scroll Content
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#FFE0C2',
    fontFamily: 'SpaceGrotesk_400Regular',
  },

  // Avatar
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#FFE0C2',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(46, 46, 46, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFE0C2',
  },

  // User Info
  infoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFE0C2',
    marginBottom: 8,
    fontFamily: 'SpaceGrotesk_400Regular',
  },
  email: {
    fontSize: 16,
    color: '#B4B4B4',
    fontFamily: 'SpaceGrotesk_400Regular',
  },

  // Subscription
  subscriptionContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  subscriptionBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
  },
  subscriptionBadgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subscriptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'SpaceGrotesk_400Regular',
  },
  subscriptionExpiry: {
    fontSize: 12,
    color: '#B4B4B4',
    fontFamily: 'SpaceGrotesk_400Regular',
  },

  // Actions
  actionsContainer: {
    gap: 12,
    marginBottom: 32,
  },
  actionButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#FFE0C2',
    fontFamily: 'SpaceGrotesk_400Regular',
  },

  // Logout
  logoutButton: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  logoutText: {
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: '600',
    fontFamily: 'SpaceGrotesk_400Regular',
  },

  // New sections
  sectionContainer: {
    marginBottom: 32,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFE0C2',
    fontFamily: 'SpaceGrotesk_700Bold',
    marginBottom: 16,
  },
  infoGrid: {
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: '#B4B4B4',
    fontFamily: 'SpaceGrotesk_400Regular',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    color: '#FFE0C2',
    fontFamily: 'SpaceGrotesk_400Regular',
    flex: 1,
    textAlign: 'right',
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
  },
  preferenceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  preferenceText: {
    flex: 1,
  },
  preferenceTitle: {
    fontSize: 16,
    color: '#FFE0C2',
    fontFamily: 'SpaceGrotesk_400Regular',
    marginBottom: 2,
  },
  preferenceSubtitle: {
    fontSize: 14,
    color: '#B4B4B4',
    fontFamily: 'SpaceGrotesk_400Regular',
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#666666',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: '#FFE0C2',
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    transform: [{ translateX: 0 }],
  },
  toggleKnobActive: {
    transform: [{ translateX: 22 }],
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    flex: 1,
    minWidth: (OUTER_WIDTH - 24) / 2 - 6,
    borderRadius: 12,
    overflow: 'hidden',
  },
  statGradient: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFE0C2',
    fontFamily: 'SpaceGrotesk_700Bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#B4B4B4',
    fontFamily: 'SpaceGrotesk_400Regular',
    textAlign: 'center',
  },
});