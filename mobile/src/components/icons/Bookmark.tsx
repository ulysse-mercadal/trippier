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
 * Bookmark outline icon.
 *
 * @param props - {@link IconProps}.
 * @returns The bookmark icon SVG.
 */
const Bookmark: React.FC<IconProps> = props => (
  <BaseIcon {...props}>
    <Path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
  </BaseIcon>
);

export default Bookmark;
