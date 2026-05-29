// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React, { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Avatar from '../../components/Avatar';
import Button from '../../components/Button';
import Card from '../../components/Card';
import List from '../../components/List';
import ListItem from '../../components/ListItem';
import Meta from '../../components/Meta';
import Tag from '../../components/Tag';
import { useAuthGate } from '../../hooks/useAuthGate';
import { useTheme } from '../../theme/useTheme';

/**
 * A nearby traveller match grouped under a "Same hotel" / "Same event" header.
 */
export interface NearbyMatch {
  id: string;
  name: string;
  context: string;
}

/**
 * A "Looking for…" intent tile that signals an open-ended hangout request.
 */
export interface IntentTile {
  id: string;
  label: string;
  hint: string;
}

/**
 * Stub data describing same-hotel matches in Barcelona.
 *
 * @returns The frozen list of mock hotel matches.
 */
// data: stub for wave 4 — wire when backend ready
function getMockHotelMatches(): readonly NearbyMatch[] {
  return [
    { id: 'h1', name: 'Ana Costa', context: 'Hotel Casa Camper · today → Sat' },
    { id: 'h2', name: 'Yuki Tanaka', context: 'Hotel Casa Camper · tomorrow' },
    { id: 'h3', name: 'Marco Bianchi', context: 'Hotel Casa Camper · Jun 13–17' },
  ];
}

/**
 * Stub data describing same-event matches in Barcelona.
 *
 * @returns The frozen list of mock event matches.
 */
// data: stub for wave 4 — wire when backend ready
function getMockEventMatches(): readonly NearbyMatch[] {
  return [
    { id: 'e1', name: 'Diego Fernández', context: 'Sónar 3-day pass · Jun 13–15' },
    { id: 'e2', name: 'Léa Martin', context: 'Sónar 3-day pass · Jun 13–15' },
  ];
}

/**
 * Stub data describing open intent tiles users can advertise to friends.
 *
 * @returns The frozen list of mock intent tiles.
 */
// data: stub for wave 4 — wire when backend ready
function getMockIntents(): readonly IntentTile[] {
  return [
    { id: 'i1', label: 'Dinner buddy', hint: 'Tonight · tapas crawl' },
    { id: 'i2', label: 'Sunrise walk', hint: 'Carmel bunkers · 6am' },
    { id: 'i3', label: 'Museum partner', hint: 'MNAC · this week' },
    { id: 'i4', label: 'Beach hang', hint: 'Bogatell · Sat afternoon' },
  ];
}

const HOTEL_MATCHES: readonly NearbyMatch[] = getMockHotelMatches();
const EVENT_MATCHES: readonly NearbyMatch[] = getMockEventMatches();
const INTENTS: readonly IntentTile[] = getMockIntents();

/**
 * Renders a section title sized to the v4 `m-section .h` typography.
 *
 * @param props - The wrapped string (section label).
 * @returns A bold heading line.
 */
const SectionHeader: React.FC<{ children: string }> = ({ children }) => {
  const { theme } = useTheme();
  return (
    <Text
      style={[
        styles.sectionHeader,
        { color: theme.colors.ink, fontFamily: theme.fonts.display },
      ]}>
      {children}
    </Text>
  );
};

/**
 * Friends nearby sub-view — privacy-first matchmaking against saved POIs,
 * hotel, dates and event passes. No raw location is ever surfaced.
 *
 * @returns The rendered nearby sub-view.
 */
const NearbyView: React.FC = () => {
  const { theme } = useTheme();
  const { gate } = useAuthGate();

  const handleSayHi = useCallback(
    (id: string): void => {
      gate('follow', () => {
        console.warn('action stubbed: say hi', id);
      });
    },
    [gate],
  );

  const handleIntent = useCallback(
    (id: string): void => {
      gate('follow', () => {
        console.warn('action stubbed: intent', id);
      });
    },
    [gate],
  );

  return (
    <View style={styles.root}>
      <View style={styles.privacy}>
        <Tag variant="emerald" dot>
          {'Saved POIs + hotel + dates · never raw location'}
        </Tag>
      </View>

      <SectionHeader>Same hotel</SectionHeader>
      <List>
        {HOTEL_MATCHES.map(match => (
          <ListItem
            key={match.id}
            name={match.name}
            meta={match.context}
            thumbEmerald
            thumb={<Avatar name={match.name} size={44} />}
            trail={<Button label="Say hi" variant="tonal" size="sm" onPress={() => handleSayHi(match.id)} />}
          />
        ))}
      </List>

      <SectionHeader>Same event</SectionHeader>
      <List>
        {EVENT_MATCHES.map(match => (
          <ListItem
            key={match.id}
            name={match.name}
            meta={match.context}
            thumbEmerald
            thumb={<Avatar name={match.name} size={44} />}
            trail={<Button label="Say hi" variant="tonal" size="sm" onPress={() => handleSayHi(match.id)} />}
          />
        ))}
      </List>

      <SectionHeader>Looking for…</SectionHeader>
      <View style={styles.grid}>
        {INTENTS.map(intent => (
          <Card key={intent.id} style={{ ...styles.intentCard, backgroundColor: theme.colors.emeraldSoft }}>
            <View style={styles.intentInner}>
              <Text
                style={[
                  styles.intentLabel,
                  { color: theme.colors.emeraldDeep, fontFamily: theme.fonts.display },
                ]}
                onPress={() => handleIntent(intent.id)}>
                {intent.label}
              </Text>
              <Meta style={{ ...styles.intentMeta, color: theme.colors.emeraldDeep }}>
                {intent.hint}
              </Meta>
            </View>
          </Card>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    gap: 14,
  },
  privacy: {
    paddingBottom: 4,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  intentCard: {
    width: '48%',
    minHeight: 100,
  },
  intentInner: {
    padding: 16,
    gap: 4,
    justifyContent: 'flex-end',
    flex: 1,
  },
  intentLabel: {
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: -0.3,
  },
  intentMeta: {
    fontSize: 11.5,
    opacity: 0.85,
  },
});

export default NearbyView;
