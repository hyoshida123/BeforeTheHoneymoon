const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Web用の設定を追加
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Web用のアセット設定
config.resolver.assetExts.push('ttf', 'otf', 'woff', 'woff2');

module.exports = config;