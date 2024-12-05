import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import commonjs from '@rollup/plugin-commonjs';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),  commonjs(), // เพิ่ม CommonJS Plugin
  ],
  optimizeDeps: {
    include: ['@popperjs/core'], // บังคับแปลง @popperjs/core
  },
  server: {
    port: 4173,  // หรือพอร์ตที่คุณเลือก
    host: true,   // เปิดให้สามารถเข้าถึงจากภายนอก
  },
})
