import type { Config } from 'jest';

const shared: Partial<Config> = {
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
      },
    ],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};

const config: Config = {
  projects: [
    {
      displayName: 'client',
      testEnvironment: 'jsdom',
      testMatch: [
        '<rootDir>/src/features/**/*.test.ts?(x)',
        '<rootDir>/src/components/**/*.test.ts?(x)',
      ],
      ...shared,
    },
    {
      displayName: 'server',
      testEnvironment: 'node',
      testMatch: [
        '<rootDir>/src/server/**/*.test.ts?(x)',
        '<rootDir>/src/app/api/**/*.test.ts?(x)',
        '<rootDir>/src/lib/**/*.test.ts?(x)',
      ],
      ...shared,
    },
  ],
};

export default config;
