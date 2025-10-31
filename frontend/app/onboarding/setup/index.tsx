import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Dimensions, 
  ImageBackground, 
  Image, 
  ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const OUTER_WIDTH = Math.round(SCREEN_WIDTH * 0.9);

const SP = {
  xs: 8,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
};

export default function NameScreen() {
  const bg = require('../../../assets/images/setupdonebg.png');
  const successImg = require('../../../assets/images/success.png');

  // Disable mount animation: initialize values to final state
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);

  const aStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <ImageBackground source={bg} style={styles.bg} imageStyle={styles.bgImage}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <Animated.View style={[styles.screen, aStyle]}>
          <View style={styles.contentWrapper}>
            <Image source={successImg} style={styles.successImage} />
            <Text style={styles.title}>Setting up 6 7 for you...</Text>
            <ActivityIndicator size="large" color="#ffffff" style={styles.loader} />
          </View>
        </Animated.View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  bg: {
    flex: 1,
    width: '100%',
  },
  bgImage: {
    resizeMode: 'cover',
  },
  screen: {
    flex: 1,
    justifyContent: 'center', // center vertically
    alignItems: 'center', // center horizontally
  },
  contentWrapper: {
    width: OUTER_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontFamily: 'SpaceGrotesk_700Bold',
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 16,
  },
  successImage: {
    width: 150,
    height: 150,
    marginBottom: 16,
  },
  loader: {
    marginTop: SP.md,
  },
});
