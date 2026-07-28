import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import AutoImport from "unplugin-auto-import/vite";

/**
 * Vite plugin that serves Vercel-style API handlers during local dev.
 * Maps  POST /api/stripe/<name>  →  api/stripe/<name>.ts  default export.
 */
function vercelApiPlugin(): Plugin {
  return {
    name: "vercel-api-dev",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api/") || req.method !== "POST") return next();

        // Resolve handler file  e.g. /api/stripe/create-checkout-session → api/stripe/create-checkout-session.ts
        const handlerPath = resolve(
          __dirname,
          req.url.replace(/^\//, "") + ".ts"
        );

        try {
          // Use Vite's ssrLoadModule so TS is transpiled on the fly
          const mod = await server.ssrLoadModule(
            pathToFileURL(handlerPath).href
          );
          const handler = mod.default;
          if (typeof handler !== "function") {
            return next();
          }

          // Collect request body
          const chunks: Buffer[] = [];
          for await (const chunk of req) chunks.push(chunk as Buffer);
          const rawBody = Buffer.concat(chunks).toString("utf-8");
          const body = rawBody ? JSON.parse(rawBody) : {};

          // Build a minimal VercelRequest-like object
          const fakeReq = Object.assign(req, { body });

          // Build a minimal VercelResponse-like object
          const fakeRes = {
            _statusCode: 200,
            status(code: number) {
              this._statusCode = code;
              return this;
            },
            json(data: unknown) {
              res.writeHead(this._statusCode, {
                "Content-Type": "application/json",
              });
              res.end(JSON.stringify(data));
            },
            end() {
              res.writeHead(this._statusCode);
              res.end();
            },
          };

          await handler(fakeReq, fakeRes);
        } catch (err) {
          console.error(`[vercel-api-dev] Error in ${req.url}:`, err);
          if (!res.headersSent) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({
                error: err instanceof Error ? err.message : "Internal error",
              })
            );
          }
        }
      });
    },
  };
}

const base = process.env.BASE_PATH || "/";
const isPreview = process.env.IS_PREVIEW ? true : false;
// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  define: {
    __BASE_PATH__: JSON.stringify(base),
    __IS_PREVIEW__: JSON.stringify(isPreview),
    __READDY_PROJECT_ID__: JSON.stringify(process.env.PROJECT_ID || ""),
    __READDY_VERSION_ID__: JSON.stringify(process.env.VERSION_ID || ""),
    __READDY_AI_DOMAIN__: JSON.stringify(process.env.READDY_AI_DOMAIN || ""),
  },
  plugins: [
    vercelApiPlugin(),
    react(),
    AutoImport({
      imports: [
        {
          react: [
            "React",
            "useState",
            "useEffect",
            "useContext",
            "useReducer",
            "useCallback",
            "useMemo",
            "useRef",
            "useImperativeHandle",
            "useLayoutEffect",
            "useDebugValue",
            "useDeferredValue",
            "useId",
            "useInsertionEffect",
            "useSyncExternalStore",
            "useTransition",
            "startTransition",
            "lazy",
            "memo",
            "forwardRef",
            "createContext",
            "createElement",
            "cloneElement",
            "isValidElement",
          ],
        },
        {
          "react-router-dom": [
            "useNavigate",
            "useLocation",
            "useParams",
            "useSearchParams",
            "Link",
            "NavLink",
            "Navigate",
            "Outlet",
          ],
        },
        // React i18n
        {
          "react-i18next": ["useTranslation", "Trans"],
        },
      ],
      dts: true,
    }),
  ],
  base,
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
  build: {
    sourcemap: false,
    outDir: "dist",
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          i18n: ["i18next", "react-i18next", "i18next-browser-languagedetector"],
          charts: ["recharts"],
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    host: "0.0.0.0",
    proxy: {
      '/ai-agent': {
        target: process.env.VITE_AI_AGENT_URL || 'http://100.48.61.171',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ai-agent/, ''),
      },
    },
  },
}));
