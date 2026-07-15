// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Card from '../../components/Card';
import Meta from '../../components/Meta';
import { ArrowRight, Globe } from '../../components/icons';
import { useTheme } from '../../theme/useTheme';

export interface ThemeEntryRowProps {
  onPress: () => void;
}

/**
 * Tappable card row exposing the "Theme & map colours" shortcut on the You
 * screen. Tapping it should reset the onboarding flag so the Welcome pager
 * is shown again and the user can re-pick their interface / map palettes.
 *
 * @param props - {@link ThemeEntryRowProps}.
 * @returns The rendered theme entry row.
 */
const ThemeEntryRow: React.FC<ThemeEntryRowProps> = ({ onPress }) => {
  const { theme } = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel="Edit theme and map colours">
      <Card>
        <View style={styles.themeRow}>
          <View
            style={[
              styles.themeBadge,
              { backgroundColor: theme.colors.emeraldSoft },
            ]}>
            <Globe size={20} color={theme.colors.emeraldDeep} />
          </View>
          <View style={styles.themeText}>
            <Text
              style={[
                styles.h3,
                { color: theme.colors.ink, fontFamily: theme.fonts.display },
              ]}>
              Theme & map colours
            </Text>
            <Meta style={styles.meta}>Interface and map, independently</Meta>
          </View>
          <ArrowRight size={18} color={theme.colors.mute} />
        </View>
      </Card>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 14,
  },
  themeBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeText: {
    flex: 1,
    minWidth: 0,
  },
  h3: {
    fontWeight: '700',
    fontSize: 17,
    letterSpacing: -0.4,
  },
  meta: {
    marginTop: 3,
  },
});

export default ThemeEntryRow;
