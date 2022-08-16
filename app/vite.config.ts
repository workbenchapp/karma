import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
import react from "@vitejs/plugin-react";
import nodePolyfills from "rollup-plugin-node-polyfills";
import Icons from "unplugin-icons/vite";
import { defineConfig } from "vite";
import { VitePluginFonts } from "vite-plugin-fonts";
import InlineCssModules from "vite-plugin-inline-css-modules";
import WindiCSS from "vite-plugin-windicss";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    WindiCSS({
      scan: {
        fileExtensions: ["html", "js", "ts", "jsx", "tsx"],
      },
    }),
    Icons({ compiler: "jsx", jsx: "react", defaultStyle: "display: block" }),
    VitePluginFonts({
      google: {
        families: ["Roboto"],
      },
    }),
    InlineCssModules(),
  ],
  define: {
    "process.env": process.env ?? {},
  },
  build: {
    target: ["es2020"],
    rollupOptions: {
      plugins: [nodePolyfills({ crypto: true })],
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      target: "es2020",
      plugins: [NodeGlobalsPolyfillPlugin({ buffer: true })],
    },
  },
  resolve: {
    alias: {
      stream: "rollup-plugin-node-polyfills/polyfills/stream",
      events: "rollup-plugin-node-polyfills/polyfills/events",
      assert: "assert",
      crypto: "crypto-browserify",
      util: "util",
    },
  },
});
