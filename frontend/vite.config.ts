import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import importMetaUrlPlugin from "@codingame/esbuild-import-meta-url-plugin";

/**
 * Vite config to build the frontend plugin as an exported module.
 * This will be distributed in the 'static' directory of the plugin.
 */

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/static/plugins/report-editor/dist/",
  build: {
    cssCodeSplit: false,
    manifest: false,
    rollupOptions: {
      preserveEntrySignatures: "exports-only",
      input: ["./src/report-editor.tsx"],
      output: {
        dir: "../report_editor/static/dist",
        entryFileNames: "[name].js",
        assetFileNames: "assets/[name].[ext]",
      },
    },
  },
  worker: {
    format: "es",
  },
  optimizeDeps: {
    esbuildOptions: {
      plugins: [importMetaUrlPlugin],
    },
    include: [
      "@testing-library/react",
      "vscode/localExtensionHost",
      "vscode-textmate",
      "vscode-oniguruma",
    ],
  },
});
