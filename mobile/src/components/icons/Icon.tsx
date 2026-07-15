// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React from 'react';
import Svg, { SvgProps } from 'react-native-svg';

export interface IconProps {
  size?: number;
  stroke?: number;
  color?: string;
}

export interface BaseIconProps extends IconProps {
  children: React.ReactNode;
  viewBox?: string;
}

/**
 * Base wrapper used by every icon — sets viewBox, stroke and inherited color.
 *
 * @param props - The {@link BaseIconProps} (size, stroke, color, children).
 * @returns A pre-configured `<Svg>` element.
 */
export const BaseIcon: React.FC<BaseIconProps> = ({
  size = 20,
  stroke = 1.8,
  color = 'currentColor',
  viewBox = '0 0 24 24',
  children,
}) => {
  const svgProps: SvgProps = {
    width: size,
    height: size,
    viewBox,
    fill: 'none',
    stroke: color,
    strokeWidth: stroke,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };
  return <Svg {...svgProps}>{children}</Svg>;
};
