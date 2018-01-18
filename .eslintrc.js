'use strict';

const OFF = 0;
const WARNING = 1;
const ERROR = 2;
const INDENT_SIZE = 2;

module.exports = {
  extends: 'fbjs',
  
  // Stop ESLint from looking for a configuration file in parent folders
  root: true,
  
  env: {
    es6: true,
    browser: true,
    node: true
  },
  
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module'
  },
  
  rules: {
    // 允许函数没有 return 语句
    'consistent-return': OFF,
    // 匿名函数 function 关键字和括号之间保留一个空格
    // require `function foo()` instead of `function foo ()`
    'space-before-function-paren': [
      WARNING,
      {anonymous: 'always', named: 'never'},
    ],
    // 允许按位运算符
    'no-bitwise': OFF,
    //
    'comma-dangle': [ERROR, 'never'],
  },
  
  globals: {
    define: true
  }
};