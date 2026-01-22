const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/tests/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    libraryTarget: 'umd',
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      // Criar alias para módulos k6
      'k6': false,
      'k6/http': false,
      'k6/options': false,
      'k6/metrics': false,
      'k6/execution': false,
    }
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: 'tsconfig.json'
          }
        },
        exclude: /node_modules/,
      },
    ],
  },
  target: 'web',
  externals: {
    k6: 'k6',
    'k6/http': 'k6/http',
    'k6/options': 'k6/options',
    'k6/metrics': 'k6/metrics',
    'k6/execution': 'k6/execution',
    'k6/experimental/fs': 'k6/experimental/fs',
  },
  optimization: {
    minimize: true,
  }
};
