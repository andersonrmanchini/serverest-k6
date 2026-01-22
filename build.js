#!/usr/bin/env node
const esbuild = require('esbuild');
const path = require('path');

esbuild.build({
  entryPoints: [
    path.resolve(__dirname, 'src/tests/index.ts'),
    path.resolve(__dirname, 'src/tests/users.spec.ts'),
    path.resolve(__dirname, 'src/tests/products.spec.ts'),
    path.resolve(__dirname, 'src/services/api.service.ts'),
    path.resolve(__dirname, 'src/utils/checks.ts'),
    path.resolve(__dirname, 'src/utils/constants.ts'),
    path.resolve(__dirname, 'src/utils/data.factory.ts'),
    path.resolve(__dirname, 'src/utils/thresholds.ts'),
  ],
  outdir: path.resolve(__dirname, 'dist'),
  format: 'cjs',
  platform: 'node',
  target: 'es2020',
  loader: {
    '.ts': 'ts',
  },
  bundle: true,
  sourcemap: false,
  minify: false,
  splitting: false,
  plugins: [
    {
      name: 'external-modules',
      setup(build) {
        build.onResolve({ filter: /^(k6|https:\/\/jslib\.k6\.io)/ }, args => {
          return { path: args.path, external: true };
        });
      },
    },
  ],
}).then(() => {
  console.log('✓ Arquivos compilados com sucesso para dist/');
}).catch((err) => {
  console.error('Erro na compilação:', err);
  process.exit(1);
});
