// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

export interface CardBodyProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
}

/**
 * Padded slot for {@link Card} text content. Matches the v4 `.m-card-body`
 * spacing (16/18) by default.
 *
 * @param props - {@link CardBodyProps}.
 * @returns A view padding its children.
 */
const CardBody: React.FC<CardBodyProps> = ({ children, style, padding = 18 }) => {
  return <View style={[styles.base, { padding }, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    width: '100%',
  },
});

export default CardBody;
