import svelte from 'rollup-plugin-svelte'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import pkg from './package.json'
import json from "@rollup/plugin-json";
import babel from 'rollup-plugin-babel';

export default [
  {
    input: 'src/index.js',
    output: [{ file: pkg.module, format: 'es' }, { file: pkg.main, format: 'umd', name: 'SvelteRouterSpa' }],
    plugins: [
        resolve(),
        svelte(),
        commonjs(),
    ]
  },

  // // tests
  // {
  //   input: 'test/index.js',
  //   plugins: [resolve(), commonjs(), svelte(), json()]
  // }
]
