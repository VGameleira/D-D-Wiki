import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
  },
  server: {
    port: 5501,
    open: true,
    proxy: {
      '/api': {
        target: 'https://www.dnd5eapi.co/api/2014',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  resolve: {
    alias: {
      '@services': '/src/services',
      '@i18n': '/src/i18n',
      '@utils': '/src/utils',
      '@components': '/src/components',
      '@pages': '/src/pages',
    },
  },
});
