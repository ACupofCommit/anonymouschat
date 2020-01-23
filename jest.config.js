module.exports = {
  coverageDirectory: "coverage",
  coveragePathIgnorePatterns: [ "/node_modules/" ],
  collectCoverageFrom: [ 'src/**/*.ts', 'src/**/*.tsx' ],

  // preset: 'ts-jest',

  testPathIgnorePatterns: ['/node_modules/', '/lib/'],
  testRegex: '(/test/.*|\\.(test|spec))\\.(ts|tsx|js)$',

  // moduleFileExtensions: ['js', 'json', 'jsx', 'ts', 'tsx', 'node'],
  // Setup Enzyme
  // snapshotSerializers: ["enzyme-to-json/serializer"],
  // setupFilesAfterEnv: ["<rootDir>/setupEnzyme.js"],
  // moduleNameMapper: {
  // "^@\\/static-s3-sync\\/.*$": "<rootDir>/asset/fileMock.js",
  // "^@\\/static\\/(.*)$": "<rootDir>/asset/fileMock.js",
  // },

  testEnvironment: 'node',
}
