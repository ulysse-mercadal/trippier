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
 * Share icon (three-node graph).
 *
 * @param props - {@link IconProps}.
 * @returns The share icon SVG.
 */
const Share: React.FC<IconProps> = props => (
  <BaseIcon {...props}>
    <Circle cx={18} cy={5} r={3} />
    <Circle cx={6} cy={12} r={3} />
    <Circle cx={18} cy={19} r={3} />
    <Path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
  </BaseIcon>
);

export default Share;
