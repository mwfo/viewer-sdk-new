import VuePlugin from 'rollup-plugin-vue';
import scssPlugin from 'rollup-plugin-scss';
import url from '@rollup/plugin-url';
import { terser } from 'rollup-plugin-terser';
import commonjs from 'rollup-plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import json from "@rollup/plugin-json"; //Added by Malte

const isProduction = (process.env.BUILD === 'production');

const plugins = [
  VuePlugin(),
  scssPlugin(),
  commonjs(),
  nodeResolve({ jsnext: true, preferBuiltins: true, browser: true }),
  json(), //Added by Malte
  url({
    limit: 100 * 1024 *1024,
    include: ['assets/*']
  }),
];

if (isProduction) {
  plugins.push(terser());
}

export default {
  input: 'src/filterviews.plugin.js',
  output: {
    file: 'dist/filterviews.plugin.js',
    format: 'esm',
    sourcemap: !isProduction,
  },
  plugins
};
