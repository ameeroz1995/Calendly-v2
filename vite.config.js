/**
 * Vite build config for Calendly v2.
 *
 * Entry: index.html
 * Output: assets/dist/ (bundle.js + index.html)
 *
 * Firebase SDKs + morphdom are loaded via CDN script tags in index.html
 * and accessed via window._firebase / window.morphdom — no import needed.
 * Vite bundles only our application code from assets/src/.
 */

import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig(({ mode }) => ({
  root: '.',
  publicDir: false,
  build: {
    outDir: 'assets/dist',
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'index.html'),
      external: [
        // Firebase SDKs loaded via CDN in index.html — accessed via window._firebase
        /^https:\/\/www\.gstatic\.com\/firebasejs\/.*/,
      ],
      output: {
        entryFileNames: 'bundle.js',
        chunkFileNames: 'chunk-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
        format: 'es',
        sourcemap: mode === 'development',
        globals: {
          morphdom: 'morphdom',
        },
      },
    },
    target: 'es2020',
    minify: 'esbuild',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'assets/src'),
    },
  },
  server: {
    port: 3000,
    open: false,
  },
}))
