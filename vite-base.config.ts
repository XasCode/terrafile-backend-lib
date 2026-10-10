/// <reference types="vitest" />

import { builtinModules } from 'node:module';
import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';
import dts from 'unplugin-dts/vite';
import pkg from './package.json' with { type: 'json' };

const dependencyExternals = Object.keys(pkg.dependencies).filter(
  (name) => name !== "@xascode/chalk",
);
const externals = [
  ...builtinModules,
  ...builtinModules.map((module) => `node:${module}`),
  ...dependencyExternals,
];
const isExternal = (id: string): boolean =>
  externals.some((name) => id === name || id.startsWith(`${name}/`));

export default defineConfig({
  build: {
    rolldownOptions: {
      external: isExternal,
    },
    lib: {
      name: 'terrafile-backend-lib',
      fileName: 'terrafile-backend-lib',
      entry: resolve(import.meta.dirname, "src/backend/index.ts"),
    },
  },
  optimizeDeps: {
    exclude: externals as string[],
  },
  plugins: [
    dts(),
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
      include: ["src"],
      exclude: ["src/**/*.d.ts", "src/**/__tests__/**"],
    },
    environment: 'node',
    testTimeout: 20000,
    include: ['**/__tests__/**/*.spec.ts'],
  },
});
