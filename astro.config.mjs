import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  site: 'https://florian-obermeier.com',
  output: 'hybrid',
  adapter: vercel(),
  compressHTML: true,
});
