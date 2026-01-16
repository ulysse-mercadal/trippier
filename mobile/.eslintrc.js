// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

module.exports = {
  root: true,
  extends: '@react-native',
  plugins: ['header'],
  rules: {
    curly: ['error', 'all'],
    'header/header': [
      'error',
      'line',
      [
        ' **************************************************************************',
        '',
        '  Trippier Project - Mobile App',
        '',
        '  By: Ulysse Mercadal',
        '  Email: ulyssemercadal@kakao.com',
        '',
        ' **************************************************************************',
      ],
      2,
    ],
    'eol-last': ['error', 'always'],
    'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
    'react-native/no-inline-styles': 'off',
    'react/no-unstable-nested-components': 'off',
    'react-hooks/exhaustive-deps': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
};
