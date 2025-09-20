// scripts/generate-sitemap.mjs
import { SitemapStream, streamToPromise } from 'sitemap';
import { createWriteStream } from 'node:fs';
import { resolve } from 'node:path';

const BASE_URL = process.argv[2] ?? 'https://ton-domaine.com'; // domaine à passer en argument
const DIST = 'dist/apollo-ng';

// 👉 ajoute ici toutes tes routes Angular publiques
const routes = [
  { url: '/', changefreq: 'daily', priority: 1.0 },
  { url: '/landing', changefreq: 'weekly', priority: 0.9 },
  { url: '/dashboard', changefreq: 'weekly', priority: 0.8 },
  { url: '/dashboard/transfert/envoie', changefreq: 'weekly', priority: 0.8 },
  // { url: `/produits/${slug}`, ... } si tu veux dynamiser
];

const sitemap = new SitemapStream({ hostname: BASE_URL });
routes.forEach((r) => sitemap.write(r));
sitemap.end();

const outPath = resolve(DIST, 'sitemap.xml');
const writeStream = createWriteStream(outPath);

streamToPromise(sitemap).then((data) => {
  writeStream.write(data.toString());
  writeStream.end();
  console.log('✅ sitemap.xml généré dans', outPath);
});
