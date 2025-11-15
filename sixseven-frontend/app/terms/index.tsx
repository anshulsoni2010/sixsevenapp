import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TermsOfServiceScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
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
          <Text style={styles.headerTitle}>Terms of Service</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <Text style={styles.lastUpdated}>Last updated: November 1, 2025</Text>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
              <Text style={styles.paragraph}>
                By accessing or using the 6 7 application, you agree to be bound by these Terms of Service. 
                If you do not agree to these terms, you may not use the application.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>2. Description of Service</Text>
              <Text style={styles.paragraph}>
                6 7 provides language translation and text analysis services through a mobile application. 
                The service is offered on a subscription basis.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>3. User Accounts</Text>
              <Text style={styles.paragraph}>
                To access the service, you must create an account. You are responsible for maintaining the 
                confidentiality of your account credentials and for all activities that occur under your account.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>4. Subscription and Payment</Text>
              <Text style={styles.paragraph}>
                Subscriptions are billed on a recurring basis. Payment will be charged to your payment method 
                at the start of each billing period. Subscriptions automatically renew unless canceled prior 
                to the renewal date. All fees are in U.S. dollars and are non-refundable except as stated in 
                our Refund Policy.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>5. Cancellation</Text>
              <Text style={styles.paragraph}>
                You may cancel your subscription at any time. Upon cancellation, you will retain access to 
                the service until the end of your current billing period.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>6. Prohibited Conduct</Text>
              <Text style={styles.paragraph}>
                You may not use the service in any manner that violates applicable laws or infringes upon the 
                rights of others. You may not attempt to interfere with, disrupt, or gain unauthorized access 
                to the service or its related systems.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>7. Intellectual Property</Text>
              <Text style={styles.paragraph}>
                All content and materials available through the service are protected by intellectual property 
                rights and are the property of 6 7 or its licensors.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>8. Termination</Text>
              <Text style={styles.paragraph}>
                We may suspend or terminate your access to the service at any time, with or without notice, 
                for violation of these Terms or for any other reason.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>9. Disclaimer of Warranties</Text>
              <Text style={styles.paragraph}>
                The service is provided "as is" without warranties of any kind, either express or implied. 
                We do not warrant that the service will be uninterrupted or error-free.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>10. Limitation of Liability</Text>
              <Text style={styles.paragraph}>
                To the maximum extent permitted by law, 6 7 shall not be liable for any indirect, incidental, 
                special, or consequential damages arising out of or related to your use of the service.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>11. Changes to Terms</Text>
              <Text style={styles.paragraph}>
                We may modify these Terms at any time. Changes will be effective upon posting. Your continued 
                use of the service after changes are posted constitutes acceptance of the modified Terms.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>12. Governing Law</Text>
              <Text style={styles.paragraph}>
                These Terms are governed by the laws of the United States without regard to conflict of law principles.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>13. Contact</Text>
              <Text style={styles.paragraph}>
                For questions regarding these Terms of Service, please contact:
              </Text>
              <Text style={styles.contactText}>support@sixseven.app</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
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
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'SpaceGrotesk_700Bold',
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 15,
    color: '#E6E6E6',
    fontFamily: 'Outfit_400Regular',
    lineHeight: 24,
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
    fontSize: 15,
    color: '#FFFFFF',
    fontFamily: 'Outfit_400Regular',
    marginTop: 6,
  },
});
