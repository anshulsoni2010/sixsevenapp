import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { StyleSheet, View, Pressable, Dimensions, Platform, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS, Easing } from 'react-native-reanimated';
import { SvgXml } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const OUTER_WIDTH = Math.round(SCREEN_WIDTH * 0.9);

const leftArrowSvg = `
<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12.5 16.6L7.06664 11.1667C6.42497 10.525 6.42497 9.475 7.06664 8.83334L12.5 3.4" stroke="white" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

type OnboardingHeaderProps = {
  progress?: number;
  onBack?: () => void;
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
};

const ANIM_DURATION = 380;

// expose `animateTo(progressPercent: number, direction: 'forward'|'back')` via ref
const OnboardingHeader = forwardRef(function OnboardingHeader(
  { progress = 0, onBack, title, subtitle, children }: OnboardingHeaderProps,
  ref: any,
) {
  // measure actual progress track width at runtime so progress percent maps to
  // the on-screen width (works across devices and layout changes)
  const [trackWidth, setTrackWidth] = useState<number>(Math.round(SCREEN_WIDTH * 0.9));

  const progressPx = useSharedValue<number>(Math.round((trackWidth * Math.max(0, Math.min(100, progress))) / 100));

  // keep progressPx in sync if the `progress` prop changes (no animation)
  React.useEffect(() => {
    const px = Math.round((trackWidth * Math.max(0, Math.min(100, progress))) / 100);
    progressPx.value = px;
  }, [progress, trackWidth]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: progressPx.value,
  }));

  const overlayTightStyle = useAnimatedStyle(() => {
    const maskWidthPx = Math.round(progressPx.value);
    const tightOverlayWidth = Math.max(Math.round(maskWidthPx * 0.6), 60);
    return { left: -35, width: tightOverlayWidth, opacity: 0.8 } as any;
  });

  const overlayWideStyle = useAnimatedStyle(() => {
    const maskWidthPx = Math.round(progressPx.value);
    const wideOverlayWidth = Math.max(Math.round(maskWidthPx * 1.6), 140);
    return { left: -35, width: wideOverlayWidth, opacity: 0.38 } as any;
  });

  useImperativeHandle(ref, () => ({
    animateTo: (targetPercent: number, _direction?: 'forward' | 'back') => {
      return new Promise<void>((resolve) => {
        const widthBase = trackWidth || SCREEN_WIDTH;
        const targetPx = Math.round((widthBase * Math.max(0, Math.min(100, targetPercent))) / 100);
        progressPx.value = withTiming(targetPx, { duration: ANIM_DURATION, easing: Easing.inOut(Easing.cubic) }, (finished) => {
          if (finished) runOnJS(resolve)();
          else runOnJS(resolve)();
        });
      });
    },
  }));

  // overlays are driven by animated styles above

  return (
    <>
      <View style={styles.headerRow}>
        <Pressable style={styles.backButton} onPress={onBack} accessibilityLabel="Back">
          <SvgXml xml={leftArrowSvg} width={20} height={20} />
        </Pressable>

        <View style={styles.progressContainer}>
          <View style={styles.progressTrack} onLayout={(e) => setTrackWidth(Math.round(e.nativeEvent.layout.width))}>
            <Animated.View style={[styles.progressMask, animatedStyle as any]}>
              <View style={{ width: '100%', height: '100%' }}>
                <LinearGradient colors={["#592D00", "#FFE1C2"]} start={[0, 0]} end={[1, 0]} style={{ flex: 1 }} />
              </View>
              <Animated.View style={[styles.innerShadowOverlay, overlayTightStyle as any]} pointerEvents="none">
                <LinearGradient
                  colors={['rgba(255,255,255,0.75)', 'rgba(255,255,255,0)']}
                  start={[0, 0.5]}
                  end={[1, 0.5]}
                  style={{ flex: 1 }}
                />
              </Animated.View>
              <Animated.View style={[styles.innerShadowOverlay, overlayWideStyle as any]} pointerEvents="none">
                <LinearGradient
                  colors={['rgba(255,255,255,0.38)', 'rgba(255,255,255,0)']}
                  start={[0, 0.5]}
                  end={[1, 0.5]}
                  style={{ flex: 1 }}
                />
              </Animated.View>
            </Animated.View>
          </View>
        </View>
      </View>

      {/* optional center content: children take precedence over title/subtitle */}
      {(children || title || subtitle) ? (
        <View style={styles.titleBlock}>
          {children ? (
            children
          ) : (
            <>
              {title ? <Text style={styles.title}>{title}</Text> : null}
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </>
          )}
        </View>
      ) : null}
    </>
  );
});

export default OnboardingHeader;

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#222222',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  progressContainer: { flex: 1 },
  progressTrack: { height: 10, backgroundColor: '#222222', borderRadius: 10, overflow: 'hidden' },
  progressMask: { height: '100%', overflow: 'hidden', position: 'relative', alignSelf: 'flex-start' },
  innerShadowOverlay: { position: 'absolute', top: 0, bottom: 0, width: '100%', opacity: 0.65, borderRadius: 10, pointerEvents: 'none' },
  titleBlock: { marginBottom: 16 },
  title: { color: '#fff', fontSize: 32, fontFamily: 'SpaceGrotesk_700Bold', fontWeight: '700' },
  subtitle: { color: '#fff', fontSize: 16, marginTop: 4, fontFamily: 'SpaceGrotesk_400Regular' },
});
