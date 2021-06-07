module.exports = {
  presets: [
    ["@babel/env", {
      targets: { node: 'current' }
    }],
    ["@babel/typescript", {
      isTSX: true,
      allExtensions: true,
    }],
  ],
  plugins: [
    '@babel/plugin-proposal-optional-chaining',
  ]
}
