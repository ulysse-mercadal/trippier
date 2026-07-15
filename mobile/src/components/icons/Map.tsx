// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React from 'react';
import { Path } from 'react-native-svg';
import { BaseIcon, IconProps } from './Icon';

/**
 * Map icon (folded map shape).
 *
 * @param props - {@link IconProps}.
 * @returns The map icon SVG.
 */
const Map: React.FC<IconProps> = props => (
  <BaseIcon {...props}>
    <Path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6z" />
    <Path d="M9 3v15M15 6v15" />
  </BaseIcon>
);

export default Map;
