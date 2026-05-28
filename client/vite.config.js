import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Exposes Vite on the local network (0.0.0.0)
    port: 5170, // Request port 5170
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Changed to 5000 to match the actual EgyField backend server port
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
