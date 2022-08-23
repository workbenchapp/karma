import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import WindiCSS from "vite-plugin-windicss";
import { dependencies, devDependencies } from "./package.json";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: "classic",
    }),
    WindiCSS({
      scan: {
        fileExtensions: ["html", "js", "ts", "jsx", "tsx"],
      },
    }),
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    target: "esnext",
    rollupOptions: {
      external: [
        ...Object.keys(dependencies),
        ...Object.keys(devDependencies),
        "@solana/spl-token",
      ],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
    lib: {
      entry: path.resolve(__dirname, "src/lib/index.ts"),
      name: "dprofile",
      formats: ["es", "umd"],
      fileName: (format) => `dprofile.${format}.js`,
    },
  },
  optimizeDeps: {
    exclude: ["@solana/spl-token", "@solana/web3.js"],
    esbuildOptions: {
      target: "esnext",
      plugins: [NodeGlobalsPolyfillPlugin({ buffer: true })],
    },
  },
});
