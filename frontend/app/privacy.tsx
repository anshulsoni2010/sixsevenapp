import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function PrivacyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Privacy Policy</Text>
        </View>

        {/* Content */}
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
          <Text style={styles.lastUpdated}>Last Updated: November 1, 2025</Text>

          <Text style={styles.sectionTitle}>1. Information We Collect</Text>
          <Text style={styles.paragraph}>
            We collect information that you provide directly to us when you:
            {'\n'}• Create an account using Google or Apple authentication
            {'\n'}• Use our text transformation services
            {'\n'}• Upload chat screenshots for analysis
            {'\n'}• Interact with the App's features
          </Text>

          <Text style={styles.sectionTitle}>2. Types of Information</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Personal Information:</Text> Name, email address, profile picture (from OAuth providers)
            {'\n\n'}<Text style={styles.bold}>Usage Data:</Text> App usage patterns, feature interactions, and preferences
            {'\n\n'}<Text style={styles.bold}>Device Information:</Text> Device type, operating system, and unique device identifiers
          </Text>

          <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
          <Text style={styles.paragraph}>
            We use the collected information to:
            {'\n'}• Provide and maintain the App's services
            {'\n'}• Personalize your experience
            {'\n'}• Improve our services and develop new features
            {'\n'}• Send you updates and notifications (if enabled)
            {'\n'}• Ensure security and prevent fraud
          </Text>

          <Text style={styles.sectionTitle}>4. Data Sharing and Disclosure</Text>
          <Text style={styles.paragraph}>
            We do not sell your personal information. We may share your information only in the following circumstances:
            {'\n'}• With your explicit consent
            {'\n'}• To comply with legal obligations
            {'\n'}• To protect our rights and prevent fraud
            {'\n'}• With service providers who assist in operating the App
          </Text>

          <Text style={styles.sectionTitle}>5. Data Security</Text>
          <Text style={styles.paragraph}>
            We implement appropriate technical and organizational measures to protect your personal information.
            However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
          </Text>

          <Text style={styles.sectionTitle}>6. Data Retention</Text>
          <Text style={styles.paragraph}>
            We retain your personal information for as long as necessary to provide our services and fulfill
            the purposes outlined in this Privacy Policy. You may request deletion of your account and data at any time.
          </Text>

          <Text style={styles.sectionTitle}>7. Your Rights</Text>
          <Text style={styles.paragraph}>
            You have the right to:
            {'\n'}• Access your personal information
            {'\n'}• Correct inaccurate data
            {'\n'}• Request deletion of your data
            {'\n'}• Object to processing of your information
            {'\n'}• Withdraw consent at any time
          </Text>

          <Text style={styles.sectionTitle}>8. Children's Privacy</Text>
          <Text style={styles.paragraph}>
            Our App is not intended for users under the age of 13. We do not knowingly collect personal
            information from children under 13.
          </Text>

          <Text style={styles.sectionTitle}>9. Third-Party Services</Text>
          <Text style={styles.paragraph}>
            We use third-party authentication services (Google, Apple) to facilitate sign-in. These services
            have their own privacy policies governing the use of your information.
          </Text>

          <Text style={styles.sectionTitle}>10. Changes to This Policy</Text>
          <Text style={styles.paragraph}>
            We may update this Privacy Policy from time to time. We will notify you of any material changes
            by posting the new Privacy Policy on this page and updating the "Last Updated" date.
          </Text>

          <Text style={styles.sectionTitle}>11. Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have any questions about this Privacy Policy, please contact us at:
            {'\n\n'}Email: privacy@sixseven.app
            {'\n'}Address: [Your Company Address]
          </Text>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#111111',
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
  },
  backButton: {
    marginBottom: 12,
  },
  backText: {
    color: '#FFE0C2',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'Outfit_700Bold',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  lastUpdated: {
    color: '#888888',
    fontSize: 14,
    marginBottom: 24,
    fontStyle: 'italic',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 12,
    fontFamily: 'Outfit_700Bold',
  },
  paragraph: {
    color: '#CCCCCC',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
    fontFamily: 'Outfit_400Regular',
  },
  bold: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bottomSpacing: {
    height: 40,
  },
});
