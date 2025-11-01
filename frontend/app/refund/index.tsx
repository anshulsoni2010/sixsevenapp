import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function RefundPolicyScreen() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={['#4D3A28', '#000000', '#000000']}
      locations={[0, 0.35, 1]}
      style={styles.container}
    >
      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Refund Policy</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <Text style={styles.lastUpdated}>Last updated: November 1, 2025</Text>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>30-Day Money-Back Guarantee</Text>
              <Text style={styles.paragraph}>
                We stand behind the quality of 6 7. If you're not completely satisfied with your subscription, 
                you can request a full refund within 30 days of your initial purchase.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>How to Request a Refund</Text>
              <Text style={styles.paragraph}>
                To request a refund, please contact our support team at support@sixseven.app with:
              </Text>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Your account email address</Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Order/subscription ID</Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Reason for refund (optional but appreciated)</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Refund Processing Time</Text>
              <Text style={styles.paragraph}>
                Once your refund request is approved, it will be processed within 5-7 business days. 
                The refund will be credited to your original payment method.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Subscription Cancellation</Text>
              <Text style={styles.paragraph}>
                You can cancel your subscription at any time through your account settings or by contacting support. 
                Upon cancellation, you'll continue to have access to premium features until the end of your current billing period.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Exceptions</Text>
              <Text style={styles.paragraph}>
                Refunds are not available for:
              </Text>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Subscriptions older than 30 days</Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Accounts that have violated our Terms of Service</Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Promotional or discounted subscriptions (unless required by law)</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Contact Us</Text>
              <Text style={styles.paragraph}>
                If you have any questions about our refund policy, please contact us at:
              </Text>
              <Text style={styles.contactText}>support@sixseven.app</Text>
            </View>
          </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
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
  placeholder: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#9ca3af',
    fontFamily: 'Outfit_400Regular',
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFE0C2',
    fontFamily: 'SpaceGrotesk_700Bold',
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 15,
    color: '#E6E6E6',
    fontFamily: 'Outfit_400Regular',
    lineHeight: 24,
    marginBottom: 12,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 12,
  },
  bullet: {
    fontSize: 15,
    color: '#FFE0C2',
    marginRight: 12,
    fontWeight: '700',
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    color: '#E6E6E6',
    fontFamily: 'Outfit_400Regular',
    lineHeight: 24,
  },
  contactText: {
    fontSize: 16,
    color: '#FFE0C2',
    fontFamily: 'SpaceGrotesk_700Bold',
    marginTop: 8,
  },
});
