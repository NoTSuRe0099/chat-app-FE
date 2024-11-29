import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 7274,
  },
  base: '/', // Ensure this is set correctly for your deployment
  build: {
    outDir: 'dist', // Ensure this matches your output directory
  },
});
