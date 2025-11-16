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
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = require('react-native').Dimensions.get('window');
const OUTER_WIDTH = Math.round(SCREEN_WIDTH * 0.9);

export default function EditProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState<any>(null);

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
          setUserData(data);

          // Populate form fields
          setName(data.name || '');
          setAge(data.age ? data.age.toString() : '');
          setGender(data.gender || '');
          setAlphaLevel(data.alphaLevel || '');
          setNotifications(data.notifications || false);
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

  if (loading) {
    return (
      <ImageBackground
        source={require('../assets/images/chatscreenbg.png')}
        style={styles.container}
        resizeMode="cover"
      >
        <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
          <View style={styles.mainContainer}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#ffffff" />
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require('../assets/images/chatscreenbg.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        <View style={styles.mainContainer}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            {/* Header */}
            <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <Ionicons name="close" size={24} color="#FFE0C2" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Profile</Text>
            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.8}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFE0C2" />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
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
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Name</Text>
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor="#666"
                maxLength={50}
              />
            </View>

            {/* Age */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Age</Text>
              <TextInput
                style={styles.textInput}
                value={age}
                onChangeText={setAge}
                placeholder="Enter your age"
                placeholderTextColor="#666"
                keyboardType="numeric"
                maxLength={3}
              />
            </View>

            {/* Gender */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Gender</Text>
              <View style={styles.genderOptions}>
                {genderOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.genderOption,
                      gender === option.value && styles.genderOptionSelected,
                    ]}
                    onPress={() => setGender(option.value)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.genderOptionText,
                        gender === option.value && styles.genderOptionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Alpha Level */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Alpha Level</Text>
              <View style={styles.alphaOptions}>
                {alphaLevelOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.alphaOption,
                      alphaLevel === option && styles.alphaOptionSelected,
                    ]}
                    onPress={() => setAlphaLevel(option)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.alphaOptionText,
                        alphaLevel === option && styles.alphaOptionTextSelected,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Notifications */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Preferences</Text>
              <TouchableOpacity
                style={styles.preferenceItem}
                onPress={() => setNotifications(!notifications)}
                activeOpacity={0.8}
              >
                <View style={styles.preferenceLeft}>
                  <Ionicons name="notifications" size={24} color="#FFE0C2" />
                  <View style={styles.preferenceText}>
                    <Text style={styles.preferenceTitle}>Push Notifications</Text>
                    <Text style={styles.preferenceSubtitle}>
                      Receive updates about new features and tips
                    </Text>
                  </View>
                </View>
                <View style={[styles.toggle, notifications && styles.toggleActive]}>
                  <View style={[styles.toggleKnob, notifications && styles.toggleKnobActive]} />
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
  },
  mainContainer: {
    width: OUTER_WIDTH,
    height: '100%',
    flexDirection: 'column',
  },

  // Header
  header: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
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
    fontSize: 18,
    fontWeight: '600',
    color: '#FFE0C2',
    fontFamily: 'SpaceGrotesk_400Regular',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 224, 194, 0.1)',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFE0C2',
    fontFamily: 'SpaceGrotesk_400Regular',
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Scroll Content
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // Form Fields
  fieldContainer: {
    marginBottom: 28,
  },
  fieldLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFE0C2',
    fontFamily: 'SpaceGrotesk_600SemiBold',
    marginBottom: 16,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFE0C2',
    fontFamily: 'SpaceGrotesk_400Regular',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },

  genderOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genderOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  genderOptionSelected: {
    backgroundColor: 'rgba(255, 224, 194, 0.1)',
    borderColor: '#FFE0C2',
  },
  genderOptionText: {
    fontSize: 14,
    color: '#B4B4B4',
    fontFamily: 'SpaceGrotesk_400Regular',
  },
  genderOptionTextSelected: {
    color: '#FFE0C2',
    fontWeight: '500',
  },

  // Alpha Level Options
  alphaOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  alphaOption: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    minWidth: 60,
    alignItems: 'center',
  },
  alphaOptionSelected: {
    backgroundColor: 'rgba(255, 224, 194, 0.1)',
    borderColor: '#FFE0C2',
  },
  alphaOptionText: {
    fontSize: 16,
    color: '#B4B4B4',
    fontFamily: 'SpaceGrotesk_400Regular',
    fontWeight: '500',
  },
  alphaOptionTextSelected: {
    color: '#FFE0C2',
    fontWeight: '600',
  },

  // Preferences
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
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
    color: '#FFE0C2',
    fontFamily: 'SpaceGrotesk_400Regular',
    marginBottom: 2,
  },
  preferenceSubtitle: {
    fontSize: 14,
    color: '#B4B4B4',
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
  toggleActive: {
    backgroundColor: '#FFE0C2',
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