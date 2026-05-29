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
 * Wallet icon.
 *
 * @param props - {@link IconProps}.
 * @returns The wallet icon SVG.
 */
const Wallet: React.FC<IconProps> = props => (
  <BaseIcon {...props}>
    <Path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
    <Path d="M4 6v12a2 2 0 0 0 2 2h14v-4" />
    <Path d="M18 12a2 2 0 0 0 0 4h4v-4z" />
  </BaseIcon>
);

export default Wallet;
