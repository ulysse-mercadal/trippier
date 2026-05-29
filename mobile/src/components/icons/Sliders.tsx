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
 * Sliders icon (settings / weights).
 *
 * @param props - {@link IconProps}.
 * @returns The sliders icon SVG.
 */
const Sliders: React.FC<IconProps> = props => (
  <BaseIcon {...props}>
    <Path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" />
  </BaseIcon>
);

export default Sliders;
