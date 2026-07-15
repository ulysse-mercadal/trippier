// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Calendar, Route, Sparkles, Wallet } from '../../../components/icons';
import { useTheme } from '../../../theme/useTheme';

interface RowProps {
  Icon: React.ComponentType<{ size?: number; color?: string; stroke?: number }>;
  label: string;
  value: string;
}

/**
 * One faux input row inside the "plan a trip" illustration.
 *
 * @param props - {@link RowProps}.
 * @returns A styled row mimicking a trip-generation form field.
 */
const Row: React.FC<RowProps> = ({ Icon, label, value }) => {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.row,
        { backgroundColor: theme.colors.surface, borderRadius: theme.radii.md },
      ]}>
      <View
        style={[
          styles.rowIcon,
          { backgroundColor: theme.colors.emeraldSoft, borderRadius: theme.radii.sm },
        ]}>
        <Icon size={16} color={theme.colors.emeraldDeep} stroke={2} />
      </View>
      <View style={styles.rowText}>
        <Text style={[styles.rowLabel, { color: theme.colors.mute, fontFamily: theme.fonts.mono }]}>
          {label}
        </Text>
        <Text style={[styles.rowValue, { color: theme.colors.ink, fontFamily: theme.fonts.display }]}>
          {value}
        </Text>
      </View>
    </View>
  );
};

/**
 * Hero illustration for the "plan a trip" slide — a mock generation form
 * (dates, budget, map) capped by an emerald "generate" pill.
 *
 * @returns The composed illustration.
 */
const PlanIllustration: React.FC = () => {
  const { theme } = useTheme();
  return (
    <View style={styles.illu}>
      <View style={[styles.card, { backgroundColor: theme.colors.emeraldSoft }]}>
        <Row Icon={Calendar} label="DATES" value="Jun 12 — Jun 16" />
        <Row Icon={Wallet} label="BUDGET" value="€420 · €105 a day" />
        <Row Icon={Route} label="MAP" value="Barcelona favourites" />
        <View style={[styles.aiPill, { backgroundColor: theme.colors.emerald }]}>
          <Sparkles size={14} color={theme.colors.onEmerald} stroke={2} />
          <Text
            style={[styles.aiLabel, { color: theme.colors.onEmerald, fontFamily: theme.fonts.mono }]}>
            generate itinerary
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  illu: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  card: {
    width: '100%',
    padding: 12,
    borderRadius: 18,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  rowIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  aiPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 999,
    alignSelf: 'center',
    marginTop: 2,
  },
  aiLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default PlanIllustration;
