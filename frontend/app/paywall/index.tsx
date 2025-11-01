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
    name: 'Monthly',
    price: '$9.99',
    period: 'per month',
    priceId: 'price_monthly', // Replace with actual Stripe price ID
    features: [
      'Unlimited Gen Alpha translations',
      'Chat screenshot analysis',
      'Priority support',
      'Cancel anytime',
    ],
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: '$79.99',
    period: 'per year',
    priceId: 'price_yearly', // Replace with actual Stripe price ID
    popular: true,
    features: [
      'Everything in Monthly',
      'Save 33% compared to monthly',
      '2 months free',
      'Priority support',
      'Early access to new features',
    ],
  },
];

export default function PaywallScreen() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string>('yearly');
  const [loading, setLoading] = useState(false);

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

  return (
    <LinearGradient
      colors={['#1a1a1a', '#0a0a0a']}
      style={styles.container}
    >
      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Choose Your Plan</Text>
            <Text style={styles.subtitle}>
              Unlock unlimited Gen Alpha translations and chat analysis
            </Text>
          </View>

          {/* What You Get Section */}
          <View style={styles.benefitsSection}>
            <Text style={styles.benefitsTitle}>What You Get</Text>
            <View style={styles.benefitsGrid}>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>💎</Text>
                <Text style={styles.benefitLabel}>Plan Title</Text>
                <Text style={styles.benefitValue}>
                  {plans.find(p => p.id === selectedPlan)?.name || 'Yearly'}
                </Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>💰</Text>
                <Text style={styles.benefitLabel}>Plan Cost</Text>
                <Text style={styles.benefitValue}>
                  {plans.find(p => p.id === selectedPlan)?.price || '$79.99'}
                </Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>⏱️</Text>
                <Text style={styles.benefitLabel}>Plan Duration</Text>
                <Text style={styles.benefitValue}>
                  {plans.find(p => p.id === selectedPlan)?.period.replace('per ', '') || 'year'}
                </Text>
              </View>
            </View>
          </View>

          {/* Plans */}
          <View style={styles.plansContainer}>
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
                    <Text style={styles.popularText}>MOST POPULAR</Text>
                  </View>
                )}

                <View style={styles.planHeader}>
                  <Text style={styles.planName}>{plan.name}</Text>
                  <View style={styles.priceContainer}>
                    <Text style={styles.planPrice}>{plan.price}</Text>
                    <Text style={styles.planPeriod}>{plan.period}</Text>
                  </View>
                </View>

                <View style={styles.featuresContainer}>
                  {plan.features.map((feature, index) => (
                    <View key={index} style={styles.featureRow}>
                      <Text style={styles.checkmark}>✓</Text>
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>

                {selectedPlan === plan.id && (
                  <View style={styles.selectedIndicator}>
                    <View style={styles.selectedDot} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Subscribe Button */}
          <TouchableOpacity
            style={[styles.subscribeButton, loading && styles.subscribeButtonDisabled]}
            onPress={handleSubscribe}
            disabled={loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#6366f1', '#4f46e5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.subscribeGradient}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.subscribeButtonText}>
                  Subscribe to {plans.find(p => p.id === selectedPlan)?.name}
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Footer */}
          <Text style={styles.footerText}>
            Secure payment powered by Stripe • Cancel anytime
          </Text>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    marginTop: 20,
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    fontFamily: 'SpaceGrotesk_700Bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    fontFamily: 'Outfit_400Regular',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  benefitsSection: {
    backgroundColor: '#1f1f1f',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#2a2a2a',
  },
  benefitsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    fontFamily: 'SpaceGrotesk_700Bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  benefitsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  benefitItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
  },
  benefitIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  benefitLabel: {
    fontSize: 12,
    color: '#9ca3af',
    fontFamily: 'Outfit_400Regular',
    marginBottom: 4,
    textAlign: 'center',
  },
  benefitValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    fontFamily: 'SpaceGrotesk_700Bold',
    textAlign: 'center',
  },
  plansContainer: {
    gap: 16,
    marginBottom: 24,
  },
  planCard: {
    backgroundColor: '#1f1f1f',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#2a2a2a',
    position: 'relative',
  },
  planCardSelected: {
    borderColor: '#6366f1',
    backgroundColor: '#1a1d3a',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: 20,
    backgroundColor: '#6366f1',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'SpaceGrotesk_700Bold',
    letterSpacing: 0.5,
  },
  planHeader: {
    marginBottom: 20,
  },
  planName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    fontFamily: 'SpaceGrotesk_700Bold',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  planPrice: {
    fontSize: 36,
    fontWeight: '700',
    color: '#ffffff',
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  planPeriod: {
    fontSize: 16,
    color: '#9ca3af',
    fontFamily: 'Outfit_400Regular',
  },
  featuresContainer: {
    gap: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkmark: {
    fontSize: 18,
    color: '#6366f1',
    fontWeight: '700',
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    color: '#d1d5db',
    fontFamily: 'Outfit_400Regular',
    lineHeight: 22,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1d3a',
  },
  selectedDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#6366f1',
  },
  subscribeButton: {
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  subscribeButtonDisabled: {
    opacity: 0.6,
  },
  subscribeGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscribeButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  footerText: {
    fontSize: 13,
    color: '#6b7280',
    fontFamily: 'Outfit_400Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
});
