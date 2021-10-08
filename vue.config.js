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
    proxy: {
      '/api': {
        target: 'https://asia-east1-mpwei-logistics-system.cloudfunctions.net',
        pathRewrite: { '^/api': '' }
      }
    }
  },
}
