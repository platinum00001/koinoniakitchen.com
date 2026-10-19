// Run: node tests/paths.test.js  (from the repo root)
// Served from a sub-path (/<repo>/) until DNS is live: no root-absolute links; every local link exists;
// config.js has no secret key; share tags, favicon, privacy #data-deletion, honeypot and consent exist.
const fs = require('fs'), path = require('path'), assert = require('assert');
const root = path.join(__dirname, '..');
const html = fs.readdirSync(root).filter(f => f.endsWith('.html'));
let links = 0;
for (const f of [...html, 'css/style.css', 'js/form.js', 'config.js', 'site.webmanifest']) {
  const s = fs.readFileSync(path.join(root, f), 'utf8');
  const bad = s.match(/(?:href|src|action)=["']\/(?!\/)[^"']*/g) || [];
  assert.deepStrictEqual(bad, [], f + ' has root-absolute paths: ' + bad.join(', '));
  assert.ok(!/url\(\s*["']?\/(?!\/)/.test(s), f + ' root-absolute CSS url()');
  if (f.endsWith('.html')) {
    for (const m of s.matchAll(/(?:href|src)="([^"#?:]+)(?:[?#][^"]*)?"/g)) {
      if (/^(mailto|tel|https?|data)/.test(m[1])) continue;
      const p = m[1].endsWith('/') ? m[1] + 'index.html' : m[1];
      assert.ok(fs.existsSync(path.join(root, p)), f + ' links to missing file ' + m[1]); links++;
    }
    assert.ok(/<title>[^<]{8,}<\/title>/.test(s) && /name="description" content="[^"]{10,}"/.test(s), f + ' title/description');
    assert.ok(/og:image" content="https:\/\/[^"]+\/og\.png"/.test(s) && /summary_large_image/.test(s), f + ' share tags');
    assert.ok(/privacy\.html/.test(s), f + ' privacy link');
  }
}
const cfg = fs.readFileSync(path.join(root, 'config.js'), 'utf8');
assert.ok(!/service_role|sb_secret_|eyJhbGciOi/.test(cfg), 'secret key in config.js');
const idx = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
for (const n of ['name', 'email', 'interest', 'note', 'website_url', 'consent']) assert.ok(new RegExp('name="' + n + '"').test(idx), 'form field ' + n);
assert.ok(/Our Sites/.test(idx), 'Our Sites footer');
assert.ok(/id="data-deletion"/.test(fs.readFileSync(path.join(root, 'privacy.html'), 'utf8')), 'privacy #data-deletion');
for (const f of ['og.png', 'favicon.svg', 'favicon-32.png', 'apple-touch-icon.png', 'robots.txt', 'sitemap.xml', '.nojekyll'])
  assert.ok(fs.existsSync(path.join(root, f)), 'missing ' + f);
assert.ok(!fs.existsSync(path.join(root, 'CNAME')), 'no CNAME until DNS points to GitHub Pages');
console.log('paths ok:', html.length, 'pages,', links, 'local links');
