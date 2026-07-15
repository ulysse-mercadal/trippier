// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppBar from '../../components/AppBar';
import IconButton from '../../components/IconButton';
import SegmentedControl from '../../components/SegmentedControl';
import { Bell } from '../../components/icons';
import { useTheme } from '../../theme/useTheme';
import FeedView from './FeedView';
import NearbyView from './NearbyView';
import YourMapView from './YourMapView';

type FriendsView = 'feed' | 'nearby' | 'map';

const SEGMENTS: readonly FriendsView[] = ['feed', 'nearby', 'map'] as const;

/**
 * Maps each {@link FriendsView} id to its segmented control label.
 *
 * @param value - The segment identifier.
 * @returns The human readable label.
 */
function labelFor(value: FriendsView): string {
  if (value === 'feed') {
    return 'Feed';
  }
  if (value === 'nearby') {
    return 'Nearby';
  }
  return 'Your map';
}

/**
 * Friends tab host — owns the active sub-view state and renders the AppBar,
 * the three-segment control and whichever view is currently selected.
 *
 * @returns The rendered friends screen.
 */
const FriendsScreen: React.FC = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [view, setView] = useState<FriendsView>('feed');

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.bg }]}>
      <View style={{ paddingTop: insets.top }}>
        <AppBar
          title="Friends"
          subtitle="12 friends · 3 near you"
          trailing={
            <IconButton accessibilityLabel="Notifications" showBadge>
              <Bell size={19} color={theme.colors.ink} />
            </IconButton>
          }
        />
        <View style={styles.segWrap}>
          <SegmentedControl<FriendsView>
            segments={SEGMENTS}
            value={view}
            onChange={setView}
            labelFor={labelFor}
          />
        </View>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 100 },
        ]}>
        {view === 'feed' ? <FeedView /> : null}
        {view === 'nearby' ? <NearbyView /> : null}
        {view === 'map' ? <YourMapView /> : null}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  segWrap: {
    paddingHorizontal: 18,
    paddingBottom: 8,
  },
  scroll: {
    paddingHorizontal: 18,
    paddingTop: 8,
  },
});

export default FriendsScreen;
