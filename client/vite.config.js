import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import monacoEditorPlugin from "vite-plugin-monaco-editor";
import legacy from "@vitejs/plugin-legacy";

export default defineConfig({
  server: {
    port: 3001,
  },
  plugins: [
    react(),
    monacoEditorPlugin({
      languageWorkers: ["json", "editorWorkerService"],
      customWorkers: [
        {
          label: "graphql",
          entry: "monaco-graphql/dist/graphql.worker",
        },
      ],
    }),
    legacy({
      targets: ["defaults", "not IE 11"],
    }),
  ],
});
