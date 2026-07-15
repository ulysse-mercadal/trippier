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
 * Stacked layers icon.
 *
 * @param props - {@link IconProps}.
 * @returns The layers icon SVG.
 */
const Layers: React.FC<IconProps> = props => (
  <BaseIcon {...props}>
    <Path d="M12 2l10 6-10 6L2 8l10-6z" />
    <Path d="M2 16l10 6 10-6M2 12l10 6 10-6" />
  </BaseIcon>
);

export default Layers;
