// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Eyebrow from '../../components/Eyebrow';
import IconButton from '../../components/IconButton';
import MapTilerMap from '../../components/MapTilerMap';
import Meta from '../../components/Meta';
import SourcesSection from './SourcesSection';
import Tag from '../../components/Tag';
import TitleDot from '../../components/TitleDot';
import {
  ArrowLeft,
  Bookmark,
  MapPin as MapPinIcon,
  Share,
} from '../../components/icons';
import { useTheme } from '../../theme/useTheme';
import type { DiscoverStackParamList } from '../../navigation/types';
import type { PoiType } from '../../api/pois';

type Nav = NativeStackNavigationProp<DiscoverStackParamList, 'PoiDetail'>;
type Props = NativeStackScreenProps<DiscoverStackParamList, 'PoiDetail'>['route'];

/**
 * Geometry constants mirrored from the Discover screen so the POI detail
 * map renders inside the **exact same** rectangle as the default-open
 * Discover cutout. Kept in lockstep with DiscoverScreen's SEARCH_BAR_H +
 * FRAME — if either of those moves there, they move here too.
 */
const SEARCH_BAR_H = 52;
const FRAME = 12;
/**
 * Default-open Discover drawer covers 2/3 of the useful vertical space,
 * leaving 1/3 for the map cutout. We reuse the same denominator here so
 * the detail map keeps the same on-screen footprint as the framed map on
 * the previous screen.
 */
const MAP_HEIGHT_FRACTION = 1 / 3;
/** Tilt the camera into a strong 3D angle so buildings stand up. */
const MAP_PITCH_DEG = 60;
/** Zoom level for the orbiting camera — close enough to read the area. */
const MAP_ZOOM = 17;

/**
 * Maps the public-API POI type to the human-readable eyebrow label.
 *
 * @param type - POI category as returned by the API.
 * @returns A short capitalised label.
 */
function typeEyebrow(type: PoiType): string {
  switch (type) {
    case 'see':
      return 'Monument · Sight';
    case 'eat':
      return 'Restaurant';
    case 'drink':
      return 'Bar · Café';
    case 'do':
      return 'Activity';
    case 'buy':
      return 'Market · Shop';
    case 'sleep':
      return 'Stay';
    case 'event':
      return 'Event';
    case 'generic':
    default:
      return 'Place';
  }
}

/**
 * POI detail screen reached from the Discover drawer. Mirrors the v4 `MPoi`
 * spec: a media header carrying a real MapTiler map centered on the POI,
 * with floating back + share buttons, an eyebrow + dotted title, an
 * optional description, and a sticky pair of action buttons at the bottom.
 *
 * When the POI lacks coordinates (a zone-only fallback from the public API)
 * the media collapses to an emerald-soft placeholder rather than rendering
 * a misleading random map view.
 *
 * @returns The POI detail screen.
 */
const PoiDetailScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Props>();
  const insets = useSafeAreaInsets();
  const { height: windowH } = useWindowDimensions();
  const [rootH, setRootH] = useState(windowH);
  const { name, type, lat, lng, description, sources, wikidataId } =
    route.params;
  const hasCoords = typeof lat === 'number' && typeof lng === 'number';

  // Mirror the Discover screen's frame math so the map rectangle here is
  // pixel-aligned with the framed cutout the user just left. See
  // DiscoverScreen for the original derivation of each constant.
  const safeTop = insets.top > 0 ? insets.top : 12;
  const searchTopOffset = safeTop + 14;
  const cutoutTop = searchTopOffset + SEARCH_BAR_H + FRAME;
  const usefulH = Math.max(0, rootH - cutoutTop);
  const mapH = usefulH * MAP_HEIGHT_FRACTION;

  return (
    <View
      style={[styles.root, { backgroundColor: theme.colors.bg }]}
      onLayout={e => {
        const h = e.nativeEvent.layout.height;
        if (h > 0 && h !== rootH) {setRootH(h);}
      }}>
      <View
        style={[
          styles.media,
          {
            top: cutoutTop,
            height: mapH,
            borderRadius: theme.radii.xl,
            backgroundColor: theme.colors.emeraldSoft,
          },
          theme.shadows.e1,
        ]}>
        {hasCoords ? (
          <MapTilerMap
            center={{ lat: lat!, lng: lng! }}
            zoom={MAP_ZOOM}
            pitch={MAP_PITCH_DEG}
            autoRotate
            markers={[{ id: 'poi-self', lat: lat!, lng: lng! }]}
            staticPreview
          />
        ) : null}
        <View pointerEvents="box-none" style={[styles.mediaActions, { top: 14 }]}>
          <IconButton
            accessibilityLabel="Back"
            onPress={() => navigation.goBack()}>
            <ArrowLeft size={20} color={theme.colors.ink} />
          </IconButton>
          <IconButton accessibilityLabel="Share">
            <Share size={18} color={theme.colors.ink} />
          </IconButton>
        </View>
        <View pointerEvents="box-none" style={styles.mediaTags}>
          <Tag variant="ink">{typeEyebrow(type)}</Tag>
          {hasCoords ? (
            <Tag variant="emerald" dot>
              Located
            </Tag>
          ) : null}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: cutoutTop + mapH + 18 },
        ]}>
        <View style={styles.body}>
          <Eyebrow>{typeEyebrow(type)}</Eyebrow>
          <Text
            style={[
              styles.h1,
              { color: theme.colors.ink, fontFamily: theme.fonts.display },
            ]}>
            {name}
            <TitleDot />
          </Text>

          {description ? (
            <Text
              style={[
                styles.bodyText,
                { color: theme.colors.ink2, fontFamily: theme.fonts.display },
              ]}>
              {description}
            </Text>
          ) : (
            <Meta>
              We don't have a description yet — open in maps or save it to a
              trip and we'll keep enriching it in the background.
            </Meta>
          )}

          {hasCoords ? (
            <Card variant="flat" style={styles.practical}>
              <View style={styles.practicalRow}>
                <Meta>Latitude</Meta>
                <Text
                  style={[
                    styles.practicalValue,
                    {
                      color: theme.colors.ink,
                      fontFamily: theme.fonts.mono,
                    },
                  ]}>
                  {lat!.toFixed(5)}
                </Text>
              </View>
              <View
                style={[
                  styles.practicalRow,
                  { borderTopWidth: 1, borderTopColor: theme.colors.line },
                ]}>
                <Meta>Longitude</Meta>
                <Text
                  style={[
                    styles.practicalValue,
                    {
                      color: theme.colors.ink,
                      fontFamily: theme.fonts.mono,
                    },
                  ]}>
                  {lng!.toFixed(5)}
                </Text>
              </View>
            </Card>
          ) : null}

          <SourcesSection sources={sources} wikidataId={wikidataId} />
        </View>
      </ScrollView>

      <View
        style={[
          styles.stickyActions,
          {
            backgroundColor: theme.colors.bg,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 20,
          },
        ]}>
        <Button
          variant="outline"
          label="Directions"
          icon={<MapPinIcon size={17} color={theme.colors.ink} />}
          style={styles.actionLeft}
        />
        <Button
          label="Save to trip"
          icon={<Bookmark size={17} color={theme.colors.onEmerald} />}
          style={styles.actionRight}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    paddingBottom: 110,
  },
  media: {
    position: 'absolute',
    left: FRAME,
    right: FRAME,
    overflow: 'hidden',
  },
  mediaActions: {
    position: 'absolute',
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mediaTags: {
    position: 'absolute',
    left: 16,
    bottom: 16,
    flexDirection: 'row',
    gap: 8,
  },
  body: {
    paddingHorizontal: 22,
    paddingTop: 4,
    gap: 12,
  },
  h1: {
    fontWeight: '700',
    fontSize: 32,
    letterSpacing: -0.96,
    marginTop: 8,
  },
  bodyText: {
    fontSize: 14.5,
    lineHeight: 22,
    marginTop: 4,
  },
  practical: {
    marginTop: 12,
  },
  practicalRow: {
    paddingVertical: 13,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  practicalValue: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.15,
  },
  stickyActions: {
    paddingHorizontal: 18,
    paddingTop: 12,
    flexDirection: 'row',
    gap: 10,
  },
  actionLeft: {
    flex: 1,
  },
  actionRight: {
    flex: 1.3,
  },
});

export default PoiDetailScreen;
