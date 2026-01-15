// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import 'react-native';
import React from 'react';
import App from '../App';

import { it } from '@jest/globals';

import renderer from 'react-test-renderer';

it('renders correctly', () => {
  renderer.create(<App />);
});
