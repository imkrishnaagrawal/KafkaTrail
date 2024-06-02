/* eslint-disable import/no-extraneous-dependencies */
/// <reference types="vite/client" />

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: '@wails-runtime',
        replacement: path.resolve(__dirname, 'wailsjs/runtime'),
      },
      { find: '@wails', replacement: path.resolve(__dirname, 'wailsjs/go') },
      { find: '@', replacement: path.resolve(__dirname, 'src') },
    ],
  },
  build: {
    rollupOptions: {
      // disable hash suffix for output files
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
      },
    },
  },
  server: {
    port: 34115,
    hmr: {
      host: 'localhost',
      port: 34115,
      protocol: 'ws',
    },
  },
});
