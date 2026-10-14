const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    library: { type: 'commonjs2' },
    clean: true
  },
  externals: { siyuan: 'siyuan' },
  optimization: { minimize: true },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'plugin.json', to: 'plugin.json' },
        { from: 'README.md', to: 'README.md' }
      ]
    })
  ]
};
