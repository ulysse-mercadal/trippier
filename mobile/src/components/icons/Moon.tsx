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
 * Moon icon (dark theme switch).
 *
 * @param props - {@link IconProps}.
 * @returns The moon icon SVG.
 */
const Moon: React.FC<IconProps> = props => (
  <BaseIcon {...props}>
    <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </BaseIcon>
);

export default Moon;
