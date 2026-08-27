import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Ensures relative assets work on GitHub Pages, Cloudflare Pages, etc.
  server: {
    port: 3000,
    host: true,
  },
});
