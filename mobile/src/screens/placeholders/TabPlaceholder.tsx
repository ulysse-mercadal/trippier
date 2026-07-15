// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Eyebrow from '../../components/Eyebrow';
import { useTheme } from '../../theme/useTheme';

export interface TabPlaceholderProps {
  tabName: string;
  wave?: '3' | '4';
}

/**
 * Generic "coming soon" placeholder rendered by each wave-2 tab stack.
 *
 * Wave 3+ replaces these screens with real implementations. Until then the
 * placeholder keeps the navigation tree valid and provides a quick visual
 * signal that a tab is intentionally empty.
 *
 * @param props - {@link TabPlaceholderProps}.
 * @returns A centered eyebrow message inside a plain surface.
 */
const TabPlaceholder: React.FC<TabPlaceholderProps> = ({ tabName, wave = '3' }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { backgroundColor: theme.colors.bg }]}>
      <View
        style={[
          styles.body,
          {
            paddingTop: insets.top + 32,
            paddingHorizontal: theme.spacing.xl,
          },
        ]}>
        <Eyebrow>{`${tabName} — coming wave ${wave}`}</Eyebrow>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default TabPlaceholder;
