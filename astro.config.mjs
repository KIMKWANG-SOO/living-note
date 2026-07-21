// @ts-check

import { readFileSync } from 'node:fs';

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

const BLOG_DIR = new URL('./src/content/blog/', import.meta.url);

// Read pubDate/updatedDate straight from a post's frontmatter so the sitemap
// reports the post's real last-modified date instead of "now" on every build.
function getBlogPostLastmod(slug) {
	try {
		const raw = readFileSync(new URL(`${slug}.md`, BLOG_DIR), 'utf-8');
		const pubMatch = raw.match(/^pubDate:\s*['"]?([\d-]+)['"]?/m);
		const updatedMatch = raw.match(/^updatedDate:\s*['"]?([\d-]+)['"]?/m);
		const dateStr = updatedMatch?.[1] ?? pubMatch?.[1];
		return dateStr ? new Date(dateStr).toISOString() : undefined;
	} catch {
		return undefined;
	}
}

// https://astro.build/config
export default defineConfig({
	site: 'https://living-note.kr',
	integrations: [
		mdx(),
		sitemap({
			serialize(item) {
				const match = item.url.match(/\/blog\/([^/]+)\/$/);
				const lastmod = match && getBlogPostLastmod(match[1]);
				if (lastmod) {
					item.lastmod = lastmod;
				} else {
					delete item.lastmod;
				}
				return item;
			},
		}),
	],
});
