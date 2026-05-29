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
 * Check icon — used for selected state in theme choosers.
 *
 * @param props - {@link IconProps}.
 * @returns The check icon SVG.
 */
const Check: React.FC<IconProps> = props => (
  <BaseIcon {...props}>
    <Path d="M4 12.5l5 5 11-11" />
  </BaseIcon>
);

export default Check;
