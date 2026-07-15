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
 * Microphone icon.
 *
 * @param props - {@link IconProps}.
 * @returns The microphone icon SVG.
 */
const Mic: React.FC<IconProps> = props => (
  <BaseIcon {...props}>
    <Rect x={9} y={2} width={6} height={12} rx={3} />
    <Path d="M5 10a7 7 0 0 0 14 0M12 19v3" />
  </BaseIcon>
);

export default Mic;
