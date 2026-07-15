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
 * External-link icon — a window with an arrow leaving its corner. Used as
 * the universal "open in browser" affordance.
 *
 * @param props - {@link IconProps}.
 * @returns The external-link icon SVG.
 */
const ExternalLink: React.FC<IconProps> = props => (
  <BaseIcon {...props}>
    <Path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <Path d="M15 3h6v6" />
    <Path d="M10 14L21 3" />
  </BaseIcon>
);

export default ExternalLink;
