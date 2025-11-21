import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../../constants/theme';
import { useThemeColor } from '../../../hooks/use-theme-color';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const OUTER_WIDTH = Math.round(SCREEN_WIDTH * 0.9);

export default function EditProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');

  // Form state
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [alphaLevel, setAlphaLevel] = useState('');
  const [notifications, setNotifications] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync('session_token');
      if (token) {
        const BACKEND = Constants.expoConfig?.extra?.BACKEND_URL ?? 'http://localhost:3000';
        const response = await fetch(`${BACKEND}/api/user/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Edit Profile - Loaded user data:', data);
          setUserData(data);

          // Populate form fields
          const userName = data.name || '';
          const userAge = data.age ? data.age.toString() : '';
          const userGender = data.gender || '';
          const userAlphaLevel = data.alphaLevel || '';
          const userNotifications = data.notifications || false;

          console.log('Edit Profile - Setting form values:', {
            name: userName,
            age: userAge,
            gender: userGender,
            alphaLevel: userAlphaLevel,
            notifications: userNotifications,
          });

          setName(userName);
          setAge(userAge);
          setGender(userGender);
          setAlphaLevel(userAlphaLevel);
          setNotifications(userNotifications);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    try {
      setSaving(true);
      const token = await SecureStore.getItemAsync('session_token');
      if (!token) {
        Alert.alert('Error', 'Authentication required');
        return;
      }

      const BACKEND = Constants.expoConfig?.extra?.BACKEND_URL ?? 'http://localhost:3000';

      // Prepare update data
      const updateData: any = {};
      if (name.trim()) updateData.name = name.trim();
      if (age) updateData.age = parseInt(age);
      if (gender) updateData.gender = gender;
      if (alphaLevel) updateData.alphaLevel = alphaLevel;
      updateData.notifications = notifications;

      const response = await fetch(`${BACKEND}/api/user/me`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUserData(updatedUser);
        Alert.alert('Success', 'Profile updated successfully!', [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]);
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const alphaLevelOptions = ['1x', '2x', '3x', '4x'];

  const genderOptions = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' },
    { label: 'Prefer not to say', value: 'prefer-not-to-say' },
  ];

  if (loading) {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={[styles.safeArea, { backgroundColor }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tintColor} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.safeArea, { backgroundColor }]}>
      <View style={styles.mainContainer}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color={textColor} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: textColor }]}>Edit Profile</Text>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.7}
            >
              {saving ? (
                <ActivityIndicator size="small" color={tintColor} />
              ) : (
                <Ionicons name="checkmark" size={24} color={tintColor} />
              )}
            </TouchableOpacity>
          </View>

          {/* Form Content */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Name */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: iconColor }]}>Name</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: textColor + '08', color: textColor, borderColor: textColor + '10' }]}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor={iconColor}
                maxLength={50}
              />
            </View>

            {/* Age */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: iconColor }]}>Age</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: textColor + '08', color: textColor, borderColor: textColor + '10' }]}
                value={age}
                onChangeText={setAge}
                placeholder="Enter your age"
                placeholderTextColor={iconColor}
                keyboardType="numeric"
                maxLength={3}
              />
            </View>

            {/* Gender */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: iconColor }]}>Gender</Text>
              <View style={styles.optionsRow}>
                {genderOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.option,
                      { backgroundColor: textColor + '08', borderColor: textColor + '10' },
                      gender === option.value && { backgroundColor: tintColor + '20', borderColor: tintColor },
                    ]}
                    onPress={() => setGender(option.value)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        { color: iconColor },
                        gender === option.value && { color: tintColor, fontWeight: '600' },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Alpha Level */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: iconColor }]}>Alpha Level</Text>
              <View style={styles.optionsRow}>
                {alphaLevelOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.alphaOption,
                      { backgroundColor: textColor + '08', borderColor: textColor + '10' },
                      alphaLevel === option && { backgroundColor: tintColor + '20', borderColor: tintColor },
                    ]}
                    onPress={() => setAlphaLevel(option)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        { color: iconColor },
                        alphaLevel === option && { color: tintColor, fontWeight: '600' },
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Notifications */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: iconColor }]}>Preferences</Text>
              <TouchableOpacity
                style={[styles.preferenceItem, { backgroundColor: textColor + '08', borderColor: textColor + '10' }]}
                onPress={() => setNotifications(!notifications)}
                activeOpacity={0.7}
              >
                <View style={styles.preferenceLeft}>
                  <Ionicons name="notifications-outline" size={24} color={textColor} />
                  <View style={styles.preferenceText}>
                    <Text style={[styles.preferenceTitle, { color: textColor }]}>Push Notifications</Text>
                    <Text style={[styles.preferenceSubtitle, { color: iconColor }]}>
                      Receive updates about new features and tips
                    </Text>
                  </View>
                </View>
                <View style={[styles.toggle, notifications && { backgroundColor: tintColor }]}>
                  <View style={[styles.toggleKnob, notifications && styles.toggleKnobActive]} />
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    width: OUTER_WIDTH,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'SpaceGrotesk_600SemiBold',
  },
  iconButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 40,
  },

  // Sections
  section: {
    width: OUTER_WIDTH,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'SpaceGrotesk_600SemiBold',
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Text Input
  textInput: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'SpaceGrotesk_400Regular',
    borderWidth: 1,
  },

  // Options
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  alphaOption: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 70,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 15,
    fontFamily: 'SpaceGrotesk_400Regular',
  },

  // Preferences
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  preferenceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  preferenceText: {
    flex: 1,
  },
  preferenceTitle: {
    fontSize: 16,
    fontFamily: 'SpaceGrotesk_400Regular',
    marginBottom: 2,
  },
  preferenceSubtitle: {
    fontSize: 14,
    fontFamily: 'SpaceGrotesk_400Regular',
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#666666',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    transform: [{ translateX: 0 }],
  },
  toggleKnobActive: {
    transform: [{ translateX: 22 }],
  },
});