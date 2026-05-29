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
 * Sun icon (light theme switch).
 *
 * @param props - {@link IconProps}.
 * @returns The sun icon SVG.
 */
const Sun: React.FC<IconProps> = props => (
  <BaseIcon {...props}>
    <Circle cx={12} cy={12} r={5} />
    <Path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
  </BaseIcon>
);

export default Sun;
