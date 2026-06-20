const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const exclusionList = require('metro-config/src/defaults/exclusionList');
const path = require('path');

/**
 * The example app consumes the parent `react-native-idmission-sdk` package via a
 * `file:..` dependency. On install npm creates a junction at
 * `example/node_modules/react-native-idmission-sdk` -> the repo root, and the repo
 * root contains this `example/` folder — so a naive file crawl recurses forever
 * (example -> node_modules -> root -> example -> ...).
 *
 * To break the cycle we:
 *   1. watch the package root so Metro can read the package source (src/index.js),
 *   2. resolve `react-native-idmission-sdk` directly to the root (not via the junction),
 *   3. blockList the junction path so Metro never descends back into example,
 *   4. always resolve react / react-native from the example's own copies.
 *
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const root = path.resolve(__dirname, '..');

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const junction = path.join(__dirname, 'node_modules', 'react-native-idmission-sdk');

const config = {
  watchFolders: [root],
  resolver: {
    blockList: exclusionList([new RegExp(`^${escape(junction)}(/|\\\\).*$`)]),
    extraNodeModules: {
      'react-native-idmission-sdk': root,
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-native': path.resolve(__dirname, 'node_modules/react-native'),
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
