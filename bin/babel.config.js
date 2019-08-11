module.exports = {
  presets: [
    ["@babel/env", {
      targets: { node: 'current' }
    }],
  ],
  plugins: [
    '@babel/plugin-transform-runtime',
  ]
}
