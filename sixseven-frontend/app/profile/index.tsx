import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { Colors } from '../../constants/theme';
import { useThemeColor } from '../../hooks/use-theme-color';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const OUTER_WIDTH = Math.round(SCREEN_WIDTH * 0.9);

export default function ProfileScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
      <SafeAreaView edges={['top', 'bottom']} style={[styles.safeArea, { backgroundColor }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tintColor} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.safeArea, { backgroundColor }]}>
      <View style={styles.mainContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>Profile</Text>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push('/profile/profile-edit' as any)}
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={22} color={textColor} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Image
                source={userData?.picture ? { uri: userData.picture } : require('../../assets/images/icon.png')}
                style={[styles.avatar, { borderColor: tintColor }]}
                resizeMode="cover"
              />
            </View>

            <View style={styles.userInfo}>
              <Text style={[styles.name, { color: textColor }]}>{userData?.name || 'User'}</Text>
              <Text style={[styles.email, { color: iconColor }]}>{userData?.email}</Text>
              {userData?.subscribed && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {userData?.plan === 'yearly' ? 'Yearly' : 'Monthly'} Pro
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={[styles.statItem, { backgroundColor: textColor + '08' }]}>
              <Ionicons name="chatbubble-outline" size={20} color={tintColor} />
              <Text style={[styles.statValue, { color: textColor }]}>
                {userData?.stats?.messagesTranslated || '0'}
              </Text>
              <Text style={[styles.statLabel, { color: iconColor }]}>Messages</Text>
            </View>
            <View style={[styles.statItem, { backgroundColor: textColor + '08' }]}>
              <Ionicons name="flame-outline" size={20} color={tintColor} />
              <Text style={[styles.statValue, { color: textColor }]}>
                {userData?.stats?.daysActive || '0'}
              </Text>
              <Text style={[styles.statLabel, { color: iconColor }]}>Day Streak</Text>
            </View>
            <View style={[styles.statItem, { backgroundColor: textColor + '08' }]}>
              <Ionicons name="trophy-outline" size={20} color={tintColor} />
              <Text style={[styles.statValue, { color: textColor }]}>
                {userData?.alphaPoints || '0'}
              </Text>
              <Text style={[styles.statLabel, { color: iconColor }]}>Points</Text>
            </View>
          </View>

          {/* Menu Sections */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: iconColor }]}>Account</Text>
            <View style={[styles.menuGroup, { backgroundColor: textColor + '05' }]}>
              {userData?.age && (
                <View style={[styles.menuItem, { borderBottomColor: textColor + '10' }]}>
                  <View style={styles.menuItemLeft}>
                    <Ionicons name="calendar-number-outline" size={20} color={textColor} />
                    <Text style={[styles.menuItemText, { color: textColor }]}>Age</Text>
                  </View>
                  <Text style={[styles.menuItemValue, { color: iconColor }]}>{userData.age}</Text>
                </View>
              )}
              {userData?.gender && (
                <View style={[styles.menuItem, { borderBottomColor: textColor + '10' }]}>
                  <View style={styles.menuItemLeft}>
                    <Ionicons name="person-outline" size={20} color={textColor} />
                    <Text style={[styles.menuItemText, { color: textColor }]}>Gender</Text>
                  </View>
                  <Text style={[styles.menuItemValue, { color: iconColor }]}>{userData.gender}</Text>
                </View>
              )}
              <View style={styles.menuItem}>
                <View style={styles.menuItemLeft}>
                  <Ionicons name="time-outline" size={20} color={textColor} />
                  <Text style={[styles.menuItemText, { color: textColor }]}>Joined</Text>
                </View>
                <Text style={[styles.menuItemValue, { color: iconColor }]}>
                  {userData?.createdAt ? formatDate(userData.createdAt) : '-'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: iconColor }]}>Preferences</Text>
            <View style={[styles.menuGroup, { backgroundColor: textColor + '05' }]}>
              <View style={styles.menuItem}>
                <View style={styles.menuItemLeft}>
                  <Ionicons name="notifications-outline" size={20} color={textColor} />
                  <Text style={[styles.menuItemText, { color: textColor }]}>Notifications</Text>
                </View>
                <Switch
                  value={userData?.notifications}
                  onValueChange={async (value) => {
                    try {
                      const token = await SecureStore.getItemAsync('session_token');
                      if (!token) return;

                      // Optimistic update
                      setUserData({ ...userData, notifications: value });

                      const BACKEND = Constants.expoConfig?.extra?.BACKEND_URL ?? 'http://localhost:3000';
                      await fetch(`${BACKEND}/api/user/me`, {
                        method: 'PATCH',
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ notifications: value }),
                      });
                    } catch (error) {
                      console.error('Error updating notifications:', error);
                      // Revert on error
                      setUserData({ ...userData, notifications: !value });
                    }
                  }}
                  trackColor={{ false: textColor + '20', true: tintColor }}
                  thumbColor={'#fff'}
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: iconColor }]}>Support</Text>
            <View style={[styles.menuGroup, { backgroundColor: textColor + '05' }]}>
              <TouchableOpacity
                style={[styles.menuItem, { borderBottomColor: textColor + '10' }]}
                onPress={() => {
                  Alert.alert(
                    'Contact Support',
                    'support@sixseven.app',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Copy Email',
                        onPress: () => {
                          Alert.alert('Copied!', 'Email address copied to clipboard');
                        }
                      }
                    ]
                  );
                }}
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons name="help-circle-outline" size={20} color={textColor} />
                  <Text style={[styles.menuItemText, { color: textColor }]}>Help & Support</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={iconColor} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => router.push('/about' as any)}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons name="information-circle-outline" size={20} color={textColor} />
                  <Text style={[styles.menuItemText, { color: textColor }]}>About</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={iconColor} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: iconColor }]}>Actions</Text>
            <View style={[styles.menuGroup, { backgroundColor: textColor + '05' }]}>
              <TouchableOpacity
                style={[styles.menuItem, { borderBottomColor: textColor + '10' }]}
                onPress={() => router.push('/subscription' as any)}
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons name="card-outline" size={20} color={textColor} />
                  <Text style={[styles.menuItemText, { color: textColor }]}>Subscription</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={iconColor} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.menuItem, { borderBottomColor: textColor + '10' }]}
                onPress={() => router.push('/privacy' as any)}
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons name="shield-checkmark-outline" size={20} color={textColor} />
                  <Text style={[styles.menuItemText, { color: textColor }]}>Privacy Policy</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={iconColor} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.menuItem, { borderBottomColor: textColor + '10' }]}
                onPress={() => router.push('/terms' as any)}
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons name="document-text-outline" size={20} color={textColor} />
                  <Text style={[styles.menuItemText, { color: textColor }]}>Terms of Service</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={iconColor} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleDeleteAccount}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
                  <Text style={[styles.menuItemText, { color: '#FF6B6B' }]}>Delete Account</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#FF6B6B" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
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
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
    paddingHorizontal: 20,
    gap: 20,
  },
  avatarContainer: {
    marginBottom: 0,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 16,
    borderWidth: 2,
  },
  userInfo: {
    flex: 1,
    alignItems: 'flex-start',
    gap: 4,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  email: {
    fontSize: 14,
    fontFamily: 'SpaceGrotesk_400Regular',
  },
  badge: {
    backgroundColor: '#FFE0C2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 8,
  },
  badgeText: {
    color: '#111111',
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'SpaceGrotesk_700Bold',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  statsGrid: {
    width: OUTER_WIDTH,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    gap: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'SpaceGrotesk_700Bold',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'SpaceGrotesk_400Regular',
  },
  section: {
    width: OUTER_WIDTH,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'SpaceGrotesk_600SemiBold',
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuGroup: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'transparent', // Overridden in render
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    fontFamily: 'SpaceGrotesk_400Regular',
  },
  menuItemValue: {
    fontSize: 14,
    fontFamily: 'SpaceGrotesk_400Regular',
  },
  logoutButton: {
    marginTop: 8,
    padding: 16,
  },
  logoutText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'SpaceGrotesk_600SemiBold',
  },
  deleteButton: {
    marginTop: 0,
    padding: 16,
  },
  deleteText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontFamily: 'SpaceGrotesk_400Regular',
    opacity: 0.8,
  },
});