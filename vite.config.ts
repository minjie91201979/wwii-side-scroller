import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 部署到 GitHub Pages：base 必须与仓库名一致
// 最终访问地址：https://minjie91201979.github.io/wwii-side-scroller/
export default defineConfig({
  plugins: [react()],
  base: '/wwii-side-scroller/',
  server: {
    port: 5173,
    open: true,
  },
});
