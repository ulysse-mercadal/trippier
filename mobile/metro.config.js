// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  resolver: {
    blockList: /.*\/android\/build\/.*/,
    unstable_enablePackageExports: true,
    unstable_conditionNames: ['react-native', 'browser', 'import', 'require'],
    resolverMainFields: ['react-native', 'browser', 'module', 'main'],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
