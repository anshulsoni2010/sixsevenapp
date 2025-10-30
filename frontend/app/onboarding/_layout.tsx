import React from 'react';
import { Stack } from 'expo-router';

// Hide the default header/title for all onboarding routes
export default function OnboardingLayout() {
  // Disable the iOS swipe-back gesture and use a standard slide-from-right animation
  // so onboarding screens feel like a normal push navigation.
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // native-stack option to disable swipe back gesture
        gestureEnabled: false,
        // use a standard slide-from-right animation on supported navigators
        animation: 'slide_from_right',
      }}
    />
  );
}
