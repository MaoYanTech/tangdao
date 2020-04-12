import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import { eslint } from 'rollup-plugin-eslint';
import builtins from 'rollup-plugin-node-builtins';
import { uglify } from "rollup-plugin-uglify";
import cleanup from 'rollup-plugin-cleanup';
import clear from 'rollup-plugin-clear';

const isProuction = process.env.NODE_ENV  === 'production' ;

const cleanTarget = isProuction ? ['dist/tangdao.min.js', 'tangdao.min.js.map'] : ['dist/tangdao.js', 'tangdao.js.map'];

export default {
  input: 'src/index.js',
  output: {
    name: 'tangdao',
    file: isProuction ? 'dist/tangdao.min.js' : 'dist/tangdao.js',
    format: 'umd',
    sourcemap: true,
    exports: 'named',
    globals: {
      'react': 'React',
      'react-dom': 'reactDom',
      'react-redux': 'reactRedux',
      'invariant': 'invariant$1',
      'redux': 'redux',
      'history': 'history',
      'connected-react-router': 'connectedReactRouter',
      'redux-saga': 'createSagaMiddleware',
      'react-router-dom': 'reactRouterDom',
      'isomorphic-fetch': 'isomorphicFetch'
    }
  },
  plugins: [
    clear({
      targets: cleanTarget
    }),
    resolve({
      preferBuiltins: true
    }),
    babel({
      babelrc: false,
      presets: [['@babel/preset-env', { modules: false }], '@babel/preset-react'],
      plugins: ['@babel/plugin-proposal-export-default-from', '@babel/plugin-transform-runtime'],
      externalHelpers: true,
      runtimeHelpers: true,
      exclude: 'node_modules/**' // 只编译我们的源代码
    }),
    commonjs(),
    builtins(),
    eslint(),
    cleanup(),
    (isProuction && uglify())
  ],
  external: [
    'connected-react-router',
    'history',
    'invariant',
    'isomorphic-fetch',
    'react',
    'react-dom',
    'react-redux',
    'react-router-dom',
    'redux',
    'redux-saga'
  ],
  watch: {
    include: 'src/**',
    exclude: 'node_modules/**'
  }
}
