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
 * Document icon — file/page glyph used for "Keep" entries and tickets.
 *
 * @param props - {@link IconProps}.
 * @returns The document icon SVG.
 */
const Doc: React.FC<IconProps> = props => (
  <BaseIcon {...props}>
    <Path d="M7 3h7l5 5v13H7z" />
    <Path d="M14 3v5h5" />
  </BaseIcon>
);

export default Doc;
