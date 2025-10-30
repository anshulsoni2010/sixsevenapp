import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

export default function SetupScreen() {
  // Disable mount animation: initialize values to final state so the
  // screen renders instantly when navigated to.
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);
  const router = useRouter();

  const aStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.container, aStyle]}>
      <Text style={styles.text}>SetupScreen</Text>
      <TouchableOpacity style={styles.button} onPress={() => router.replace('/(tabs)' as any)}>
        <Text style={styles.buttonText}>Finish</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 24,
  },
  text: {
    fontSize: 18,
    color: '#222',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#FFE0C2',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 16,
    color: '#111',
  },
});
