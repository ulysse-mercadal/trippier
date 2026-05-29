// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React, { useId } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  Line,
  LinearGradient,
  Path,
  Rect,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import type { MapPalette } from '../../theme/tokens';

const VIEW = 100;
const FADE_HEIGHT_PCT = 0.72;
const GRID_LINES = 13;
const GRID_STEP = 8;

export interface PreviewMapProps {
  palette: MapPalette;
  surfaceColor: string;
  height?: number;
}

/**
 * Faithful port of the v4 `MMapV4` SVG used in the Welcome screen preview.
 *
 * Recreates exactly the same parks, water, road grid + main roads,
 * intersection dots, selection polygon and three italic location labels
 * as the design source. The bottom 46% carries the same
 * `linear-gradient(180deg, transparent, surface 88%)` fade as the v4
 * `.m-card-media::after` so the map blends into the card body.
 *
 * @param props - {@link PreviewMapProps}.
 * @returns A full-bleed SVG sample of the picked map palette.
 */
const PreviewMap: React.FC<PreviewMapProps> = ({ palette, surfaceColor, height = 150 }) => {
  const fadeY = VIEW * (1 - FADE_HEIGHT_PCT);
  const fadeH = VIEW * FADE_HEIGHT_PCT;
  const gradientId = `m-card-media-fade-${useId()}`;
  return (
    <View style={[styles.wrap, { height, backgroundColor: palette.bg }]}>
      <Svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${VIEW} ${VIEW}`}
        preserveAspectRatio="xMidYMid slice">
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={surfaceColor} stopOpacity={0} />
            <Stop offset="0.25" stopColor={surfaceColor} stopOpacity={0.35} />
            <Stop offset="0.6" stopColor={surfaceColor} stopOpacity={0.85} />
            <Stop offset="1" stopColor={surfaceColor} stopOpacity={1} />
          </LinearGradient>
        </Defs>

        <Rect x="0" y="0" width={VIEW} height={VIEW} fill={palette.bg} />

        <Path
          d="M 8 34 Q 20 28 30 36 Q 36 44 28 52 Q 18 58 10 50 Q 4 42 8 34 Z"
          fill={palette.park}
        />
        <Path
          d="M 44 56 Q 56 50 66 58 Q 72 66 64 76 Q 52 84 44 74 Q 38 64 44 56 Z"
          fill={palette.park}
        />
        <Ellipse cx="82" cy="30" rx="10" ry="7" fill={palette.park} />

        <Path
          d="M -4 30 Q 24 40 40 56 Q 52 68 64 70 Q 82 73 104 64 L 104 70 Q 82 79 63 76 Q 49 74 38 62 Q 23 47 -4 36 Z"
          fill={palette.water}
          fillOpacity={0.92}
        />

        <G stroke={palette.road2} strokeWidth={0.5} fill="none">
          {Array.from({ length: GRID_LINES }).map((_, i) => (
            <Line
              key={`h-${i}`}
              x1="0"
              y1={i * GRID_STEP}
              x2="100"
              y2={i * GRID_STEP + 6}
            />
          ))}
          {Array.from({ length: GRID_LINES }).map((_, i) => (
            <Line
              key={`v-${i}`}
              x1={i * GRID_STEP}
              y1="0"
              x2={i * GRID_STEP - 6}
              y2="100"
            />
          ))}
        </G>

        <G
          stroke={palette.road}
          strokeWidth={1.5}
          fill="none"
          strokeLinecap="round"
          opacity={0.9}>
          <Path d="M 0 88 L 100 30" />
          <Path d="M 6 0 L 60 56 L 100 96" />
          <Path d="M 0 52 Q 40 48 100 58" />
        </G>

        <G stroke={palette.road} strokeWidth={1} fill="none" opacity={0.85}>
          <Circle cx="60" cy="56" r="3" />
          <Circle cx="18" cy="44" r="2.2" />
        </G>

        <Path
          d="M 30 56 L 70 40 L 92 78 L 56 96 L 30 84 Z"
          stroke={palette.sel}
          strokeWidth={0.9}
          fill={palette.selFill}
        />

        <SvgText
          x="22"
          y="44"
          fill={palette.label}
          fontFamily="Bricolage Grotesque"
          fontStyle="italic"
          fontSize="2.6"
          opacity={0.85}>
          Parc de l'Avril
        </SvgText>
        <SvgText
          x="40"
          y="60"
          fill={palette.label}
          fontFamily="Bricolage Grotesque"
          fontStyle="italic"
          fontSize="2.6"
          opacity={0.85}>
          la Seine
        </SvgText>
        <SvgText
          x="60"
          y="72"
          fill={palette.label}
          fontFamily="Bricolage Grotesque"
          fontStyle="italic"
          fontSize="2.6"
          opacity={0.85}>
          rives de Sant
        </SvgText>

        <Rect
          x="0"
          y={fadeY}
          width={VIEW}
          height={fadeH}
          fill={`url(#${gradientId})`}
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    overflow: 'hidden',
  },
});

export default PreviewMap;
