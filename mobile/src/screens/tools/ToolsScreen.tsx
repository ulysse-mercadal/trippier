// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React, { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppBar from '../../components/AppBar';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Meta from '../../components/Meta';
import {
  Bookmark,
  Clock,
  Comment,
  Globe,
  Layers,
  MapPin,
} from '../../components/icons';
import { useTheme } from '../../theme/useTheme';
import ToolTile from './ToolTile';

const CITY = 'Barcelona';

/**
 * Static description of a single Tools grid tile.
 */
interface ToolEntry {
  id: string;
  title: string;
  subtitle: string;
  iconName: 'globe' | 'comment' | 'layers' | 'clock' | 'mapPin' | 'bookmark';
}

/**
 * Stub list of travel tools rendered in wave 4 — every tile is tappable but
 * its action is logged via `console.warn` until the real flows ship.
 *
 * @returns The frozen list of tool entries.
 */
// data: stub for wave 4 — wire when backend ready
function getMockTools(): readonly ToolEntry[] {
  return [
    { id: 'currency', title: 'Currency', subtitle: '€100 → $107 today', iconName: 'globe' },
    { id: 'translate', title: 'Translate', subtitle: 'Catalan ready offline', iconName: 'comment' },
    { id: 'esim', title: 'eSIM data', subtitle: '2.1 GB left · ES', iconName: 'layers' },
    { id: 'time', title: 'Time zones', subtitle: 'Paris 21:32 · here 21:32', iconName: 'clock' },
    { id: 'emergency', title: 'Emergency', subtitle: 'Barcelona · 112', iconName: 'mapPin' },
    { id: 'phrasebook', title: 'Phrasebook', subtitle: '12 saved phrases', iconName: 'bookmark' },
  ];
}

const TOOLS: readonly ToolEntry[] = getMockTools();

/**
 * Renders the correct icon component for a {@link ToolEntry}.
 *
 * @param name - Icon discriminator carried by the tool entry.
 * @param color - Stroke color to apply.
 * @returns The icon element ready to mount inside a {@link ToolTile} badge.
 */
function renderIcon(name: ToolEntry['iconName'], color: string): React.ReactNode {
  if (name === 'globe') {
    return <Globe size={22} color={color} />;
  }
  if (name === 'comment') {
    return <Comment size={22} color={color} />;
  }
  if (name === 'layers') {
    return <Layers size={22} color={color} />;
  }
  if (name === 'clock') {
    return <Clock size={22} color={color} />;
  }
  if (name === 'mapPin') {
    return <MapPin size={22} color={color} />;
  }
  return <Bookmark size={22} color={color} />;
}

/**
 * Tools tab screen — top weather/currency widget, a 2-column grid of travel
 * tool tiles and a "Customise" hook to (eventually) let users curate the set.
 *
 * @returns The rendered Tools screen.
 */
const ToolsScreen: React.FC = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const handleCustomise = useCallback((): void => {
    console.warn('tool stubbed: customise');
  }, []);

  const handleTilePress = useCallback((id: string): void => {
    console.warn('tool stubbed:', id);
  }, []);

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.bg }]}>
      <View style={{ paddingTop: insets.top }}>
        <AppBar title="Tools" subtitle="Your little travel kit" />
      </View>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 100 },
        ]}>
        <Card style={styles.widget}>
          <View
            style={[
              styles.widgetHalf,
              styles.widgetHalfLeft,
              { borderColor: theme.colors.line },
            ]}>
            <Meta>Weather now</Meta>
            <Text
              style={[
                styles.bigValue,
                { color: theme.colors.ink, fontFamily: theme.fonts.display },
              ]}>
              24°
            </Text>
            <Meta style={styles.widgetSub}>Sunny · set 21:14</Meta>
          </View>
          <View style={[styles.widgetHalf, styles.widgetHalfRight]}>
            <Meta>Your money</Meta>
            <Text
              style={[
                styles.bigValue,
                { color: theme.colors.ink, fontFamily: theme.fonts.display },
              ]}>
              $1.07
            </Text>
            <Meta style={styles.widgetSub}>per €1 · £0.86 · 168¥</Meta>
          </View>
        </Card>

        <View style={styles.sectionRow}>
          <Text
            style={[
              styles.sectionHeader,
              { color: theme.colors.ink, fontFamily: theme.fonts.display },
            ]}>
            {`Handy for ${CITY}`}
          </Text>
          <Button label="Customise" variant="text" size="sm" onPress={handleCustomise} />
        </View>

        <View style={styles.grid}>
          {TOOLS.map(tool => (
            <ToolTile
              key={tool.id}
              title={tool.title}
              subtitle={tool.subtitle}
              icon={renderIcon(tool.iconName, theme.colors.emeraldDeep)}
              onPress={() => handleTilePress(tool.id)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 18,
    paddingTop: 4,
  },
  widget: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  widgetHalf: {
    flex: 1,
    padding: 16,
  },
  widgetHalfLeft: {
    borderRightWidth: 1,
  },
  widgetHalfRight: {},
  bigValue: {
    fontWeight: '700',
    fontSize: 30,
    letterSpacing: -0.9,
    marginTop: 4,
  },
  widgetSub: {
    marginTop: 2,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    marginBottom: 8,
  },
  sectionHeader: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
});

export default ToolsScreen;
