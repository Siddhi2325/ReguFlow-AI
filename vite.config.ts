import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Custom middleware to run api/demo-request.ts during npm run dev
const apiMiddleware = (mode: string) => ({
  name: "api-middleware",
  configureServer(server) {
    // Load .env variables into process.env
    const env = loadEnv(mode, process.cwd(), "");
    Object.assign(process.env, env);

    server.middlewares.use(async (req, res, next) => {
      if (req.url === "/api/demo-request" && req.method === "POST") {
        try {
          let bodyStr = "";
          for await (const chunk of req) {
            bodyStr += chunk;
          }
          const body = JSON.parse(bodyStr || "{}");

          // Dynamically load the serverless handler
          const handlerModule = await server.ssrLoadModule("./api/demo-request.ts");
          const handler = handlerModule.default;

          // Mock VercelRequest and VercelResponse
          const vercelReq = {
            method: "POST",
            body,
          };
          const vercelRes = {
            status(code: number) {
              res.statusCode = code;
              return this;
            },
            json(data: any) {
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify(data));
              return this;
            }
          };

          await handler(vercelReq as any, vercelRes as any);
        } catch (err: any) {
          console.error("Local API middleware error:", err);
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: err.message || "Local handler error" }));
        }
        return;
      }
      next();
    });
  }
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  envPrefix: ["VITE_", "NEXT_PUBLIC_"],
  server: {
    host: "::",
    port: 3000,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), apiMiddleware(mode)].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));
