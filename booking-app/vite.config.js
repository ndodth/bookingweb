import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  optimizeDeps: {
    include: ['@popperjs/core'], // ตัวเลือก: โดยปกติ Vite จะจัดการให้เอง
  },
  server: {
    port: 4173,  // พอร์ตสำหรับ dev server
    host: true,  // เปิดให้สามารถเข้าถึงจากเครือข่ายภายนอกได้
  },
});
