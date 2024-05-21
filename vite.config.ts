import config from './src/config.json';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
    build: {
        lib: {
            entry: resolve('src/index.ts'),
            name: 'DataPosRxDBConnector',
            formats: ['es'],
            fileName: (format: string) => `${config.id}-${format}.js`
        },
        rollupOptions: {
            external: ['csv-parse']
        },
        target: 'ESNext'
    },
    plugins: [dts({ outDir: 'dist/types' })]
});
