import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    // Carregadas só via import() dinâmico na exportação; pré-otimizar evita
    // a reotimização (e o erro de módulo desatualizado) no primeiro clique.
    include: ["exceljs", "jspdf", "jspdf-autotable"],
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    watch: {
      usePolling: process.env.VITE_USE_POLLING === "true",
      interval: 1000,
    },
  },
});
