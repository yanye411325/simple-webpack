const Webpack = require('./lib/webpack')
const options = require('./webpack.config')

new Webpack(options).run()