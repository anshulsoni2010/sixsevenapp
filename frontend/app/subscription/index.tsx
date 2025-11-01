import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';

interface SubscriptionData {
  subscribed: boolean;
  plan?: string;
  status?: string;
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
      
      // First, try to sync subscription data from Stripe
      try {
        await fetch(`${BACKEND}/api/stripe/sync-subscription`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
        });
        console.log('Synced subscription from Stripe');
      } catch (syncError) {
        console.log('Could not sync subscription, continuing with cached data');
      }
      
      // Then fetch the updated subscription data
      const response = await fetch(`${BACKEND}/api/user/me`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Subscription data:', data);
        setSubscription(data);
      } else {
        console.error('Failed to fetch subscription:', response.status);
        // Set empty subscription data to show "No Active Subscription"
        setSubscription({ subscribed: false });
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
      // Set empty subscription data instead of showing alert
      setSubscription({ subscribed: false });
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    Alert.alert(
      'Manage Subscription',
      'Choose how you want to manage your subscription:',
      [
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
                  'Authorization': `Bearer ${token}`,
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
              'To cancel your subscription, please contact us at support@sixseven.app and we\'ll process your cancellation immediately.',
              [{ text: 'OK' }]
            );
          },
        },
      ]
    );
  };

  const handleUpgrade = () => {
    router.push('/topup' as any);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'past_due': return '#FF9800';
      case 'canceled': return '#F44336';
      default: return '#999999';
    }
  };

  const getPlanName = (plan?: string) => {
    if (plan === 'weekly') return 'Weekly - $7/week';
    if (plan === 'yearly') return 'Yearly - $67/year';
    return 'No Plan';
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#4D3A28', '#000000', '#000000']}
          locations={[0, 0.35, 1]}
          style={styles.gradient}
        >
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FFE0C2" />
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4D3A28', '#000000', '#000000']}
        locations={[0, 0.35, 1]}
        style={styles.gradient}
      >
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => router.back()}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Subscription</Text>
              <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
              {/* Subscription Status Card */}
              <View style={styles.statusCard}>
                <View style={styles.statusHeader}>
                  <Ionicons name="card" size={32} color="#FFE0C2" />
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(subscription?.status) }]}>
                    <Text style={styles.statusBadgeText}>
                      {subscription?.status?.toUpperCase() || 'INACTIVE'}
                    </Text>
                  </View>
                </View>

                <View style={styles.statusDetails}>
                  <Text style={styles.statusLabel}>Current Plan</Text>
                  <Text style={styles.statusValue}>
                    {subscription?.subscribed 
                      ? getPlanName(subscription?.plan) 
                      : 'No Active Subscription'}
                  </Text>
                  {!subscription?.subscribed && (
                    <Text style={styles.planTypeLabel}>
                      Subscribe to unlock all features
                    </Text>
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
                      <Text style={styles.statusLabel}>Next Billing Date</Text>
                      <Text style={styles.statusValue}>
                        {subscription?.endsAt 
                          ? formatDate(subscription?.endsAt)
                          : 'View in billing portal'}
                      </Text>
                      {!subscription?.endsAt && (
                        <Text style={styles.planTypeLabel}>
                          Tap "Manage Subscription" to view billing details
                        </Text>
                      )}
                    </View>

                    <View style={styles.statusDetails}>
                      <Text style={styles.statusLabel}>Status</Text>
                      <Text style={[styles.statusValue, { color: getStatusColor(subscription?.status) }]}>
                        {subscription?.status || 'Unknown'}
                      </Text>
                    </View>
                  </>
                )}
              </View>

              {/* Actions */}
              {subscription?.subscribed ? (
                <>
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={handleManageSubscription}
                    disabled={managingSubscription}
                    activeOpacity={0.8}
                  >
                    {managingSubscription ? (
                      <ActivityIndicator color="#111111" size="small" />
                    ) : (
                      <>
                        <Ionicons name="card" size={20} color="#111111" />
                        <Text style={styles.primaryButtonText}>Billing & Cancellation</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={handleUpgrade}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="trending-up" size={20} color="#FFE0C2" />
                    <Text style={styles.secondaryButtonText}>Change Plan</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleUpgrade}
                  activeOpacity={0.8}
                >
                  <Ionicons name="rocket" size={20} color="#111111" />
                  <Text style={styles.primaryButtonText}>Subscribe Now</Text>
                </TouchableOpacity>
              )}

              {/* Info Cards */}
              <View style={styles.infoSection}>
                <View style={styles.infoCard}>
                  <Ionicons name="shield-checkmark" size={24} color="#4CAF50" />
                  <Text style={styles.infoTitle}>Secure Payments</Text>
                  <Text style={styles.infoText}>
                    All payments are processed securely through Stripe
                  </Text>
                </View>

                <View style={styles.infoCard}>
                  <Ionicons name="refresh" size={24} color="#2196F3" />
                  <Text style={styles.infoTitle}>Easy Cancellation</Text>
                  <Text style={styles.infoText}>
                    Cancel anytime from the subscription portal
                  </Text>
                </View>

                <View style={styles.infoCard}>
                  <Ionicons name="mail" size={24} color="#FF9800" />
                  <Text style={styles.infoTitle}>Need Help?</Text>
                  <Text style={styles.infoText}>
                    Contact us at support@sixseven.app
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
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
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  content: {
    paddingHorizontal: 24,
  },
  statusCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
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
    fontSize: 13,
    color: '#B8B8B8',
    fontFamily: 'Outfit_400Regular',
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
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 16,
  },
  primaryButton: {
    backgroundColor: '#FFE0C2',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    flexDirection: 'row',
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111111',
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 224, 194, 0.1)',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 224, 194, 0.3)',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFE0C2',
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  infoSection: {
    gap: 16,
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'SpaceGrotesk_700Bold',
    marginTop: 12,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#B8B8B8',
    fontFamily: 'Outfit_400Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
});
