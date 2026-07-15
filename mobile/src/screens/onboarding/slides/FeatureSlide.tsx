// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TitleDot from '../../../components/TitleDot';
import { useTheme } from '../../../theme/useTheme';

export interface FeatureSlideProps {
  width: number;
  title: string;
  lede: string;
  illustration: React.ReactNode;
}

/**
 * Generic feature slide layout shared by the three "how it works" pages of
 * the onboarding pager.
 *
 * Renders the hero illustration inside an emerald-soft rounded panel, then
 * the eyebrow + title (with the signature emerald TitleDot) and a short
 * lede paragraph. The pager owns the swipe + footer; this component is
 * purely presentational.
 *
 * @param props - {@link FeatureSlideProps}.
 * @returns The slide content.
 */
const FeatureSlide: React.FC<FeatureSlideProps> = ({
  width,
  title,
  lede,
  illustration,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={{ width }}
      contentContainerStyle={[
        styles.scroll,
        { paddingTop: insets.top + 16 },
      ]}
      showsVerticalScrollIndicator={false}>
      <View
        style={[
          styles.hero,
          {
            backgroundColor: theme.colors.emeraldSoft,
            borderRadius: theme.radii.xl,
          },
        ]}>
        {illustration}
      </View>
      <Text
        style={[styles.h1, { color: theme.colors.ink, fontFamily: theme.fonts.display }]}>
        {title}
        <TitleDot />
      </Text>
      <Text
        style={[styles.lede, { color: theme.colors.ink2, fontFamily: theme.fonts.display }]}>
        {lede}
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 22,
    paddingBottom: 24,
    gap: 12,
  },
  hero: {
    width: '100%',
    height: 260,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.6,
  },
  h1: {
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.9,
    lineHeight: 34,
  },
  lede: {
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 360,
  },
});

export default FeatureSlide;
