import { vitePlugin as remix } from '@remix-run/dev';
import autoprefixer from 'autoprefixer';
import tailwindcss from 'tailwindcss';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { remixDevTools } from 'remix-development-tools';
import path from 'path';

export default defineConfig({
  plugins: [
    remixDevTools(),
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
      },
    }),
    tsconfigPaths(),
  ],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'src'),
    },
  },
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
  server: {
    watch: {
      // Watch for changes in the following directories
      // This is useful if you are using a monorepo setup or have custom paths
      // Uncomment and modify the following lines as per your project's structure
      // ignored: ['!**/node_modules/**', '!**/.git/**'],
    },
    hmr: {
      // Ensure hot module replacement is enabled
      overlay: true,
    },
  },
});
