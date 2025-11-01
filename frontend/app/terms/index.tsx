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

export default function TermsOfServiceScreen() {
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
                By accessing and using 6 7 ("the App"), you accept and agree to be bound by these Terms of Service. 
                If you do not agree to these terms, please do not use the App.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>2. Description of Service</Text>
              <Text style={styles.paragraph}>
                6 7 provides Gen Alpha translation services, chat screenshot analysis, and related features. 
                The service is provided on a subscription basis with different tiers of access.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>3. User Accounts</Text>
              <Text style={styles.paragraph}>
                You must create an account to use the App. You agree to:
              </Text>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Provide accurate and complete information</Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Maintain the security of your account</Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Notify us immediately of any unauthorized access</Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Be responsible for all activities under your account</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>4. Subscription Terms</Text>
              <Text style={styles.paragraph}>
                Subscriptions are billed on a recurring basis (monthly or yearly). You authorize us to charge your 
                payment method for the subscription fee plus any applicable taxes. Your subscription will automatically 
                renew unless you cancel before the renewal date.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>5. Payment Terms</Text>
              <Text style={styles.paragraph}>
                All fees are in U.S. dollars and non-refundable except as required by law or as stated in our 
                Refund Policy. We reserve the right to change subscription fees with 30 days notice.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>6. Cancellation</Text>
              <Text style={styles.paragraph}>
                You may cancel your subscription at any time through your account settings or by contacting support. 
                Cancellation will take effect at the end of your current billing period. You will retain access to 
                premium features until that time.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>7. User Conduct</Text>
              <Text style={styles.paragraph}>
                You agree not to use the App to:
              </Text>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Violate any laws or regulations</Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Infringe upon others' intellectual property rights</Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Upload malicious code or viruses</Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Harass, abuse, or harm others</Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Attempt to access unauthorized areas of the service</Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Use automated systems to access the service</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>8. Intellectual Property</Text>
              <Text style={styles.paragraph}>
                The App and all content, features, and functionality are owned by 6 7 and are protected by 
                copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, 
                or create derivative works without our express written permission.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>9. Termination</Text>
              <Text style={styles.paragraph}>
                We reserve the right to suspend or terminate your account and access to the App at our discretion, 
                without notice, for conduct that we believe violates these Terms or is harmful to other users, 
                us, or third parties, or for any other reason.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>10. Disclaimers</Text>
              <Text style={styles.paragraph}>
                The App is provided "as is" without warranties of any kind, either express or implied. We do not 
                warrant that the App will be uninterrupted, secure, or error-free. You use the App at your own risk.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>11. Limitation of Liability</Text>
              <Text style={styles.paragraph}>
                To the maximum extent permitted by law, 6 7 shall not be liable for any indirect, incidental, 
                special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred 
                directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>12. Changes to Terms</Text>
              <Text style={styles.paragraph}>
                We reserve the right to modify these Terms at any time. We will notify you of material changes 
                by posting the new Terms and updating the "Last updated" date. Your continued use of the App 
                after changes constitutes acceptance of the new Terms.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>13. Governing Law</Text>
              <Text style={styles.paragraph}>
                These Terms shall be governed by and construed in accordance with the laws of the United States, 
                without regard to its conflict of law provisions.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>14. Contact Us</Text>
              <Text style={styles.paragraph}>
                If you have any questions about these Terms of Service, please contact us at:
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
