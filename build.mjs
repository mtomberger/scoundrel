// Baut dist/scoundrel.html: eine einzelne Datei mit eingebettetem CSS und JS
// (ohne <html>/<head>/<body>-Gerüst, so wie es Claude-Artifacts erwarten).
// Aufruf: node build.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const read = p => readFileSync(join(root, p), 'utf8');
const html = read('index.html');

const section = name => {
  const m = html.match(new RegExp(`<!-- BUILD:${name} -->([\\s\\S]*?)<!-- /BUILD:${name} -->`));
  if (!m) throw new Error(`Abschnitt ${name} fehlt in index.html`);
  return m[1].trim();
};

const head = section('HEAD')
  .replace(/<link rel="icon"[^>]*>\s*/, '')
  .replace(/<link rel="stylesheet" href="(css\/[^"]+)">/g, (_, p) => `<style>\n${read(p)}</style>`);

const scripts = section('SCRIPTS')
  .replace(/<script src="(js\/[^"]+)"><\/script>/g, (_, p) => {
    const js = read(p);
    if (js.includes('</script')) throw new Error(`${p} enthält </script`);
    return `<script>\n${js}</script>`;
  });

const out = `${head}\n\n${section('BODY')}\n\n${scripts}\n`;
mkdirSync(join(root, 'dist'), { recursive: true });
writeFileSync(join(root, 'dist', 'scoundrel.html'), out);
console.log(`dist/scoundrel.html geschrieben (${(out.length / 1024).toFixed(1)} KB)`);
