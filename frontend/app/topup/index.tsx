import React, { useState } from 'react';
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

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  popular?: boolean;
  priceId: string;
  savings?: string;
}

const plans: Plan[] = [
  {
    id: 'weekly',
    name: 'Weekly',
    price: '$7',
    period: 'per week',
    priceId: 'price_1SOY36SqLmTfZy1OrNwstW46',
    features: [
      'Unlimited Gen Alpha translations',
      'Chat screenshot analysis',
      'Cancel anytime',
      'Priority support',
    ],
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: '$67',
    period: 'per year',
    priceId: 'price_1SOY45SqLmTfZy1OjEZptDuV',
    popular: true,
    savings: 'Save over 80%',
    features: [
      'Everything in Weekly',
      'Save over 80%',
      'Priority support',
      'Early access to new features',
    ],
  },
];

export default function TopUpScreen() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string>('yearly');
  const [loading, setLoading] = useState(false);

  const handleChangePlan = async () => {
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
        // Open Stripe checkout in browser
        await WebBrowser.openBrowserAsync(data.url);
        
        Alert.alert(
          'Plan Change',
          'If you completed the payment, your plan will be updated shortly.',
          [
            {
              text: 'Back to Subscription',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert('Error', data.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Change plan error:', error);
      Alert.alert('Error', 'Failed to change plan');
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
              <Text style={styles.headerTitle}>Change Plan</Text>
              <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
              {/* Title */}
              <View style={styles.titleSection}>
                <Text style={styles.title}>Choose Your Plan</Text>
                <Text style={styles.subtitle}>
                  Select the plan that works best for you
                </Text>
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
                        <Text style={styles.popularText}>BEST VALUE</Text>
                      </View>
                    )}

                    <View style={styles.planHeader}>
                      <View style={styles.planNameSection}>
                        <Text style={styles.planName}>{plan.name}</Text>
                        {plan.savings && (
                          <View style={styles.savingsBadge}>
                            <Text style={styles.savingsText}>{plan.savings}</Text>
                          </View>
                        )}
                      </View>
                      <View style={[
                        styles.radioButton,
                        selectedPlan === plan.id && styles.radioButtonSelected,
                      ]}>
                        {selectedPlan === plan.id && (
                          <View style={styles.radioButtonInner} />
                        )}
                      </View>
                    </View>

                    <View style={styles.priceSection}>
                      <Text style={styles.planPrice}>{plan.price}</Text>
                      <Text style={styles.planPeriod}>{plan.period}</Text>
                    </View>

                    <View style={styles.featuresSection}>
                      {plan.features.map((feature, index) => (
                        <View key={index} style={styles.featureItem}>
                          <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                          <Text style={styles.featureText}>{feature}</Text>
                        </View>
                      ))}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Subscribe Button */}
              <TouchableOpacity
                style={[styles.subscribeButton, loading && styles.subscribeButtonDisabled]}
                onPress={handleChangePlan}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#111111" size="small" />
                ) : (
                  <Text style={styles.subscribeButtonText}>
                    Continue to Payment
                  </Text>
                )}
              </TouchableOpacity>

              {/* Info */}
              <Text style={styles.infoText}>
                • Secure payment via Stripe{'\n'}
                • Cancel anytime from subscription settings{'\n'}
                • Instant activation after payment
              </Text>
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
  titleSection: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'SpaceGrotesk_700Bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#B8B8B8',
    fontFamily: 'Outfit_400Regular',
    textAlign: 'center',
  },
  plansContainer: {
    gap: 16,
    marginBottom: 24,
  },
  planCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    position: 'relative',
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
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 1,
  },
  popularText: {
    color: '#111111',
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'SpaceGrotesk_700Bold',
    letterSpacing: 0.5,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  planNameSection: {
    flex: 1,
  },
  planName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'SpaceGrotesk_700Bold',
    marginBottom: 8,
  },
  savingsBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  savingsText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4CAF50',
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#FFE0C2',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFE0C2',
  },
  priceSection: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  planPrice: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFE0C2',
    fontFamily: 'SpaceGrotesk_700Bold',
    marginBottom: 4,
  },
  planPeriod: {
    fontSize: 14,
    color: '#B8B8B8',
    fontFamily: 'Outfit_400Regular',
  },
  featuresSection: {
    gap: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    fontSize: 14,
    color: '#E6E6E6',
    fontFamily: 'Outfit_400Regular',
    flex: 1,
  },
  subscribeButton: {
    backgroundColor: '#FFE0C2',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
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
  infoText: {
    fontSize: 13,
    color: '#B8B8B8',
    fontFamily: 'Outfit_400Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
});
