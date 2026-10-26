const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Drizzle 마이그레이션 파일
config.resolver.sourceExts.push('sql');

module.exports = config;
