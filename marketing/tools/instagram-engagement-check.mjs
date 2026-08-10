// 인스타그램 최근 게시물별 실제 반응(좋아요·댓글 수) 조회
// 사용법: node instagram-engagement-check.mjs [--limit 10]
// 목적: "쓰레드 반응 좋은 콘텐츠를 인스타에도 적용해보라" 같은 제안이 근거 없이
// 반복되는 걸 막기 위해, 실제로 어떤 게시물이 반응이 좋았는지 데이터로 확인한다.
import { readFileSync } from "node:fs";

const ROOT = "D:/living-note";
const env = {};
for (const line of readFileSync(`${ROOT}/.env`, "utf8").split(/\r?\n/)) {
	const i = line.indexOf("=");
	if (i > 0) env[line.slice(0, i).trim()] = line.slice(i + 1).trim();
}
const TOKEN = env.INSTAGRAM_ACCESS_TOKEN;
if (!TOKEN) {
	console.error("오류: .env에 INSTAGRAM_ACCESS_TOKEN이 없습니다.");
	process.exit(1);
}

const args = process.argv.slice(2);
const limitArg = args.indexOf("--limit");
const limit = limitArg !== -1 ? Number(args[limitArg + 1]) : 10;

const url = new URL("https://graph.instagram.com/v23.0/me/media");
url.searchParams.set("fields", "id,caption,timestamp,like_count,comments_count,permalink");
url.searchParams.set("limit", String(limit));
url.searchParams.set("access_token", TOKEN);

const res = await fetch(url);
const json = await res.json();
if (json.error) {
	console.error("에러:", json.error.message, `(code ${json.error.code})`);
	process.exit(1);
}

const rows = (json.data ?? []).map((m) => ({
	날짜: m.timestamp?.slice(0, 10),
	좋아요: m.like_count ?? 0,
	댓글: m.comments_count ?? 0,
	캡션_앞부분: (m.caption ?? "").split("\n")[0].slice(0, 40),
	주소: m.permalink,
}));

rows.sort((a, b) => b.좋아요 + b.댓글 - (a.좋아요 + a.댓글));
console.log(`최근 게시물 ${rows.length}개 (반응 많은 순):\n`);
for (const r of rows) {
	console.log(`- [${r.날짜}] 좋아요 ${r.좋아요} · 댓글 ${r.댓글} — ${r.캡션_앞부분} (${r.주소})`);
}
