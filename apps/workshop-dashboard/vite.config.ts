import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'sausage-api-client': path.resolve(__dirname, '../../packages/api-client/src/index.ts'),
      'sausage-shared-types': path.resolve(__dirname, '../../packages/shared-types/src/index.ts')
    }
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    globals: true,
  },
  server: {
    proxy: {
      '/api/sausage-production': {
        target: 'http://127.0.0.1:4014',
        changeOrigin: true
      }
    }
  }
});
