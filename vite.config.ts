import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    cssCodeSplit: false,
    rollupOptions: {
      input: path.resolve("src/widget/index.tsx"),
      output: { entryFileNames: "widget.js", assetFileNames: "widget.[ext]", inlineDynamicImports: true }
    }
  }
});
