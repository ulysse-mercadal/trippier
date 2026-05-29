// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

/**
 * Ambient module declaration for `react-native-svg` so that wave-1 code
 * type-checks before the package is `npm install`-ed. Once the real types
 * land they shadow these stubs automatically — this file becomes a no-op.
 */

declare module 'react-native-svg' {
  import { Component } from 'react';
  import { ViewProps, StyleProp, ViewStyle } from 'react-native';

  export interface SvgProps extends ViewProps {
    width?: number | string;
    height?: number | string;
    viewBox?: string;
    preserveAspectRatio?: string;
    fill?: string;
    stroke?: string;
    strokeWidth?: number | string;
    strokeLinecap?: 'butt' | 'round' | 'square';
    strokeLinejoin?: 'miter' | 'round' | 'bevel';
    style?: StyleProp<ViewStyle>;
    pointerEvents?: 'auto' | 'none' | 'box-none' | 'box-only';
    children?: React.ReactNode;
  }

  export interface CommonPathProps {
    d?: string;
    fill?: string;
    fillOpacity?: number | string;
    stroke?: string;
    strokeWidth?: number | string;
    strokeLinecap?: 'butt' | 'round' | 'square';
    strokeLinejoin?: 'miter' | 'round' | 'bevel';
    strokeDasharray?: string | number[];
    strokeDashoffset?: number | string;
    strokeOpacity?: number | string;
    opacity?: number;
    children?: React.ReactNode;
  }

  export interface CircleProps extends CommonPathProps {
    cx?: number | string;
    cy?: number | string;
    r?: number | string;
  }
  export interface RectProps extends CommonPathProps {
    x?: number | string;
    y?: number | string;
    width?: number | string;
    height?: number | string;
    rx?: number | string;
    ry?: number | string;
  }
  export interface EllipseProps extends CommonPathProps {
    cx?: number | string;
    cy?: number | string;
    rx?: number | string;
    ry?: number | string;
  }
  export interface TextSvgProps extends CommonPathProps {
    x?: number | string;
    y?: number | string;
    fontFamily?: string;
    fontSize?: number | string;
    fontStyle?: 'normal' | 'italic' | 'oblique';
    fontWeight?: number | string;
    textAnchor?: 'start' | 'middle' | 'end';
    letterSpacing?: number | string;
  }
  export interface LineProps extends CommonPathProps {
    x1?: number | string;
    y1?: number | string;
    x2?: number | string;
    y2?: number | string;
  }
  export interface PathProps extends CommonPathProps {}
  export interface GProps extends CommonPathProps {
    mask?: string;
  }
  export interface MaskProps {
    id?: string;
    children?: React.ReactNode;
  }
  export interface DefsProps {
    children?: React.ReactNode;
  }
  export interface PatternProps {
    id?: string;
    width?: number | string;
    height?: number | string;
    patternUnits?: string;
    patternTransform?: string;
    children?: React.ReactNode;
  }
  export interface RadialGradientProps {
    id?: string;
    cx?: number | string;
    cy?: number | string;
    r?: number | string;
    rx?: number | string;
    ry?: number | string;
    children?: React.ReactNode;
  }
  export interface LinearGradientProps {
    id?: string;
    x1?: number | string;
    y1?: number | string;
    x2?: number | string;
    y2?: number | string;
    gradientUnits?: 'userSpaceOnUse' | 'objectBoundingBox';
    children?: React.ReactNode;
  }
  export interface StopProps {
    offset?: number | string;
    stopColor?: string;
    stopOpacity?: number | string;
  }

  export class Svg extends Component<SvgProps> {}
  export class Circle extends Component<CircleProps> {}
  export class Rect extends Component<RectProps> {}
  export class Ellipse extends Component<EllipseProps> {}
  export class Line extends Component<LineProps> {}
  export class Text extends Component<TextSvgProps> {}
  export class Path extends Component<PathProps> {}
  export class G extends Component<GProps> {}
  export class Mask extends Component<MaskProps> {}
  export class Defs extends Component<DefsProps> {}
  export class Pattern extends Component<PatternProps> {}
  export class RadialGradient extends Component<RadialGradientProps> {}
  export class LinearGradient extends Component<LinearGradientProps> {}
  export class Stop extends Component<StopProps> {}

  export default Svg;
}
