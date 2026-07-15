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
 * Filter (sliders descending) icon.
 *
 * @param props - {@link IconProps}.
 * @returns The filter icon SVG.
 */
const Filter: React.FC<IconProps> = props => (
  <BaseIcon {...props}>
    <Path d="M3 6h18M7 12h10M11 18h2" />
  </BaseIcon>
);

export default Filter;
