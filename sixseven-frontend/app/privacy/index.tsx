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

export default function PrivacyPolicyScreen() {
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
                This Privacy Policy describes how 6 7 collects, uses, and discloses information about users 
                of our application.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>2. Information Collection</Text>
              <Text style={styles.paragraph}>
                We collect information you provide when creating an account, including your name and email address. 
                We also collect authentication data through third-party sign-in services, payment information 
                processed through our payment provider, and content you submit through the application.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>3. Use of Information</Text>
              <Text style={styles.paragraph}>
                We use collected information to provide and improve the service, process payments, communicate 
                with users, and maintain the security and functionality of the application.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>4. Information Sharing</Text>
              <Text style={styles.paragraph}>
                We may share information with service providers who assist in operating the application, when 
                required by law, or with your consent. We do not sell your personal information.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>5. Data Security</Text>
              <Text style={styles.paragraph}>
                We use commercially reasonable measures to protect your information. However, no method of 
                transmission over the internet is completely secure.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>6. Data Retention</Text>
              <Text style={styles.paragraph}>
                We retain your information as long as necessary to provide the service. You may request deletion 
                of your data by contacting us.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>7. Your Rights</Text>
              <Text style={styles.paragraph}>
                You may have rights to access, correct, or delete your personal information, depending on your 
                jurisdiction.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>8. Children&apos;s Privacy</Text>
              <Text style={styles.paragraph}>
                The service is not intended for users under 13 years of age. We do not knowingly collect 
                information from children under 13.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>9. Changes to This Policy</Text>
              <Text style={styles.paragraph}>
                We may update this Privacy Policy at any time. Changes will be effective upon posting. 
                Continued use of the service constitutes acceptance of any changes.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>10. Contact</Text>
              <Text style={styles.paragraph}>
                For questions regarding this Privacy Policy, please contact:
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
