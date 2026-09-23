import { defineConfig } from 'vite';

// Relative base so the build works from itch.io's iframe sub-path.
export default defineConfig({
  base: './',
  build: { outDir: 'dist', assetsInlineLimit: 0 },
});
