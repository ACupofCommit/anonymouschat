const path = require('path')
const webpack = require('webpack')

// https://stackoverflow.com/questions/44146913/webpack-for-backend-the-request-of-a-dependency-is-an-expression?noredirect=1&lq=1
function IgnoreUnresolvedPlugin() { }

IgnoreUnresolvedPlugin.prototype.apply = function (compiler) {
  compiler.plugin("compilation", function (compilation, data) {
    data.normalModuleFactory.plugin("parser", function (parser) {
      parser.plugin('call require', function (params) {
        if (params.arguments.length !== 1) return

        const param = this.evaluateExpression(params.arguments[0])
        if (!param.isString() && !param.isConditional()) return true
      })
    })
  })
}


const config = {
  mode: 'production',
  optimization: {
    minimize: false,
  },
  entry: [
    './bin/server.ts',
  ],
  devtool: 'source-map',
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
  },
  output: {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js',
  },

  target: 'node',

  externals: [],

  module: {
    rules: [
      {

        test: /node_modules\/amphtml-validator\/index\.js$/,
        use: [
          {
            loader: 'shebang-loader',
          },
        ]
      },
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      {
        test: /\.(tsx?)|(jsx?)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              ...require('./bin/babel.config.prod.js'),
            }
          },
        ]
      },
    ],
  },

  plugins: [
    new IgnoreUnresolvedPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    // new webpack.ContextReplacementPlugin( /.*/, process.cwd(), {
    // './next.conifg.js': path.join(process.cwd(), '/next.config.js'),
    // })
  ]
}

module.exports = config
