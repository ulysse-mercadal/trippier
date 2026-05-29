// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { IconProps } from './Icon';

/**
 * Bookmark icon rendered with a solid fill (active state).
 *
 * @param props - {@link IconProps}.
 * @returns The filled bookmark icon SVG.
 */
const BookmarkFilled: React.FC<IconProps> = ({ size = 20, stroke = 1.8, color = 'currentColor' }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
    stroke={color}
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round">
    <Path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
  </Svg>
);

export default BookmarkFilled;
