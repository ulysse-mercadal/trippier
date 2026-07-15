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
 * Arrow-left icon.
 *
 * @param props - {@link IconProps}.
 * @returns The arrow-left icon SVG.
 */
const ArrowLeft: React.FC<IconProps> = props => (
  <BaseIcon {...props}>
    <Path d="M19 12H5M12 19l-7-7 7-7" />
  </BaseIcon>
);

export default ArrowLeft;
