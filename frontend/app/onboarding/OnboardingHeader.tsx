import React from 'react';
import { StyleSheet, View, Pressable, Dimensions, Platform, Text } from 'react-native';
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

export default function OnboardingHeader({ progress = 0, onBack, title, subtitle, children }: OnboardingHeaderProps) {
  const maskWidthPx = Math.round((OUTER_WIDTH * Math.max(0, Math.min(100, progress))) / 100);
  const tightOverlayWidth = Math.max(Math.round(maskWidthPx * 0.6), 60);
  const wideOverlayWidth = Math.max(Math.round(maskWidthPx * 1.6), 140);

  return (
    <>
      <View style={styles.headerRow}>
        <Pressable style={styles.backButton} onPress={onBack} accessibilityLabel="Back">
          <SvgXml xml={leftArrowSvg} width={20} height={20} />
        </Pressable>

        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressMask, { width: `${progress}%` }]}>
              <View style={{ width: '100%', height: '100%' }}>
                <LinearGradient colors={["#592D00", "#FFE1C2"]} start={[0, 0]} end={[1, 0]} style={{ flex: 1 }} />
              </View>
              <LinearGradient
                colors={['rgba(255,255,255,0.75)', 'rgba(255,255,255,0)']}
                start={[0, 0.5]}
                end={[1, 0.5]}
                style={[styles.innerShadowOverlay, { left: -35, width: tightOverlayWidth, opacity: 0.8 }]}
              />
              <LinearGradient
                colors={['rgba(255,255,255,0.38)', 'rgba(255,255,255,0)']}
                start={[0, 0.5]}
                end={[1, 0.5]}
                style={[styles.innerShadowOverlay, { left: -35, width: wideOverlayWidth, opacity: 0.38 }]}
              />
            </View>
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
}

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
  progressMask: { height: '100%', overflow: 'hidden', position: 'relative' },
  innerShadowOverlay: { position: 'absolute', top: 0, bottom: 0, width: '100%', opacity: 0.65, borderRadius: 10, pointerEvents: 'none' },
  titleBlock: { marginBottom: 16 },
  title: { color: '#fff', fontSize: 32, fontFamily: 'SpaceGrotesk_700Bold', fontWeight: '700' },
  subtitle: { color: '#fff', fontSize: 16, marginTop: 4, fontFamily: 'SpaceGrotesk_400Regular' },
});
