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
 * Close (X) icon.
 *
 * @param props - {@link IconProps}.
 * @returns The X icon SVG.
 */
const X: React.FC<IconProps> = props => (
  <BaseIcon {...props}>
    <Path d="M18 6 6 18M6 6l12 12" />
  </BaseIcon>
);

export default X;
