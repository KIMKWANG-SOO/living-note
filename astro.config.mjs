// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://living-note.vercel.app',
	integrations: [
		mdx(),
		sitemap({
			serialize(item) {
				item.lastmod = new Date().toISOString();
				return item;
			},
		}),
	],
});
