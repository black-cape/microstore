import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: false,
  bundle: true,
  external: ['react', 'react-dom'],
  esbuildOptions: (options) => {
    options.jsx = 'automatic';
  },
  treeshake: true,
  minify: true,
  target: 'es2020',
  outDir: 'dist'
});
