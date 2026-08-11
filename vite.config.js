import { defineConfig } from 'vite';
import { readCompatSource } from './scripts/source-bundle.mjs';

const VIRTUAL_ID = 'virtual:quick-interaction-core';
const RESOLVED_VIRTUAL_ID = `\0${VIRTUAL_ID}`;

export default defineConfig({
    base: './',
    build: {
        outDir: '.vite-dist',
        emptyOutDir: true,
        sourcemap: true,
        minify: false,
        target: 'es2022',
        rollupOptions: {
            input: 'src/main.js',
            output: {
                format: 'iife',
                name: 'QuickInteractionBundle',
                inlineDynamicImports: true,
                entryFileNames: 'assets/main.js',
                chunkFileNames: 'assets/[name].js',
                assetFileNames: 'assets/[name].[ext]',
            },
        },
    },
    plugins: [{
        name: 'quick-interaction-compat-core',
        resolveId(id) {
            return id === VIRTUAL_ID ? RESOLVED_VIRTUAL_ID : null;
        },
        load(id) {
            if (id !== RESOLVED_VIRTUAL_ID) return null;
            const { runtimeSource } = readCompatSource(process.cwd(), { validateLocales: false });
            return `export function startLegacyRuntime(runtimeHost) {\n${runtimeSource}\n}\n`;
        },
    }],
});
