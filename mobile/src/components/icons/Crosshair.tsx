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
 * Crosshair icon (locate-me action).
 *
 * @param props - {@link IconProps}.
 * @returns The crosshair icon SVG.
 */
const Crosshair: React.FC<IconProps> = props => (
  <BaseIcon {...props}>
    <Circle cx={12} cy={12} r={10} />
    <Path d="M22 12h-4M6 12H2M12 6V2M12 22v-4" />
  </BaseIcon>
);

export default Crosshair;
