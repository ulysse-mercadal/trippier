// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React from 'react';
import { Circle, Path } from 'react-native-svg';
import { BaseIcon, IconProps } from './Icon';

/**
 * Clock icon.
 *
 * @param props - {@link IconProps}.
 * @returns The clock icon SVG.
 */
const Clock: React.FC<IconProps> = props => (
  <BaseIcon {...props}>
    <Circle cx={12} cy={12} r={10} />
    <Path d="M12 6v6l4 2" />
  </BaseIcon>
);

export default Clock;
