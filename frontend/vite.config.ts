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
});
