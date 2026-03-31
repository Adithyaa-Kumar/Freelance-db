import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ command, mode }) => {
  const isDev = command === 'serve';
  const isProd = mode === 'production';

  return {
    plugins: [react()],
    define: {
      __APP_ENV__: JSON.stringify(mode),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@services': path.resolve(__dirname, './src/services'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@types': path.resolve(__dirname, './src/types'),
        '@layouts': path.resolve(__dirname, './src/layouts'),
        '@utils': path.resolve(__dirname, './src/utils'),
      },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '/api'),
        },
      },
    },
    build: {
      target: 'ES2020',
      minify: 'terser',
      sourcemap: !isProd, // Enable sourcemaps in dev/staging for debugging
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'chart-vendor': ['recharts'],
            'utility-vendor': ['axios', 'zustand'],
          },
        },
      },
    },
    preview: {
      port: 3000,
    },
    // Optimize for Cloudflare Pages
    ssr: false,
  };
})

