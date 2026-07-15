// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React, { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PreviewMap from '../../../components/PreviewMap';
import TitleDot from '../../../components/TitleDot';
import { Check } from '../../../components/icons';
import { useTheme } from '../../../theme/useTheme';
import { buildMapPalette, type MapThemeName, type ThemeName } from '../../../theme/tokens';

interface SwatchSpec<T extends string> {
  id: T;
  label: string;
  primary: string;
  secondary?: string;
}

const UI_OPTIONS: SwatchSpec<ThemeName>[] = [
  { id: 'light', label: 'Light', primary: '#ffffff', secondary: '#e7ecea' },
  { id: 'dark', label: 'Dark', primary: '#16201b' },
  { id: 'tonner', label: 'Tonner', primary: '#ffffff', secondary: '#111111' },
];

const MAP_OPTIONS: SwatchSpec<MapThemeName>[] = [
  { id: 'light', label: 'Light', primary: '#e9efe9', secondary: '#d2e6d4' },
  { id: 'dark', label: 'Dark', primary: '#16201b', secondary: '#163d2b' },
  { id: 'tonner', label: 'Tonner', primary: '#ffffff', secondary: '#111111' },
];

export interface WelcomeSlideProps {
  width: number;
}

interface SwatchProps<T extends string> {
  spec: SwatchSpec<T>;
  selected: boolean;
  onPress: () => void;
}

/**
 * One theme option card inside the Welcome slide.
 *
 * @typeParam T - Union string type of theme ids.
 * @param props - {@link SwatchProps}.
 * @returns A pressable rendering the visual sample + tick.
 */
function Swatch<T extends string>({ spec, selected, onPress }: SwatchProps<T>): React.ReactElement {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={spec.label}
      accessibilityState={{ selected }}
      style={[
        styles.opt,
        {
          backgroundColor: theme.colors.surface,
          borderColor: selected ? theme.colors.emerald : theme.colors.line,
          borderWidth: selected ? 2.5 : 1.5,
          borderRadius: theme.radii.md,
        },
      ]}>
      <View style={styles.swWrap}>
        <View
          style={[
            styles.sw,
            {
              backgroundColor: spec.primary,
              borderColor: theme.colors.line,
            },
          ]}>
          {spec.secondary ? (
            <View style={[styles.swHalf, { backgroundColor: spec.secondary }]} />
          ) : null}
        </View>
        {selected ? (
          <View
            style={[
              styles.tick,
              {
                backgroundColor: theme.colors.emerald,
                borderColor: theme.colors.surface,
              },
            ]}>
            <Check size={10} color={theme.colors.onEmerald} stroke={2.6} />
          </View>
        ) : null}
      </View>
      <Text
        style={[
          styles.optLabel,
          { color: theme.colors.ink, fontFamily: theme.fonts.display },
        ]}>
        {spec.label}
      </Text>
    </Pressable>
  );
}

/**
 * Page 1 of the onboarding pager — theme + map chooser with a live preview.
 *
 * Picks apply via {@link useTheme.setTheme}/`setMapTheme` immediately so the
 * rest of the screen re-themes in place. Width is passed by the parent so
 * each slide consumes the same horizontal page size.
 *
 * @param props - {@link WelcomeSlideProps}.
 * @returns The slide content.
 */
const WelcomeSlide: React.FC<WelcomeSlideProps> = ({ width }) => {
  const { theme, themeName, mapThemeName, setTheme, setMapTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const previewMap = buildMapPalette(mapThemeName);

  const handlePickUi = useCallback(
    (id: ThemeName): void => {
      setTheme(id);
    },
    [setTheme],
  );

  const handlePickMap = useCallback(
    (id: MapThemeName): void => {
      setMapTheme(id);
    },
    [setMapTheme],
  );

  return (
    <ScrollView
      style={{ width }}
      contentContainerStyle={[
        styles.scroll,
        { paddingTop: insets.top + 16 },
      ]}
      showsVerticalScrollIndicator={false}>
      <View style={styles.intro}>
        <Text
          style={[styles.h1, { color: theme.colors.ink, fontFamily: theme.fonts.display }]}>
          Make it yours
          <TitleDot />
        </Text>
        <Text
          style={[styles.lede, { color: theme.colors.ink2, fontFamily: theme.fonts.display }]}>
          Pick how trippier looks. You can change both anytime in settings — it only changes the
          colours.
        </Text>
      </View>

      <View style={styles.section}>
        <Text
          style={[styles.label, { color: theme.colors.emeraldDeep, fontFamily: theme.fonts.mono }]}>
          INTERFACE
        </Text>
        <View style={styles.row}>
          {UI_OPTIONS.map(o => (
            <Swatch
              key={o.id}
              spec={o}
              selected={themeName === o.id}
              onPress={() => handlePickUi(o.id)}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text
          style={[styles.label, { color: theme.colors.emeraldDeep, fontFamily: theme.fonts.mono }]}>
          MAP
        </Text>
        <View style={styles.row}>
          {MAP_OPTIONS.map(o => (
            <Swatch
              key={o.id}
              spec={o}
              selected={mapThemeName === o.id}
              onPress={() => handlePickMap(o.id)}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text
          style={[styles.label, { color: theme.colors.emeraldDeep, fontFamily: theme.fonts.mono }]}>
          PREVIEW
        </Text>
        <View
          style={[
            styles.preview,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.line,
              borderRadius: theme.radii.lg,
            },
            theme.shadows.e1,
          ]}>
          <PreviewMap
            palette={previewMap}
            surfaceColor={theme.colors.surface}
            height={150}
          />
          <View style={styles.previewBody}>
            <View style={styles.previewText}>
              <Text
                style={[
                  styles.previewTitle,
                  { color: theme.colors.ink, fontFamily: theme.fonts.display },
                ]}>
                Around you
                <TitleDot color={theme.colors.emerald} />
              </Text>
              <Text
                style={[
                  styles.previewMeta,
                  { color: theme.colors.mute, fontFamily: theme.fonts.mono },
                ]}>
                {themeName} interface · {mapThemeName} map
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 22,
    paddingBottom: 24,
    gap: 14,
  },
  intro: {
    gap: 6,
    marginBottom: 4,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  h1: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -1.02,
    lineHeight: 36,
  },
  lede: {
    fontSize: 14.5,
    lineHeight: 22,
    maxWidth: 320,
  },
  section: {
    gap: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.6,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  opt: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    gap: 6,
  },
  optLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  swWrap: {
    width: 32,
    height: 32,
    position: 'relative',
  },
  sw: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  swHalf: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '50%',
  },
  tick: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    zIndex: 2,
    elevation: 3,
  },
  preview: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  previewBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 18,
    gap: 12,
  },
  previewText: {
    flexShrink: 1,
    gap: 3,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.36,
  },
  previewMeta: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.4,
  },
});

export default WelcomeSlide;
