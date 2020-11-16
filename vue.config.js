module.exports = {
  "transpileDependencies": [
    "vuetify"
  ],
  publicPath: process.env.NODE_ENV === 'production' ? '/www/dotmodus_assesment/dist/' : '/',
  configureWebpack: {
    resolve: {
      extensions: ['.js', '.vue', '.json', '.scss', '.css']
    }
  },
  devServer:{
    proxy:{
      '/newsApi': {
        logLevel: 'debug',
        target: 'http://newsapi.org',
        pathRewrite: function(path) {
          let replacedPath = path;
          if (path.indexOf("/newsApi") === -1) {
            replacedPath = replacedPath.replace("/newsApi", "");
          }
          return replacedPath;
        },
      },
    }
  }
}