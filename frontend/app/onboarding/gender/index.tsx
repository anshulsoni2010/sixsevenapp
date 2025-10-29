import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function GenderScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>GenderScreen</Text>
      <TouchableOpacity style={styles.button} onPress={() => router.push('/onboarding/age' as any)}>
        <Text style={styles.buttonText}>Next: Age</Text>
      </TouchableOpacity>
    </View>
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
