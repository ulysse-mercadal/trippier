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
 * Compass icon (Feather-style).
 *
 * @param props - {@link IconProps}.
 * @returns An `<Svg>` element rendering a compass.
 */
const Compass: React.FC<IconProps> = props => (
  <BaseIcon {...props}>
    <Circle cx={12} cy={12} r={10} />
    <Path d="M16 8l-2 6-6 2 2-6 6-2z" />
  </BaseIcon>
);

export default Compass;
