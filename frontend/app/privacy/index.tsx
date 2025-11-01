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

export default function PrivacyPolicyScreen() {
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
          <Text style={styles.headerTitle}>Privacy Policy</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <Text style={styles.lastUpdated}>Last updated: November 1, 2025</Text>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>1. Introduction</Text>
              <Text style={styles.paragraph}>
                6 7 ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains 
                how we collect, use, disclose, and safeguard your information when you use our mobile application.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>2. Information We Collect</Text>
              <Text style={styles.paragraph}>
                We collect information that you provide directly to us:
              </Text>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Account information (name, email, profile picture)</Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Authentication data from Google or Apple Sign-In</Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Payment information (processed securely through Stripe)</Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Chat messages and screenshots you submit for analysis</Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Usage data and analytics</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
              <Text style={styles.paragraph}>
                We use the information we collect to:
              </Text>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Provide, maintain, and improve our services</Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Process your transactions and subscriptions</Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Send you service-related communications</Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Respond to your comments, questions, and support requests</Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Monitor and analyze usage patterns and trends</Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Detect, prevent, and address technical issues or security concerns</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>4. How We Share Your Information</Text>
              <Text style={styles.paragraph}>
                We may share your information with:
              </Text>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Service providers (Stripe for payments, cloud hosting providers)</Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Law enforcement or regulatory authorities if required by law</Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Other parties with your consent</Text>
              </View>
              <Text style={styles.paragraph}>
                We do not sell your personal information to third parties.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>5. Data Security</Text>
              <Text style={styles.paragraph}>
                We implement appropriate technical and organizational measures to protect your personal information 
                against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission 
                over the internet or electronic storage is 100% secure.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>6. Data Retention</Text>
              <Text style={styles.paragraph}>
                We retain your personal information for as long as necessary to provide our services and fulfill 
                the purposes outlined in this Privacy Policy. You may request deletion of your account and data 
                at any time by contacting us.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>7. Your Rights</Text>
              <Text style={styles.paragraph}>
                Depending on your location, you may have certain rights regarding your personal information:
              </Text>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Access and receive a copy of your personal information</Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Correct inaccurate or incomplete information</Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Request deletion of your personal information</Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Object to or restrict certain processing activities</Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Withdraw consent at any time</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>8. Cookies and Tracking</Text>
              <Text style={styles.paragraph}>
                We use cookies and similar tracking technologies to collect usage information and improve your 
                experience. You can control cookies through your device settings, though some features may not 
                function properly if cookies are disabled.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>9. Children's Privacy</Text>
              <Text style={styles.paragraph}>
                Our service is not intended for children under 13 years of age. We do not knowingly collect 
                personal information from children under 13. If you believe we have collected information from 
                a child under 13, please contact us immediately.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>10. International Data Transfers</Text>
              <Text style={styles.paragraph}>
                Your information may be transferred to and maintained on servers located outside of your state, 
                province, country, or other governmental jurisdiction where data protection laws may differ. 
                By using our service, you consent to this transfer.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>11. Changes to This Privacy Policy</Text>
              <Text style={styles.paragraph}>
                We may update this Privacy Policy from time to time. We will notify you of any material changes 
                by posting the new Privacy Policy and updating the "Last updated" date. Your continued use of 
                the App after changes constitutes acceptance of the updated policy.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>12. Contact Us</Text>
              <Text style={styles.paragraph}>
                If you have any questions about this Privacy Policy or our data practices, please contact us at:
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
