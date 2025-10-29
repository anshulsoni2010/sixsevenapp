import React from 'react';
import { Stack } from 'expo-router';

// Hide the default header/title for all onboarding routes
export default function OnboardingLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
