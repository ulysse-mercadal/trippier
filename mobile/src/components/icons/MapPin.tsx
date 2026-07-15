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
 * Map pin icon.
 *
 * @param props - {@link IconProps}.
 * @returns The map-pin icon SVG.
 */
const MapPin: React.FC<IconProps> = props => (
  <BaseIcon {...props}>
    <Path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
    <Circle cx={12} cy={10} r={3} />
  </BaseIcon>
);

export default MapPin;
