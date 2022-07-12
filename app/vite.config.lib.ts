import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
import react from "@vitejs/plugin-react";
import path from "path";
import depsExternal from "rollup-plugin-node-externals";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import WindiCSS from "vite-plugin-windicss";
import { dependencies } from "./package.json";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    depsExternal(),
    react(),
    WindiCSS({
      scan: {
        fileExtensions: ["html", "js", "ts", "jsx", "tsx"],
      },
    }),
    dts({
      insertTypesEntry: true,
    }),
  ],
  define: {
    "process.env": process.env ?? {},
  },
  build: {
    rollupOptions: {
      external: Object.keys(dependencies),
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
    lib: {
      entry: path.resolve(__dirname, "src/lib/index.ts"),
      name: "davatar",
      formats: ["es", "umd"],
      fileName: (format) => `davatar.${format}.js`,
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      plugins: [NodeGlobalsPolyfillPlugin({ buffer: true })],
    },
  },
});
