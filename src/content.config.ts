import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// 허용 태그 정본 목록 (2026-08-11 확정).
// 태그마다 /category/<태그>/ 페이지가 자동 생성되므로, 자유 문자열을 허용하면
// 글 1편짜리 얇은 카테고리 페이지가 계속 늘어난다. 실제로 2026-08-06에
// 애드센스가 이를 "가치가 낮은 콘텐츠"로 판정해 사이트 승인이 막혔고,
// 문서(blog-writer.md)로만 목록을 안내했더니 하루 만에 다시 47개로 늘어났다.
// 그래서 스키마에서 강제한다 — 목록에 없는 태그가 들어가면 빌드가 실패한다.
// 새 태그가 정말 필요하면 이 배열에 먼저 추가하고, 그 태그로 묶일 글이
// 최소 2편 이상 확보되는지 확인할 것.
export const ALLOWED_TAGS = [
	'정부지원금',
	'자동차',
	'민원서류',
	'세금',
	'금융',
	'생활꿀팁',
	'부동산',
	'청년지원',
	'노후준비',
	'보험',
	'여행',
	'국민연금',
	'건강보험',
	'고용보험',
	'통신',
	'반려동물',
] as const;

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: z.optional(image()),
			tags: z.array(z.enum(ALLOWED_TAGS)).default([]),
			faq: z
				.array(z.object({ question: z.string(), answer: z.string() }))
				.optional(),
		}),
});

export const collections = { blog };
