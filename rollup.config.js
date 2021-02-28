import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import sveltePreprocess from 'svelte-preprocess';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

export default [
  {
    input: 'src/index.js',
    output: [
      { file: pkg.module, format: 'es' },
      { file: pkg.browser, format: 'umd', name: 'SvelteRouterSpa' },
      { file: pkg.main, format: 'cjs' },
      { file: pkg.unpkg, format: 'umd', name: 'SvelteRouterSpa', plugins: [terser()] },
    ],
    plugins: [
      svelte({
        extensions: ['.svelte'],
        preprocess: sveltePreprocess(),
      }),
      resolve({
        preferBuiltins: true,
        browser: true,
        dedupe: ['svelte'],
      }),
      commonjs({ requireReturnsDefault: 'auto' }),
    ],
  },
];
