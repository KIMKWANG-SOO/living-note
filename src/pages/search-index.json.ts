import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

// 전체 글 목록 페이지의 클라이언트 검색용 색인.
// 본문은 넣지 않는다 — 제목·설명·태그만으로 대부분 걸리고, 본문을 넣으면
// 용량이 커지는 대신 엉뚱한 결과가 늘어난다.
export const GET: APIRoute = async () => {
	const posts = (await getCollection('blog')).sort(
		(a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
	);

	const index = posts.map((post) => ({
		s: post.id,
		t: post.data.title,
		d: post.data.description,
		g: post.data.tags ?? [],
		// 서버 렌더링(FormattedDate)과 같은 형식으로 미리 만들어 둔다.
		p: post.data.pubDate.toLocaleDateString('ko-KR', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		}),
		i: post.data.pubDate.toISOString(),
	}));

	return new Response(JSON.stringify(index), {
		headers: { 'Content-Type': 'application/json; charset=utf-8' },
	});
};
