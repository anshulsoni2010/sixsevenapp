import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    checkAuthAndRoute();
  }, []);

  const checkAuthAndRoute = async () => {
    try {
      console.log('Index: Starting auth check...');
      const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
      console.log('Index: isLoggedIn =', isLoggedIn);
      
      if (isLoggedIn !== 'true') {
        // Not authenticated - go to onboarding
        console.log('Index: Not logged in, going to onboarding');
        router.replace('/onboarding');
        return;
      }

      // Authenticated - check subscription
      const token = await SecureStore.getItemAsync('session_token');
      if (!token) {
        console.log('Index: No token found, going to onboarding');
        router.replace('/onboarding');
        return;
      }

      console.log('Index: Checking subscription status...');
      const BACKEND = Constants.expoConfig?.extra?.BACKEND_URL ?? 'http://localhost:3000';
      const response = await fetch(`${BACKEND}/api/user/me`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Index: User data:', { subscribed: data.subscribed, onboarded: data.onboarded });
        if (data.subscribed) {
          console.log('Index: User subscribed, going to chat');
          router.replace('/chat');
        } else {
          console.log('Index: User not subscribed, going to paywall');
          router.replace('/paywall');
        }
      } else {
        // Error or invalid token - go to onboarding
        console.log('Index: API error, going to onboarding');
        router.replace('/onboarding');
      }
    } catch (error) {
      console.error('Index: Error checking auth:', error);
      router.replace('/onboarding');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
      <ActivityIndicator size="large" color="#6366f1" />
    </View>
  );
}
