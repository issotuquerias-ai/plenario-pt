// PLENÁRIO PT — script de build (esbuild)
// Uso:  node build.mjs          (build único, minificado)
//       node build.mjs --watch  (recompila ao guardar)
//       node build.mjs --dev    (sem minificação, com sourcemap)
import * as esbuild from 'esbuild';

const watch = process.argv.includes('--watch');
const dev = process.argv.includes('--dev') || watch;

const options = {
  entryPoints: ['src/main.js'],
  bundle: true,
  format: 'iife',
  globalName: 'Plenario',
  outfile: 'dist/plenario.js',
  target: ['chrome100', 'firefox100', 'safari15', 'edge100'],
  minify: !dev,
  sourcemap: dev ? 'inline' : false,
  legalComments: 'none',
  loader: { '.png': 'dataurl', '.jpg': 'dataurl', '.jpeg': 'dataurl', '.svg': 'text', '.json': 'json' },
  logLevel: 'info',
  define: { 'process.env.NODE_ENV': dev ? '"development"' : '"production"' },
};

if (watch) {
  const ctx = await esbuild.context(options);
  await ctx.watch();
  console.log('[PLENÁRIO] a observar alterações…');
} else {
  const r = await esbuild.build({ ...options, metafile: true });
  const out = r.metafile.outputs['dist/plenario.js'];
  console.log(`[PLENÁRIO] build concluído — ${(out.bytes / 1024 / 1024).toFixed(2)} MB`);
}
