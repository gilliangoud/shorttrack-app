/* eslint-disable */
export default {
  displayName: 'connector-gcpv-e2e',
  preset: '../..//jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  setupFiles: ['<rootDir>/src/test-setup.ts'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../..//coverage/connector-gcpv-e2e',
};
