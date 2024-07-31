module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  maxWorkers: 1,

  transform: {
    '^.+\\.(ts|tsx|js)$': 'ts-jest'
  },
  testPathIgnorePatterns: ['/node_modules/', '/iteration_2_tests/', '/iteration_1_tests/'],
};
