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
 * Chevron-right icon.
 *
 * @param props - {@link IconProps}.
 * @returns The chevron-right icon SVG.
 */
const ChevronRight: React.FC<IconProps> = props => (
  <BaseIcon {...props}>
    <Path d="m9 18 6-6-6-6" />
  </BaseIcon>
);

export default ChevronRight;
