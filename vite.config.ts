import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite-base.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      exclude: [`__tests__/backend.unmocked.spec.ts`],
    },
  }),
);
