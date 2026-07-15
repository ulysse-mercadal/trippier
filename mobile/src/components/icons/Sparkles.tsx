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
 * Sparkles icon used for AI-related actions.
 *
 * @param props - {@link IconProps}.
 * @returns The sparkles icon SVG.
 */
const Sparkles: React.FC<IconProps> = props => (
  <BaseIcon {...props}>
    <Path d="M12 3l1.8 4.5L18 9l-4.2 1.5L12 15l-1.8-4.5L6 9l4.2-1.5L12 3z" />
    <Path d="M19 16l.7 1.8L21.5 18l-1.8.7L19 20.5l-.7-1.8L16.5 18l1.8-.7L19 16z" />
  </BaseIcon>
);

export default Sparkles;
