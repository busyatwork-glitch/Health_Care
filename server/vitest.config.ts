import { defineConfig } from 'vitest/config';
export default defineConfig({ cacheDir: './node_modules/.vite', test: { exclude: ['**/node_modules/**', '**/dist/**'], maxWorkers: 1, fileParallelism: false } });
