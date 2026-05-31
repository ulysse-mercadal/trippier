// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React, { useCallback } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Card from '../../components/Card';
import Eyebrow from '../../components/Eyebrow';
import { ArrowRight, Globe } from '../../components/icons';
import { useTheme } from '../../theme/useTheme';
import type { PoiSourceLink } from '../../navigation/types';
import { providerLabel } from './poiSources';

export interface SourcesSectionProps {
  sources?: PoiSourceLink[];
  /**
   * Optional Wikidata Q-id. When set, an extra "Wikidata" link is appended
   * to the section even though Wikidata is not itself a Provider.
   */
  wikidataId?: string;
}

/**
 * Detail-screen section listing the canonical "back to source" links for a
 * POI (OpenStreetMap, Wikipedia, Wikivoyage, Ticketmaster, …). Each row
 * opens the matching URL in the system browser. The section hides itself
 * entirely when there's nothing to show — callers don't need to guard.
 *
 * @param props - {@link SourcesSectionProps}.
 * @returns The Sources card, or `null` when no links are available.
 */
const SourcesSection: React.FC<SourcesSectionProps> = ({
  sources,
  wikidataId,
}) => {
  const { theme } = useTheme();
  const handlePress = useCallback(async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        Alert.alert("Can't open this link", url);
        return;
      }
      await Linking.openURL(url);
    } catch (e) {
      Alert.alert("Can't open this link", url);
    }
  }, []);

  const rows: Array<{ key: string; label: string; url: string }> = [];
  if (sources) {
    for (const s of sources) {
      rows.push({
        key: `src-${s.provider}`,
        label: providerLabel(s.provider),
        url: s.url,
      });
    }
  }
  if (wikidataId) {
    rows.push({
      key: 'wikidata',
      label: 'Wikidata',
      url: `https://www.wikidata.org/wiki/${wikidataId}`,
    });
  }

  if (rows.length === 0) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      <Eyebrow>Sources</Eyebrow>
      <Card variant="flat" style={styles.card}>
        {rows.map((row, idx) => (
          <Pressable
            key={row.key}
            onPress={() => handlePress(row.url)}
            accessibilityRole="link"
            accessibilityLabel={`Open ${row.label}`}
            android_ripple={{ color: theme.colors.line }}
            style={({ pressed }) => [
              styles.row,
              idx > 0 && {
                borderTopWidth: 1,
                borderTopColor: theme.colors.line,
              },
              pressed && { opacity: 0.6 },
            ]}>
            <View style={styles.rowLeft}>
              <Globe size={16} color={theme.colors.mute} />
              <Text
                style={[
                  styles.rowLabel,
                  {
                    color: theme.colors.ink,
                    fontFamily: theme.fonts.display,
                  },
                ]}
                numberOfLines={1}>
                {row.label}
              </Text>
            </View>
            <ArrowRight size={16} color={theme.colors.mute} />
          </Pressable>
        ))}
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 18,
    gap: 8,
  },
  card: {
    marginTop: 4,
  },
  row: {
    paddingVertical: 13,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 1,
  },
  rowLabel: {
    fontSize: 14.5,
    fontWeight: '600',
    letterSpacing: -0.15,
  },
});

export default SourcesSection;
