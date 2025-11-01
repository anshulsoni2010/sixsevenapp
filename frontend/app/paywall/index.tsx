import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  popular?: boolean;
  priceId: string; // Stripe Price ID
}

const plans: Plan[] = [
  {
    id: 'monthly',
    name: 'Alpha Plus',
    price: '$9.99',
    period: 'per month',
    priceId: 'price_monthly', // Replace with actual Stripe price ID
    features: [
      'Unlimited Gen Alpha translations',
      'Chat screenshot analysis',
      'Cancel anytime',
    ],
  },
  {
    id: 'yearly',
    name: 'Alpha Max',
    price: '$79.99',
    period: 'per year',
    priceId: 'price_yearly', // Replace with actual Stripe price ID
    popular: true,
    features: [
      'Everything in Alpha Plus',
      'Save 33% compared to monthly',
      '2 months free',
      'Early access to new features',
    ],
  },
];

export default function PaywallScreen() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string>('yearly');
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await SecureStore.deleteItemAsync('session_token');
            await AsyncStorage.removeItem('isLoggedIn');
            router.replace('/onboarding');
          },
        },
      ]
    );
  };

  // Check if user is already subscribed - if so, redirect to chat
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token = await SecureStore.getItemAsync('session_token');
        if (!token) {
          if (mounted) router.replace('/onboarding' as any);
          return;
        }

        const BACKEND = Constants.expoConfig?.extra?.BACKEND_URL ?? 'http://localhost:3000';
        const response = await fetch(`${BACKEND}/api/user/me`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.subscribed && mounted) {
            // Already subscribed - redirect to chat
            router.replace('/chat' as any);
          }
        }
      } catch (e) {
        console.error('Error checking subscription:', e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [router]);

  const handleSubscribe = async () => {
    try {
      setLoading(true);
      
      const plan = plans.find(p => p.id === selectedPlan);
      if (!plan) return;

      const token = await SecureStore.getItemAsync('session_token');
      if (!token) {
        Alert.alert('Error', 'Please sign in again');
        return;
      }

      const BACKEND = Constants.expoConfig?.extra?.BACKEND_URL ?? 'http://localhost:3000';
      
      // Create Stripe checkout session
      const response = await fetch(`${BACKEND}/api/stripe/create-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          priceId: plan.priceId,
          planType: plan.id,
        }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        // TODO: Open Stripe checkout URL in WebBrowser
        // For now, we'll simulate success after a delay
        console.log('Stripe checkout URL:', data.url);
        
        // In production, you would:
        // 1. Open WebBrowser with the checkout URL
        // 2. Listen for redirect back to app
        // 3. Verify subscription status
        
        Alert.alert(
          'Subscription',
          'In production, this would open Stripe checkout. For now, navigate to chat?',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Continue to Chat', 
              onPress: () => router.replace('/chat' as any) 
            },
          ]
        );
      } else {
        Alert.alert('Error', data.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      Alert.alert('Error', 'Failed to start subscription process');
    } finally {
      setLoading(false);
    }
  };

  const handleRestorePurchases = async () => {
    try {
      setLoading(true);
      
      const token = await SecureStore.getItemAsync('session_token');
      if (!token) {
        Alert.alert('Error', 'Please sign in again');
        return;
      }

      const BACKEND = Constants.expoConfig?.extra?.BACKEND_URL ?? 'http://localhost:3000';
      
      // Check subscription status from backend
      const response = await fetch(`${BACKEND}/api/user/me`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.subscribed) {
          Alert.alert(
            'Success',
            'Your subscription has been restored!',
            [{ 
              text: 'Continue', 
              onPress: () => router.replace('/chat' as any) 
            }]
          );
        } else {
          Alert.alert(
            'No Subscription Found',
            'We couldn\'t find an active subscription for your account. If you believe this is an error, please contact support at support@sixseven.app'
          );
        }
      } else {
        Alert.alert('Error', 'Failed to check subscription status');
      }
    } catch (error) {
      console.error('Restore error:', error);
      Alert.alert('Error', 'Failed to restore purchases');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4D3A28', '#000000', '#000000']}
        locations={[0, 0.35, 1]}
        style={styles.gradient}
      >
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          {/* Logout Button - Top Right */}
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerIconContainer}>
                <Ionicons name="rocket" size={32} color="#FFE0C2" />
              </View>
              <Text style={styles.title}>Unlock Full Access</Text>
              <Text style={styles.subtitle}>
                Join thousands speaking fluent Gen Alpha
              </Text>
            </View>

            {/* Features List */}
            <View style={styles.featuresSection}>
              <View style={styles.featureItem}>
                <View style={styles.featureIconContainer}>
                  <Ionicons name="chatbubbles" size={20} color="#FFE0C2" />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Unlimited Translations</Text>
                  <Text style={styles.featureDescription}>
                    Translate any text to and from Gen Alpha instantly
                  </Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <View style={styles.featureIconContainer}>
                  <Ionicons name="camera" size={20} color="#FFE0C2" />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Screenshot Analysis</Text>
                  <Text style={styles.featureDescription}>
                    Understand any Gen Alpha chat or meme
                  </Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <View style={styles.featureIconContainer}>
                  <Ionicons name="flash" size={20} color="#FFE0C2" />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Real-Time Updates</Text>
                  <Text style={styles.featureDescription}>
                    Stay current with the latest slang and trends
                  </Text>
                </View>
              </View>
            </View>

            {/* Plans - Side by Side */}
            <View style={styles.plansContainer}>
              <View style={styles.plansRow}>
                {plans.map((plan) => (
                  <TouchableOpacity
                    key={plan.id}
                    style={[
                      styles.planCard,
                      selectedPlan === plan.id && styles.planCardSelected,
                    ]}
                    onPress={() => setSelectedPlan(plan.id)}
                    activeOpacity={0.8}
                  >
                    {plan.popular && (
                      <View style={styles.popularBadge}>
                        <Text style={styles.popularText}>BEST VALUE</Text>
                      </View>
                    )}

                    <Text style={styles.planName}>{plan.name}</Text>
                    <Text style={styles.planPrice}>{plan.price}</Text>
                    <Text style={styles.planPeriod}>{plan.period}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Spacer for fixed bottom */}
            <View style={{ height: 200 }} />
          </View>
          </ScrollView>
        </SafeAreaView>

        {/* Fixed Bottom Section */}
        <View style={styles.fixedBottom}>
          <SafeAreaView edges={['bottom']}>
            <View style={styles.bottomContent}>
              {/* Subscribe Button */}
              <TouchableOpacity
                style={[styles.subscribeButton, loading && styles.subscribeButtonDisabled]}
                onPress={handleSubscribe}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#4D3A28" size="small" />
                ) : (
                  <Text style={styles.subscribeButtonText}>
                    Start Free Trial
                  </Text>
                )}
              </TouchableOpacity>

              {/* Restore Button */}
              <TouchableOpacity
                style={styles.restoreButton}
                onPress={handleRestorePurchases}
                disabled={loading}
                activeOpacity={0.7}
              >
                <Text style={styles.restoreButtonText}>
                  Restore Purchases
                </Text>
              </TouchableOpacity>

              {/* Footer Text */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  Cancel anytime • Secure payment via Stripe
                </Text>
                
                {/* Legal Links */}
                <View style={styles.legalLinks}>
                  <TouchableOpacity onPress={() => router.push('/terms' as any)}>
                    <Text style={styles.legalLink}>Terms</Text>
                  </TouchableOpacity>
                  <Text style={styles.legalSeparator}>•</Text>
                  <TouchableOpacity onPress={() => router.push('/privacy' as any)}>
                    <Text style={styles.legalLink}>Privacy</Text>
                  </TouchableOpacity>
                  <Text style={styles.legalSeparator}>•</Text>
                  <TouchableOpacity onPress={() => router.push('/refund' as any)}>
                    <Text style={styles.legalLink}>Refund</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </View>
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
  },
  logoutButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  header: {
    marginTop: 24,
    marginBottom: 28,
    alignItems: 'center',
  },
  headerIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 224, 194, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 224, 194, 0.2)',
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'SpaceGrotesk_700Bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#E6E6E6',
    fontFamily: 'Outfit_400Regular',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  featuresSection: {
    marginBottom: 28,
    gap: 18,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  featureIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 224, 194, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'SpaceGrotesk_700Bold',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#E6E6E6',
    fontFamily: 'Outfit_400Regular',
    lineHeight: 21,
    opacity: 0.8,
  },
  plansContainer: {
    marginBottom: 28,
  },
  plansRow: {
    flexDirection: 'row',
    gap: 10,
  },
  planCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 18,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    position: 'relative',
    alignItems: 'center',
    minHeight: 150,
    justifyContent: 'center',
  },
  planCardSelected: {
    borderColor: '#FFE0C2',
    backgroundColor: 'rgba(255, 224, 194, 0.08)',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    alignSelf: 'center',
    backgroundColor: '#FFE0C2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  popularText: {
    color: '#111111',
    fontSize: 9,
    fontWeight: '700',
    fontFamily: 'SpaceGrotesk_700Bold',
    letterSpacing: 0.5,
  },
  planName: {
    fontSize: 19,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'SpaceGrotesk_700Bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  planPrice: {
    fontSize: 30,
    fontWeight: '700',
    color: '#FFE0C2',
    fontFamily: 'SpaceGrotesk_700Bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  planPeriod: {
    fontSize: 13,
    color: '#E6E6E6',
    fontFamily: 'Outfit_400Regular',
    opacity: 0.7,
    textAlign: 'center',
  },
  fixedBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.98)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 224, 194, 0.2)',
  },
  bottomContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  subscribeButton: {
    backgroundColor: '#FFE0C2',
    borderRadius: 12,
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 11,
  },
  subscribeButtonDisabled: {
    opacity: 0.6,
  },
  subscribeButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  restoreButton: {
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 11,
  },
  restoreButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFE0C2',
    fontFamily: 'SpaceGrotesk_700Bold',
    opacity: 0.8,
  },
  footer: {
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    fontSize: 13,
    color: '#E6E6E6',
    fontFamily: 'Outfit_400Regular',
    textAlign: 'center',
    opacity: 0.7,
  },
  legalLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  legalLink: {
    fontSize: 13,
    color: '#FFE0C2',
    fontFamily: 'SpaceGrotesk_700Bold',
    textDecorationLine: 'underline',
  },
  legalSeparator: {
    fontSize: 13,
    color: '#E6E6E6',
    opacity: 0.5,
  },
  refundLink: {
    fontSize: 13,
    color: '#FFE0C2',
    fontFamily: 'SpaceGrotesk_700Bold',
    textDecorationLine: 'underline',
  },
});
