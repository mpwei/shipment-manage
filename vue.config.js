module.exports = {
  pluginOptions: {
    quasar: {
      importStrategy: 'kebab',
      rtlSupport: false
    }
  },
  transpileDependencies: [
    'quasar'
  ],
  devServer: {
    before: require('./server/entrance'),
    proxy: {
      '/function': {
        target: 'https://asia-east1-mpwei-logistics-system.cloudfunctions.net',
        pathRewrite: { '^/function': '' }
      }
    }
  },
}
