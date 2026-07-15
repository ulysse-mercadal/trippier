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
 * Cloud icon.
 *
 * @param props - {@link IconProps}.
 * @returns The cloud icon SVG.
 */
const Cloud: React.FC<IconProps> = props => (
  <BaseIcon {...props}>
    <Path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
  </BaseIcon>
);

export default Cloud;
