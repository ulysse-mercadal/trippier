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
 * Chevron-down icon.
 *
 * @param props - {@link IconProps}.
 * @returns The chevron-down icon SVG.
 */
const ChevronDown: React.FC<IconProps> = props => (
  <BaseIcon {...props}>
    <Path d="m6 9 6 6 6-6" />
  </BaseIcon>
);

export default ChevronDown;
