// scripts/generate-sitemap-index.mjs
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const BASE_URL = (process.argv[2] ?? 'https://ton-domaine.com').replace(/\/$/, '');
const DIST = 'dist/apollo-ng';

// L’index pointe vers TON sitemap existant (sitemap.xml)
const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  `  <sitemap>\n` +
  `    <loc>${BASE_URL}/sitemap.xml</loc>\n` +
  `    <lastmod>${new Date().toISOString()}</lastmod>\n` +
  `  </sitemap>\n` +
  `</sitemapindex>\n`;

writeFileSync(resolve(DIST, 'sitemap_index.xml'), xml, 'utf8');
console.log('sitemap_index.xml créé dans', resolve(DIST, 'sitemap_index.xml'));
