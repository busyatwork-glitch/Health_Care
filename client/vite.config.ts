import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({ plugins: [react(), tailwindcss()], resolve: { preserveSymlinks: true }, server: { port: 5173 }, test: { setupFiles: './src/test-setup.ts', environment: 'jsdom', maxWorkers: 1 } });
