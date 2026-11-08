import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import sanitizeHtml from 'sanitize-html';
import MarkdownIt from 'markdown-it';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';

const parser = new MarkdownIt();

// 사이트 본문은 remark-korean-fixes 플러그인이 "**…"따옴표"**입니다"처럼 닫는 ** 뒤에
// 한글이 붙어 굵게가 깨지는 경우를 바로잡지만, RSS는 markdown-it으로 따로 렌더링해
// 그 교정이 빠진다(2026-11-08 점검: 최신 20편 중 4편에서 ** 가 글자로 노출).
// 렌더링 후 태그를 넘지 않는 범위에서 글자로 남은 ** 짝만 <strong>으로 바꾼다.
const fixLeftoverBold = (html) => html.replace(/\*\*([^*<>\n]+?)\*\*/g, '<strong>$1</strong>');

export async function GET(context) {
	const posts = (await getCollection('blog'))
		.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
		// 글이 계속 쌓이는 구조라 전체를 담으면 피드가 무한정 커진다.
		// 최신 20편만 담아 피드 크기를 관리한다(사이트맵·전체 글 목록에는 영향 없음).
		// 2026-10-12: 30편 시 피드가 465KB까지 커져 20편으로 줄임(하루 1편 발행 기준 약 3주치).
		.slice(0, 20);
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: posts.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.pubDate,
			link: `/blog/${post.id}/`,
			content: sanitizeHtml(fixLeftoverBold(parser.render(post.body)), {
				allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
			}),
		})),
		customData: '<language>ko</language>',
	});
}
