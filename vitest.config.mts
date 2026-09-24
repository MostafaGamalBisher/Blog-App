import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // Next.js resolves `server-only` itself; outside Next.js (in tests)
      // point it at the same empty module Next uses on the server.
      'server-only': fileURLToPath(
        new URL(
          './node_modules/next/dist/compiled/server-only/empty.js',
          import.meta.url
        )
      ),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
