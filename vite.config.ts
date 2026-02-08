import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  console.log('[ViteConfig] Mode:', mode);
  console.log('[ViteConfig] CWD:', process.cwd());
  console.log('[ViteConfig] Env keys loaded:', Object.keys(env).filter(k => k.startsWith('VITE_')));

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // Explicitly define env variables to ensure they're available to the client
    // We map each VITE_ variable individually to ensure maximum compatibility
    define: Object.keys(env).reduce<Record<string, any>>((prev, key) => {
      if (key.startsWith('VITE_')) {
        prev[`process.env.${key}`] = JSON.stringify(env[key]);
        prev[`import.meta.env.${key}`] = JSON.stringify(env[key]);
      }
      return prev;
    }, {
      'process.env': {}
    })

  };
});


