import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5170,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/') || id.includes('node_modules/react-router')) return 'vendor-react';
          if (id.includes('node_modules/@tanstack/react-query')) return 'vendor-query';
          if (id.includes('node_modules/lucide-react') || id.includes('node_modules/react-icons')) return 'vendor-ui';
          if (id.includes('node_modules/recharts')) return 'vendor-charts';
          if (id.includes('node_modules/axios') || id.includes('node_modules/date-fns') || id.includes('node_modules/react-hot-toast') || id.includes('node_modules/react-helmet-async')) return 'vendor-utils';
          if (id.includes('node_modules/swiper')) return 'vendor-swiper';
        },
      },
    },
    sourcemap: false,
  },
});
