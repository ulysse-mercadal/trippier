// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React from 'react';
import { Circle } from 'react-native-svg';
import { BaseIcon, IconProps } from './Icon';

/**
 * Vertical "more" icon (three stacked dots).
 *
 * @param props - {@link IconProps}.
 * @returns The more-vertical icon SVG.
 */
const MoreVertical: React.FC<IconProps> = props => (
  <BaseIcon {...props}>
    <Circle cx={12} cy={5} r={1} />
    <Circle cx={12} cy={12} r={1} />
    <Circle cx={12} cy={19} r={1} />
  </BaseIcon>
);

export default MoreVertical;
