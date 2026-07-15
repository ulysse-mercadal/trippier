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
 * Plus icon.
 *
 * @param props - {@link IconProps}.
 * @returns The plus icon SVG.
 */
const Plus: React.FC<IconProps> = props => (
  <BaseIcon {...props}>
    <Path d="M12 5v14M5 12h14" />
  </BaseIcon>
);

export default Plus;
