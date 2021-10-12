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
  pages: {
    index: {
      entry: 'src/main.js',
      template: 'public/index.html',
      filename: 'index.html',
      title: 'Shipment Management System',
    }
  },
  pwa: {
    name: 'Shipment Management',
    themeColor: '#0d47a1',
    msTileColor: '#ffffff',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: '#C10015'
  },
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
