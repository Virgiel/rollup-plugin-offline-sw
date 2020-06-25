import autoExternal from 'rollup-plugin-auto-external';
import pkg from './package.json';

export default {
  input: 'src/index.js',
  output: [
    {
      file: pkg.main,
      format: 'commonjs',
    },
    {
      file: pkg.module,
      format: 'module',
    },
  ],
  plugins: [autoExternal()],
};
