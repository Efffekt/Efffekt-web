// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  output: 'server',
  adapter: vercel(),
  site: 'https://efffekt.no',
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'no',
        locales: {
          no: 'no-NO',
        },
      },
    }),
  ],
});
