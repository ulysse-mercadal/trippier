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
import IconButton from '../../components/IconButton';
import { Bookmark, BookmarkFilled, Crosshair } from '../../components/icons';
import { useTheme } from '../../theme/useTheme';
import type { PoiType } from '../../api/pois';
import { iconForPoiType } from './poi-type-glyph';

export interface PoiListRowProps {
  name: string;
  meta: string;
  type: PoiType;
  distanceMeters?: number;
  saved?: boolean;
  onPress?: () => void;
  /** Triggered by the side icon-button — fly the map to this POI without
   *  leaving the screen. Hidden when the POI has no usable coords. */
  onZoomPress?: () => void;
}

/**
 * Formats a distance for the row's meta. Switches from metres to kilometres
 * past 1 km so the line stays compact ("420 m" vs "1.2 km").
 *
 * @param meters - Raw distance in metres, as returned by the public API.
 * @returns A short human-readable distance, e.g. `"420 m"` or `"1.2 km"`.
 */
function formatDistance(meters: number): string {
  if (meters < 1000) {return `${Math.round(meters)} m`;}
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Discover drawer row. The thumb is a flat emerald-soft tile carrying a pin
 * glyph rather than a fake map — keeps the row light and avoids competing
 * with the real map sitting on top.
 *
 * @param props - {@link PoiListRowProps}.
 * @returns A pressable row composed of thumb + body + trail.
 */
const PoiListRow: React.FC<PoiListRowProps> = ({
  name,
  meta,
  type,
  distanceMeters,
  saved = false,
  onPress,
  onZoomPress,
}) => {
  const { theme } = useTheme();
  const BookmarkIcon = saved ? BookmarkFilled : Bookmark;
  const TypeIcon = iconForPoiType(type);
  const distanceLabel =
    distanceMeters && distanceMeters > 0 ? formatDistance(distanceMeters) : undefined;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${meta}`}
      onPress={onPress}
      style={styles.row}>
      <View
        style={[
          styles.thumb,
          { backgroundColor: theme.colors.emeraldSoft },
        ]}>
        <TypeIcon size={22} color={theme.colors.emeraldDeep} />
      </View>
      <View style={styles.body}>
        <Text
          numberOfLines={1}
          style={[
            styles.name,
            { color: theme.colors.ink, fontFamily: theme.fonts.display },
          ]}>
          {name}
        </Text>
        <Text
          numberOfLines={1}
          style={[
            styles.meta,
            { color: theme.colors.mute, fontFamily: theme.fonts.mono },
          ]}>
          {meta}
        </Text>
      </View>
      {onZoomPress ? (
        <IconButton
          accessibilityLabel={`Center map on ${name}`}
          variant="flat"
          onPress={onZoomPress}>
          <Crosshair size={18} color={theme.colors.ink2} />
        </IconButton>
      ) : null}
      <View style={styles.trail}>
        {distanceLabel ? (
          <Text
            style={[
              styles.distance,
              { color: theme.colors.emeraldDeep, fontFamily: theme.fonts.display },
            ]}>
            {distanceLabel}
          </Text>
        ) : null}
        <BookmarkIcon
          size={20}
          color={saved ? theme.colors.emerald : theme.colors.mute2}
        />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  meta: {
    fontSize: 12.5,
    letterSpacing: 0.05,
  },
  trail: {
    alignItems: 'flex-end',
    gap: 6,
  },
  distance: {
    fontSize: 13,
    fontWeight: '700',
  },
});

export default PoiListRow;
