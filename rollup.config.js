import babel from '@rollup/plugin-babel'
import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs';
import pkg from './package.json';

const extensions = ['.ts']

export default {
	input: 'src/index.ts',
	external: ['passport-oauth2', /node_modules/],
	output: [
		{
			file: pkg.main,
			format: 'cjs',
			exports: 'default',
		},
		{
			file: pkg.module,
			format: 'es',
		},
	],
	plugins: [
		nodeResolve({
			extensions,
		}),
		commonjs(),
		babel({
			extensions,
			babelHelpers: 'bundled',
		}),
	],
}
