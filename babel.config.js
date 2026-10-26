module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Drizzle 마이그레이션(.sql)을 번들에 문자열로 포함
    plugins: [['inline-import', { extensions: ['.sql'] }]],
  };
};
