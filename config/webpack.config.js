'use strict';

const { merge } = require('webpack-merge');

const common = require('./webpack.common.js');
const PATHS = require('./paths');

// Merge webpack configuration files
const config = (env, argv) =>
  merge(common, {
    entry: {
      popup: PATHS.src + '/js/popup.js',
      contentScript: PATHS.src + '/js/contentScript.js',
      background: PATHS.src + '/js/background.js',
      devtools: PATHS.src + '/js/devtools.js',
      mainPanel: PATHS.src + '/js/mainPanel.js',
      sidebarPanel: PATHS.src + '/js/sidebarPanel.js'
    },
    devtool: argv.mode === 'production' ? false : 'source-map',
  });

module.exports = config;
