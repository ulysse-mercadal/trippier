// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React from 'react';
import { Circle, Path } from 'react-native-svg';
import { BaseIcon, IconProps } from './Icon';

/**
 * Route icon — used for the Plan tab. A flag pole + branching path that
 * mirrors the v4 `MIcon` "route" glyph.
 *
 * @param props - {@link IconProps}.
 * @returns The route icon SVG.
 */
const Route: React.FC<IconProps> = props => (
  <BaseIcon {...props}>
    <Path d="M5 19V6a2 2 0 0 1 2-2h7" />
    <Path d="M9 4v15" />
    <Circle cx={17} cy={7} r={2.6} />
    <Path d="M17 12.5V19" />
  </BaseIcon>
);

export default Route;
