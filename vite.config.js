// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer"; // Импорт плагина

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      // Добавляем визуализатор
      open: true, // Автоматически открыть отчёт после сборки
      filename: "stats.html", // Имя файла с отчётом
    }),
  ],
});
