// FORMA CORRETA (usando module.exports)
module.exports = function(api) {
  api.cache(true); // Habilita o cache da configuração do Babel
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Este plugin DEVE ser o último da lista de plugins
      'react-native-reanimated/plugin',
    ],
  };
};