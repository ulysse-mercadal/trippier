// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React from 'react';
import { Rect } from 'react-native-svg';
import { BaseIcon, IconProps } from './Icon';

/**
 * Grid icon — used for the Tools tab. Four rounded squares arranged in a
 * 2x2 grid, matching the v4 `MIcon` "grid" glyph.
 *
 * @param props - {@link IconProps}.
 * @returns The grid icon SVG.
 */
const Grid: React.FC<IconProps> = props => (
  <BaseIcon {...props}>
    <Rect x={4} y={4} width={6.5} height={6.5} rx={2} />
    <Rect x={13.5} y={4} width={6.5} height={6.5} rx={2} />
    <Rect x={4} y={13.5} width={6.5} height={6.5} rx={2} />
    <Rect x={13.5} y={13.5} width={6.5} height={6.5} rx={2} />
  </BaseIcon>
);

export default Grid;
