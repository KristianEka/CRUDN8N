import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // ensure assets load correctly when served from a sub-path or file system
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
