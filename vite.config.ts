import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Le serveur Socket.IO (server/index.js) tourne sur le port 3001.
// En dev, Vite lui proxifie /socket.io et /api -> ainsi le client peut toujours
// se connecter en "same origin", y compris derriere un proxy https (preview).
const API_TARGET = process.env.API_TARGET || 'http://127.0.0.1:3001';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: false,
    // Autorise les hotes de preview (proxy e2b, ngrok, etc.)
    allowedHosts: true,
    proxy: {
      '/socket.io': { target: API_TARGET, ws: true, changeOrigin: true },
      '/api': { target: API_TARGET, changeOrigin: true }
    }
  },
  preview: {
    host: true,
    port: 4173,
    allowedHosts: true,
    proxy: {
      '/socket.io': { target: API_TARGET, ws: true, changeOrigin: true },
      '/api': { target: API_TARGET, changeOrigin: true }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1200
  }
});
