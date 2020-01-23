module.exports = api => {
  const isTest = api.env('test')
  return isTest ? {
    presets: [
      ["@babel/env",{
        targets: { node: 'current' }
      }],
      ["@babel/typescript", {
        isTSX: true,
        allExtensions: true,
      }],
    ],
    plugins: [
      'babel-plugin-rewire-ts',
      '@babel/plugin-transform-runtime',
      '@babel/plugin-proposal-optional-chaining',
    ]
  } : {
    presets: ['next/babel'],
    plugins: [
      '@babel/plugin-proposal-optional-chaining',
    ],

  }
}
