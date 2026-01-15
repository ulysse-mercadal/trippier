// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import { AppRegistry, LogBox } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Ignore specific warnings
LogBox.ignoreLogs(['Require cycle:', 'Remote debugger', 'ViewPropTypes will be removed']);

AppRegistry.registerComponent(appName, () => App);
