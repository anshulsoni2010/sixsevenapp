// SubscriptionScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { Colors } from '../../constants/theme';
import { useThemeColor } from '../../hooks/use-theme-color';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const OUTER_WIDTH = Math.round(SCREEN_WIDTH * 0.9);

interface SubscriptionData {
  subscribed: boolean;
  plan?: 'weekly' | 'yearly' | string;
  status?: 'active' | 'past_due' | 'canceled' | string;
  endsAt?: string;
  onboarded?: boolean;
}

export default function SubscriptionScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [managingSubscription, setManagingSubscription] = useState(false);

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const token = await SecureStore.getItemAsync('session_token');
      if (!token) {
        router.replace('/onboarding' as any);
        return;
      }

      const BACKEND = Constants.expoConfig?.extra?.BACKEND_URL ?? 'http://localhost:3000';
      console.log('Fetching subscription from:', `${BACKEND}/api/user/me`);

      const response = await fetch(`${BACKEND}/api/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Subscription data:', data);
        console.log('endsAt value:', data.endsAt);
        console.log('endsAt type:', typeof data.endsAt);
        setSubscription(data);
      } else {
        console.error('Failed to fetch subscription:', response.status);
        setSubscription({ subscribed: false });
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
      setSubscription({ subscribed: false });
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    Alert.alert('Manage Subscription', 'Choose how you want to manage your subscription:', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'View Billing Details',
        onPress: async () => {
          try {
            setManagingSubscription(true);

            const token = await SecureStore.getItemAsync('session_token');
            if (!token) {
              Alert.alert('Error', 'Please sign in again');
              return;
            }

            const BACKEND = Constants.expoConfig?.extra?.BACKEND_URL ?? 'http://localhost:3000';

            // Create Stripe customer portal session
            const response = await fetch(`${BACKEND}/api/stripe/create-portal-session`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
            });

            const data = await response.json();

            if (response.ok && data.url) {
              // Open Stripe customer portal
              await WebBrowser.openBrowserAsync(data.url);

              // Reload subscription after portal closes
              await loadSubscription();
            } else {
              Alert.alert(
                'Portal Not Available',
                'The billing portal is being set up. In the meantime, you can:\n\n• View your plan details here\n• Change plans from the "Change Plan" button\n• Contact support@sixseven.app for billing questions'
              );
            }
          } catch (error) {
            console.error('Portal error:', error);
            Alert.alert(
              'Portal Not Available',
              'The billing portal is being set up. You can contact support@sixseven.app for billing assistance.'
            );
          } finally {
            setManagingSubscription(false);
          }
        },
      },
      {
        text: 'Cancel Subscription',
        style: 'destructive',
        onPress: () => {
          Alert.alert(
            'Cancel Subscription',
            "To cancel your subscription, please contact us at support@sixseven.app and we'll process your cancellation immediately.",
            [{ text: 'OK' }]
          );
        },
      },
    ]);
  };

  const handleUpgrade = () => {
    router.push('/topup' as any);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return '#4CAF50';
      case 'past_due':
        return '#FF9800';
      case 'canceled':
        return '#F44336';
      default:
        return '#999999';
    }
  };

  const getPlanName = (plan?: string) => {
    if (plan === 'weekly') return 'Weekly - $7/week';
    if (plan === 'yearly') return 'Yearly - $67/year';
    return 'No Plan';
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
          <TouchableOpacity style={styles.iconButton} onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>Subscription</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Subscription Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Current Plan */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: iconColor }]}>Current Plan</Text>
            <View style={[styles.statusCard, { backgroundColor: textColor + '05' }]}>
              <View style={styles.statusHeader}>
                <Ionicons name="card-outline" size={32} color={tintColor} />
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(subscription?.status) }]}>
                  <Text style={styles.statusBadgeText}>{subscription?.status?.toUpperCase() || 'INACTIVE'}</Text>
                </View>
              </View>

              <View style={styles.statusDetails}>
                <Text style={[styles.statusLabel, { color: iconColor }]}>Plan</Text>
                <Text style={[styles.statusValue, { color: textColor }]}>
                  {subscription?.subscribed ? getPlanName(subscription?.plan) : 'No Active Subscription'}
                </Text>
                {!subscription?.subscribed && (
                  <Text style={[styles.planTypeLabel, { color: iconColor }]}>Subscribe to unlock all features</Text>
                )}
                {subscription?.plan && (
                  <Text style={[styles.planTypeLabel, { color: tintColor }]}>
                    {subscription.plan === 'weekly' ? '🔄 Weekly Billing' : '📅 Annual Billing'}
                  </Text>
                )}
              </View>

              {subscription?.subscribed && (
                <>
                  <View style={[styles.divider, { backgroundColor: textColor + '10' }]} />

                  <View style={styles.statusDetails}>
                    <Text style={[styles.statusLabel, { color: iconColor }]}>Plan Details</Text>
                    <Text style={[styles.statusValue, { color: textColor }]}>
                      {subscription?.plan === 'weekly' ? '$7 charged weekly' : '$67 charged annually'}
                    </Text>
                  </View>

                  <View style={styles.statusDetails}>
                    <Text style={[styles.statusLabel, { color: iconColor }]}>Next Billing Date</Text>
                    <Text style={[styles.statusValue, { color: textColor }]}>{formatDate(subscription?.endsAt) || 'Loading...'}</Text>
                  </View>

                  <View style={styles.statusDetails}>
                    <Text style={[styles.statusLabel, { color: iconColor }]}>Subscription Status</Text>
                    <Text style={[styles.statusValue, { color: getStatusColor(subscription?.status) }]}>
                      {subscription?.status === 'active' ? '✓ Active & Renewing' : subscription?.status || 'Unknown'}
                    </Text>
                  </View>

                  <View style={styles.statusDetails}>
                    <Text style={[styles.statusLabel, { color: iconColor }]}>Benefits Included</Text>
                    <View style={styles.benefitsList}>
                      <Text style={[styles.benefitItem, { color: iconColor }]}>• Unlimited Gen Alpha translations</Text>
                      <Text style={[styles.benefitItem, { color: iconColor }]}>• Chat screenshot analysis</Text>
                      <Text style={[styles.benefitItem, { color: iconColor }]}>• Priority support</Text>
                      <Text style={[styles.benefitItem, { color: iconColor }]}>• Cancel anytime</Text>
                    </View>
                  </View>
                </>
              )}
            </View>
          </View>

          {/* Actions */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: iconColor }]}>Actions</Text>
            <View style={[styles.menuGroup, { backgroundColor: textColor + '05' }]}>
              {subscription?.subscribed ? (
                <>
                  <TouchableOpacity
                    style={[styles.menuItem, { borderBottomColor: textColor + '10' }]}
                    onPress={handleManageSubscription}
                    disabled={managingSubscription}
                    activeOpacity={0.7}
                  >
                    {managingSubscription ? (
                      <ActivityIndicator color={tintColor} size="small" />
                    ) : (
                      <>
                        <View style={styles.menuItemLeft}>
                          <Ionicons name="card-outline" size={20} color={textColor} />
                          <Text style={[styles.menuItemText, { color: textColor }]}>Billing & Cancellation</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={iconColor} />
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={handleUpgrade}
                    activeOpacity={0.7}
                  >
                    <View style={styles.menuItemLeft}>
                      <Ionicons name="trending-up-outline" size={20} color={textColor} />
                      <Text style={[styles.menuItemText, { color: textColor }]}>Change Plan</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={iconColor} />
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleUpgrade}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuItemLeft}>
                    <Ionicons name="rocket-outline" size={20} color={tintColor} />
                    <Text style={[styles.menuItemText, { color: tintColor }]}>Subscribe Now</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={tintColor} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Information */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: iconColor }]}>Information</Text>
            <View style={styles.infoGrid}>
              <View style={[styles.infoItem, { backgroundColor: textColor + '05' }]}>
                <Ionicons name="shield-checkmark-outline" size={24} color="#4CAF50" />
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoTitle, { color: textColor }]}>Secure Payments</Text>
                  <Text style={[styles.infoText, { color: iconColor }]}>All payments are processed securely through Stripe</Text>
                </View>
              </View>

              <View style={[styles.infoItem, { backgroundColor: textColor + '05' }]}>
                <Ionicons name="refresh-outline" size={24} color="#2196F3" />
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoTitle, { color: textColor }]}>Easy Cancellation</Text>
                  <Text style={[styles.infoText, { color: iconColor }]}>Cancel anytime from the subscription portal</Text>
                </View>
              </View>

              <View style={[styles.infoItem, { backgroundColor: textColor + '05' }]}>
                <Ionicons name="mail-outline" size={24} color="#FF9800" />
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoTitle, { color: textColor }]}>Need Help?</Text>
                  <Text style={[styles.infoText, { color: iconColor }]}>Contact us at support@sixseven.app</Text>
                </View>
              </View>
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

  // Sections
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

  // Status card
  statusCard: {
    borderRadius: 16,
    padding: 20,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'SpaceGrotesk_700Bold',
    letterSpacing: 0.5,
  },
  statusDetails: {
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 12,
    fontFamily: 'SpaceGrotesk_400Regular',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'SpaceGrotesk_600SemiBold',
  },
  planTypeLabel: {
    fontSize: 13,
    fontFamily: 'SpaceGrotesk_400Regular',
    marginTop: 4,
  },
  benefitsList: {
    marginTop: 8,
    gap: 6,
  },
  benefitItem: {
    fontSize: 14,
    fontFamily: 'SpaceGrotesk_400Regular',
    lineHeight: 20,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 16,
  },

  // Menu
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
    borderBottomColor: 'transparent',
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

  // Information grid
  infoGrid: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'SpaceGrotesk_600SemiBold',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    fontFamily: 'SpaceGrotesk_400Regular',
    lineHeight: 18,
  },
});
