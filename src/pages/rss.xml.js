import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import sanitizeHtml from 'sanitize-html';
import MarkdownIt from 'markdown-it';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';

const parser = new MarkdownIt();

export async function GET(context) {
	const posts = (await getCollection('blog'))
		.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
		// 글이 계속 쌓이는 구조라 전체를 담으면 피드가 무한정 커진다.
		// 최신 30편만 담아 피드 크기를 관리한다(사이트맵·전체 글 목록에는 영향 없음).
		.slice(0, 30);
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: posts.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.pubDate,
			link: `/blog/${post.id}/`,
			content: sanitizeHtml(parser.render(post.body), {
				allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
			}),
		})),
		customData: '<language>ko</language>',
	});
}
