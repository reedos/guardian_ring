import { defineConfig } from 'vitest/config';
export default defineConfig({
  base: './', cacheDir: '.vite',
  build: { target: 'es2022', chunkSizeWarningLimit: 1500, rollupOptions: { input: { main: 'index.html', visualizer: 'visualizer.html', evidence: 'evidence.html', method: 'method.html', glossary: 'glossary.html', parts: 'parts.html' } } },
  server: { host: '127.0.0.1', port: 47600, strictPort: true, watch: { ignored: ['**/shots/**', '**/research/**', '**/dist/**'] } },
  preview: { host: '127.0.0.1', port: 47601, strictPort: true, allowedHosts: ['reeds-pc.tailf68402.ts.net'] },
  test: { include: ['src/**/*.test.ts'], testTimeout: 30000 },
});
