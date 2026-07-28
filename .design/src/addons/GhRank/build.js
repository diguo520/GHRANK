// Build Tiptap into a single IIFE bundle for browser use
const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/index.js'],
  bundle: true,
  outfile: 'dist/tiptap-editor.min.js',
  format: 'iife',
  minify: true,
  sourcemap: false,
  // No globalName — src/index.js manually assigns to window.TiptapEditor
}).then(() => {
  console.log('Tiptap bundle built successfully: dist/tiptap-editor.min.js');
}).catch(() => process.exit(1));
