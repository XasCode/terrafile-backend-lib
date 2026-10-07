/// <reference types="vitest" />

import { resolve } from 'path';
import { defineConfig } from 'vite';
import lodash from 'lodash';
import dts from 'vite-plugin-dts';
import builtinModules from 'builtin-modules';
import pkg from './package.json';
import commonjsExternals from 'vite-plugin-commonjs-externals';

const { escapeRegExp } = lodash;

const dependencyExternals = Object.keys(pkg.dependencies).map(
  (name) => new RegExp('^' + escapeRegExp(name) + '(\\/.+)?$'),
);
const externals = [
  ...builtinModules,
  ...builtinModules.map((module) => `node:${module}`),
  ...dependencyExternals,
];

export default defineConfig({
  build: {
    rollupOptions: {
      external: externals,
    },
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
      externals: dependencyExternals,
    }),
    {
      name: 'esm-external-require',
      renderChunk(code, _chunk, outputOptions) {
        if (outputOptions.format !== 'es') {
          return null;
        }
        return `import { createRequire as __createRequire } from 'node:module';\nconst require = __createRequire(import.meta.url);\n${code}`;
      },
    },
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
