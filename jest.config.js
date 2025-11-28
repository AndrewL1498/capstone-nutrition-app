/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.css$': '<rootDir>/jest-css-transform.js'
  },
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest', // <- this tells Jest to use ts-jest for .ts, .tsx, .js, .jsx
  },
};
