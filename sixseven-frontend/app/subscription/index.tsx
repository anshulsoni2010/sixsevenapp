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
  ImageBackground,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';

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

  const handleLogout = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await SecureStore.deleteItemAsync('session_token');
            router.replace('/onboarding' as any);
          } catch (error) {
            console.error('Error signing out:', error);
            Alert.alert('Error', 'Failed to sign out. Please try again.');
          }
        },
      },
    ]);
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
      <ImageBackground
        source={require('../../assets/images/chatscreenbg.png')}
        style={styles.container}
        resizeMode="cover"
      >
        <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
          <View style={styles.mainContainer}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FFE0C2" />
              <Text style={styles.loadingText}>Loading...</Text>
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
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.8}>
              <Ionicons name="chevron-back" size={24} color="#FFE0C2" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Subscription</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Subscription Content */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Current Plan */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Current Plan</Text>
              <View style={styles.statusCard}>
                <View style={styles.statusHeader}>
                  <Ionicons name="card" size={32} color="#FFE0C2" />
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(subscription?.status) }]}>
                    <Text style={styles.statusBadgeText}>{subscription?.status?.toUpperCase() || 'INACTIVE'}</Text>
                  </View>
                </View>

                <View style={styles.statusDetails}>
                  <Text style={styles.statusLabel}>Plan</Text>
                  <Text style={styles.statusValue}>
                    {subscription?.subscribed ? getPlanName(subscription?.plan) : 'No Active Subscription'}
                  </Text>
                  {!subscription?.subscribed && (
                    <Text style={styles.planTypeLabel}>Subscribe to unlock all features</Text>
                  )}
                  {subscription?.plan && (
                    <Text style={styles.planTypeLabel}>
                      {subscription.plan === 'weekly' ? '🔄 Weekly Billing' : '📅 Annual Billing'}
                    </Text>
                  )}
                </View>

                {subscription?.subscribed && (
                  <>
                    <View style={styles.divider} />

                    <View style={styles.statusDetails}>
                      <Text style={styles.statusLabel}>Plan Details</Text>
                      <Text style={styles.statusValue}>
                        {subscription?.plan === 'weekly' ? '$7 charged weekly' : '$67 charged annually'}
                      </Text>
                    </View>

                    <View style={styles.statusDetails}>
                      <Text style={styles.statusLabel}>Next Billing Date</Text>
                      <Text style={styles.statusValue}>{formatDate(subscription?.endsAt) || 'Loading...'}</Text>
                    </View>

                    <View style={styles.statusDetails}>
                      <Text style={styles.statusLabel}>Subscription Status</Text>
                      <Text style={[styles.statusValue, { color: getStatusColor(subscription?.status) }]}>
                        {subscription?.status === 'active' ? '✓ Active & Renewing' : subscription?.status || 'Unknown'}
                      </Text>
                    </View>

                    <View style={styles.statusDetails}>
                      <Text style={styles.statusLabel}>Benefits Included</Text>
                      <View style={styles.benefitsList}>
                        <Text style={styles.benefitItem}>• Unlimited Gen Alpha translations</Text>
                        <Text style={styles.benefitItem}>• Chat screenshot analysis</Text>
                        <Text style={styles.benefitItem}>• Priority support</Text>
                        <Text style={styles.benefitItem}>• Cancel anytime</Text>
                      </View>
                    </View>
                  </>
                )}
              </View>
            </View>

            {/* Actions */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Actions</Text>
              <View style={styles.actionsContainer}>
                {subscription?.subscribed ? (
                  <>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={handleManageSubscription}
                      disabled={managingSubscription}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={['#2E2E2E', '#2A2A2A']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={styles.actionButtonGradient}
                      >
                        {managingSubscription ? (
                          <ActivityIndicator color="#FFE0C2" size="small" />
                        ) : (
                          <>
                            <Ionicons name="card" size={24} color="#FFE0C2" />
                            <Text style={styles.actionButtonText}>Billing & Cancellation</Text>
                            <Ionicons name="chevron-forward" size={20} color="#FFE0C2" />
                          </>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton} onPress={handleUpgrade} activeOpacity={0.8}>
                      <LinearGradient
                        colors={['#2E2E2E', '#2A2A2A']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={styles.actionButtonGradient}
                      >
                        <Ionicons name="trending-up" size={24} color="#FFE0C2" />
                        <Text style={styles.actionButtonText}>Change Plan</Text>
                        <Ionicons name="chevron-forward" size={20} color="#FFE0C2" />
                      </LinearGradient>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity style={styles.actionButton} onPress={handleUpgrade} activeOpacity={0.8}>
                    <LinearGradient
                      colors={['#FFE0C2', '#FFD700']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.actionButtonGradient}
                    >
                      <Ionicons name="rocket" size={24} color="#111111" />
                      <Text style={[styles.actionButtonText, { color: '#111111' }]}>Subscribe Now</Text>
                      <Ionicons name="chevron-forward" size={20} color="#111111" />
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Information */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Information</Text>
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Ionicons name="shield-checkmark" size={24} color="#4CAF50" />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoTitle}>Secure Payments</Text>
                    <Text style={styles.infoText}>All payments are processed securely through Stripe</Text>
                  </View>
                </View>

                <View style={styles.infoItem}>
                  <Ionicons name="refresh" size={24} color="#2196F3" />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoTitle}>Easy Cancellation</Text>
                    <Text style={styles.infoText}>Cancel anytime from the subscription portal</Text>
                  </View>
                </View>

                <View style={styles.infoItem}>
                  <Ionicons name="mail" size={24} color="#FF9800" />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoTitle}>Need Help?</Text>
                    <Text style={styles.infoText}>Contact us at support@sixseven.app</Text>
                  </View>
                </View>
              </View>
            </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#FFE0C2',
    fontFamily: 'SpaceGrotesk_400Regular',
    marginTop: 16,
  },
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

  // New sections
  sectionContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFE0C2',
    fontFamily: 'SpaceGrotesk_700Bold',
    marginBottom: 16,
  },
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

  // Status card
  statusCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 224, 194, 0.2)',
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  statusDetails: {
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 12,
    color: '#B4B4B4',
    fontFamily: 'SpaceGrotesk_400Regular',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  statusValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  planTypeLabel: {
    fontSize: 13,
    color: '#FFE0C2',
    fontFamily: 'Outfit_400Regular',
    marginTop: 4,
  },
  benefitsList: {
    marginTop: 8,
    gap: 6,
  },
  benefitItem: {
    fontSize: 14,
    color: '#E6E6E6',
    fontFamily: 'Outfit_400Regular',
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 16,
  },

  // Information grid
  infoGrid: {
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'SpaceGrotesk_700Bold',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#B8B8B8',
    fontFamily: 'Outfit_400Regular',
    lineHeight: 20,
  },
});
