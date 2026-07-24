import { Agent } from "node:http";
import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig(function (_a) {
    var mode = _a.mode;
    var viteEnv = loadEnv(mode, process.cwd(), "");
    var apiProxyTarget = viteEnv.VITE_API_PROXY_TARGET || "http://localhost:8081";
    return {
        plugins: [react(), tailwindcss()],
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "src"),
            },
        },
        server: {
            proxy: {
                "/api": {
                    target: apiProxyTarget,
                    changeOrigin: true,
                    secure: false,
                    agent: new Agent({ keepAlive: true }),
                },
            },
        },
    };
});
