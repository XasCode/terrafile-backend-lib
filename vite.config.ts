import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite-base.config.ts';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      exclude: [`__tests__/backend.unmocked.spec.ts`],
    },
  }),
);
