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
 * Calendar icon.
 *
 * @param props - {@link IconProps}.
 * @returns The calendar icon SVG.
 */
const Calendar: React.FC<IconProps> = props => (
  <BaseIcon {...props}>
    <Rect x={3} y={4} width={18} height={18} rx={2} />
    <Path d="M16 2v4M8 2v4M3 10h18" />
  </BaseIcon>
);

export default Calendar;
