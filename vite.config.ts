import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { swcReactRefresh } from 'vite-plugin-swc-react-refresh';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), swcReactRefresh()],
  server: {
    host: true,
    port: 7274,
  },
});
