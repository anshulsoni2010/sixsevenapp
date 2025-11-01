import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function TermsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Terms & Conditions</Text>
        </View>

        {/* Content */}
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
          <Text style={styles.lastUpdated}>Last Updated: November 1, 2025</Text>

          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.paragraph}>
            By accessing or using the 6 7 application ("the App"), you agree to be bound by these Terms
            and Conditions. If you do not agree to these terms, please do not use the App.
          </Text>

          <Text style={styles.sectionTitle}>2. Description of Service</Text>
          <Text style={styles.paragraph}>
            6 7 provides a text transformation service that converts standard text into Gen Alpha style
            communication. The service includes chat screenshot analysis and text conversion features.
          </Text>

          <Text style={styles.sectionTitle}>3. User Accounts</Text>
          <Text style={styles.paragraph}>
            You are responsible for maintaining the confidentiality of your account credentials. You agree
            to accept responsibility for all activities that occur under your account.
          </Text>

          <Text style={styles.sectionTitle}>4. User Conduct</Text>
          <Text style={styles.paragraph}>
            You agree not to use the App to:
            {'\n'}• Upload or transmit harmful, offensive, or illegal content
            {'\n'}• Violate any applicable laws or regulations
            {'\n'}• Impersonate any person or entity
            {'\n'}• Interfere with or disrupt the App's functionality
          </Text>

          <Text style={styles.sectionTitle}>5. Intellectual Property</Text>
          <Text style={styles.paragraph}>
            All content, features, and functionality of the App are owned by 6 7 and are protected by
            international copyright, trademark, and other intellectual property laws.
          </Text>

          <Text style={styles.sectionTitle}>6. Data Usage</Text>
          <Text style={styles.paragraph}>
            Your use of the App is also governed by our Privacy Policy. By using the App, you consent to
            the collection and use of information as described in the Privacy Policy.
          </Text>

          <Text style={styles.sectionTitle}>7. Limitation of Liability</Text>
          <Text style={styles.paragraph}>
            6 7 shall not be liable for any indirect, incidental, special, consequential, or punitive
            damages resulting from your use or inability to use the App.
          </Text>

          <Text style={styles.sectionTitle}>8. Changes to Terms</Text>
          <Text style={styles.paragraph}>
            We reserve the right to modify these Terms at any time. We will notify users of any material
            changes by posting the new Terms on this page.
          </Text>

          <Text style={styles.sectionTitle}>9. Termination</Text>
          <Text style={styles.paragraph}>
            We may terminate or suspend your account and access to the App immediately, without prior
            notice, for any breach of these Terms.
          </Text>

          <Text style={styles.sectionTitle}>10. Contact Information</Text>
          <Text style={styles.paragraph}>
            If you have any questions about these Terms, please contact us at: support@sixseven.app
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
  bottomSpacing: {
    height: 40,
  },
});
