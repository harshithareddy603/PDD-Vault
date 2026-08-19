import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import reactNativeWeb from "vite-plugin-react-native-web";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  define: {
    __VITE_SUPABASE_URL__: JSON.stringify(process.env.VITE_SUPABASE_URL ?? ''),
    __VITE_SUPABASE_ANON_KEY__: JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY ?? ''),
  },
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [reactNativeWeb(), react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "react-native": "react-native-web",
      "react-native-svg": "react-native-svg/lib/commonjs/ReactNativeSVG.web",
      "@react-native/assets-registry/registry": path.resolve(__dirname, "./src/stubs/assets-registry.js"),
      "@react-native/assets-registry": path.resolve(__dirname, "./src/stubs/assets-registry.js"),
      // Stub out react-native-vector-icons on web — it uses CJS require() for font
      // files that cannot run in the browser. react-native-paper falls back to
      // Material Design CSS icons automatically when this stub is used.
      "react-native-vector-icons": path.resolve(__dirname, "./src/stubs/vector-icons.js"),
      "@expo/vector-icons": path.resolve(__dirname, "./src/stubs/vector-icons.js"),
    },
    extensions: [
      ".web.mjs",
      ".web.js",
      ".web.mts",
      ".web.ts",
      ".web.jsx",
      ".web.tsx",
      ".mjs",
      ".js",
      ".mts",
      ".ts",
      ".jsx",
      ".tsx",
      ".json"
    ],
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
  esbuild: {
    loader: "tsx",
    include: /\.[jt]sx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      resolveExtensions: [
        ".web.mjs",
        ".web.js",
        ".web.mts",
        ".web.ts",
        ".web.jsx",
        ".web.tsx",
        ".mjs",
        ".js",
        ".mts",
        ".ts",
        ".jsx",
        ".tsx",
        ".json"
      ],
      loader: {
        '.js': 'jsx',
      },
    },
  },
}));
