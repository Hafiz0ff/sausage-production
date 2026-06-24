import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      'sausage-shared-types': path.resolve(__dirname, '../shared-types/src/index.ts')
    }
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.test.ts']
  },
});
