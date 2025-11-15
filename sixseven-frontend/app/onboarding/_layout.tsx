import React from 'react';
import { Stack } from 'expo-router';

// Hide the default header/title and disable screen transition animation
// for all onboarding routes so screen changes are instantaneous.
export default function OnboardingLayout() {
  return <Stack screenOptions={{ headerShown: false, animation: 'none' }} />;
}
