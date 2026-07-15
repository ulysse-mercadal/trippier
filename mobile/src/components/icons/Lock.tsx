// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React from 'react';
import { Path, Rect } from 'react-native-svg';
import { BaseIcon, IconProps } from './Icon';

/**
 * Lock icon.
 *
 * @param props - {@link IconProps}.
 * @returns The lock icon SVG.
 */
const Lock: React.FC<IconProps> = props => (
  <BaseIcon {...props}>
    <Rect x={3} y={11} width={18} height={11} rx={2} />
    <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </BaseIcon>
);

export default Lock;
