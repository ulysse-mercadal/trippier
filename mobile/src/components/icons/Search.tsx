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
 * Magnifier / search icon.
 *
 * @param props - {@link IconProps}.
 * @returns The search icon SVG.
 */
const Search: React.FC<IconProps> = props => (
  <BaseIcon {...props}>
    <Circle cx={11} cy={11} r={8} />
    <Path d="m21 21-4.3-4.3" />
  </BaseIcon>
);

export default Search;
