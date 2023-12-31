/// <reference types="vitest" />

import { resolve } from 'path';
import { defineConfig } from 'vite';
import lodash from 'lodash';
import dts from 'vite-plugin-dts';
import builtinModules from 'builtin-modules';
import pkg from './package.json';
import commonjsExternals from 'vite-plugin-commonjs-externals';

const { escapeRegExp } = lodash;

const externals = [
  ...builtinModules,
  ...Object.keys(pkg.dependencies).map((name) => new RegExp('^' + escapeRegExp(name) + '(\\/.+)?$')),
];

export default defineConfig({
  build: {
    lib: {
      name: 'terrafile-backend-lib',
      fileName: 'terrafile-backend-lib',
      entry: resolve(__dirname, 'src/backend/index.ts'),
    },
  },
  optimizeDeps: {
    exclude: externals as string[],
  },
  plugins: [
    dts(),
    commonjsExternals({
      externals,
    }),
  ],
  test: {
    setupFiles: './__tests__/testUtils/testSetupFile.ts',
    mockReset: true,
    coverage: {
      provider: 'istanbul',
      reporter: [`text`, `json`, `html`, `lcov`],
    },
    environment: 'node',
    testTimeout: 20000,
    include: ['**/__tests__/**/*.spec.ts'],
  },
});
