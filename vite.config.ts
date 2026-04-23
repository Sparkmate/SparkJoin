import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const config = defineConfig({
  server: {
    allowedHosts: [
      "b949-2a02-8388-1847-5980-5068-bfda-e1b0-d28c.ngrok-free.app",
    ],
  },
  plugins: [
    devtools(),
    nitro({
      vercel: {
        functions: {
          runtime: "bun1.x",
        },
      },
    }),
    tsconfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
});

export default config;
