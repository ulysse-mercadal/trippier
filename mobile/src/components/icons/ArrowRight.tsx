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
 * Arrow-right icon.
 *
 * @param props - {@link IconProps}.
 * @returns The arrow-right icon SVG.
 */
const ArrowRight: React.FC<IconProps> = props => (
  <BaseIcon {...props}>
    <Path d="M5 12h14M12 5l7 7-7 7" />
  </BaseIcon>
);

export default ArrowRight;
