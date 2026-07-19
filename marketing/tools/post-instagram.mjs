// 인스타그램 카드뉴스 자동 게시 스크립트 (Instagram Graph API)
// 사용법:
//   node post-instagram.mjs --check                          # 토큰·계정 확인만 (게시 안 함)
//   node post-instagram.mjs --publish --date 2026-07-19      # 해당 날짜 카드 캐러셀 게시
// 전제:
//   - D:\living-note\.env 에 INSTAGRAM_ACCESS_TOKEN 저장
//   - 카드 이미지가 https://living-note.vercel.app/cards/<date>/card-XX.png 로 배포되어 있을 것
//   - D:\living-note\marketing\output\<date>\caption.txt 에 캡션 저장되어 있을 것
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = 'D:/living-note';
const SITE = 'https://living-note.kr';
const API_VERSION = 'v23.0';

// ---- .env 파싱 ----
const env = {};
for (const line of readFileSync(join(ROOT, '.env'), 'utf8').split(/\r?\n/)) {
	const i = line.indexOf('=');
	if (i > 0) env[line.slice(0, i).trim()] = line.slice(i + 1).trim();
}
const TOKEN = env.INSTAGRAM_ACCESS_TOKEN;
if (!TOKEN) {
	console.error('오류: .env에 INSTAGRAM_ACCESS_TOKEN이 없습니다.');
	process.exit(1);
}

const args = process.argv.slice(2);
const getArg = (name) => {
	const i = args.indexOf(name);
	return i >= 0 ? args[i + 1] : undefined;
};

async function api(host, path, params = {}, method = 'GET') {
	const url = new URL(`https://${host}/${API_VERSION}/${path}`);
	const body = new URLSearchParams({ ...params, access_token: TOKEN });
	let res;
	if (method === 'GET') {
		for (const [k, v] of body) url.searchParams.set(k, v);
		res = await fetch(url);
	} else {
		res = await fetch(url, { method: 'POST', body });
	}
	const json = await res.json();
	if (json.error) throw new Error(`${host}/${path}: ${json.error.message} (code ${json.error.code})`);
	return json;
}

// ---- 계정 확인: Instagram 로그인 토큰(graph.instagram.com) 우선, Facebook 로그인 토큰 폴백 ----
async function resolveAccount() {
	try {
		const me = await api('graph.instagram.com', 'me', { fields: 'user_id,username,account_type' });
		return { host: 'graph.instagram.com', igId: me.user_id ?? me.id, username: me.username, via: 'Instagram 로그인' };
	} catch (e1) {
		try {
			const pages = await api('graph.facebook.com', 'me/accounts', { fields: 'name,instagram_business_account' });
			const page = (pages.data || []).find((p) => p.instagram_business_account);
			if (!page) throw new Error('연결된 인스타그램 비즈니스 계정을 가진 페이지가 없습니다.');
			const ig = await api('graph.facebook.com', page.instagram_business_account.id, { fields: 'username' });
			return { host: 'graph.facebook.com', igId: page.instagram_business_account.id, username: ig.username, via: `Facebook 페이지(${page.name})` };
		} catch (e2) {
			throw new Error(`두 방식 모두 실패:\n  1) ${e1.message}\n  2) ${e2.message}`);
		}
	}
}

async function waitFinished(host, containerId) {
	for (let i = 0; i < 30; i++) {
		const st = await api(host, containerId, { fields: 'status_code' });
		if (st.status_code === 'FINISHED') return;
		if (st.status_code === 'ERROR') throw new Error(`컨테이너 처리 실패: ${containerId}`);
		await new Promise((r) => setTimeout(r, 2000));
	}
	throw new Error(`컨테이너 처리 시간 초과: ${containerId}`);
}

const account = await resolveAccount();
console.log(`계정 확인: @${account.username} (${account.via}, id=${account.igId})`);

if (args.includes('--check')) {
	console.log('토큰 정상 — 게시 준비 완료.');
	process.exit(0);
}

if (!args.includes('--publish')) {
	console.log('아무 작업도 지정되지 않았습니다. --check 또는 --publish --date YYYY-MM-DD');
	process.exit(0);
}

// ---- 게시 ----
const date = getArg('--date');
if (!date) { console.error('오류: --date YYYY-MM-DD 필요'); process.exit(1); }
const dir = join(ROOT, 'marketing', 'output', date);
const captionPath = join(dir, 'caption.txt');
if (!existsSync(captionPath)) { console.error(`오류: ${captionPath} 없음`); process.exit(1); }
const caption = readFileSync(captionPath, 'utf8').trim();

const cards = readdirSync(dir).filter((f) => /^card-\d+\.png$/.test(f)).sort();
if (cards.length < 2) { console.error(`오류: 카드가 2장 미만 (${cards.length}장) — 캐러셀은 2~10장 필요`); process.exit(1); }
if (cards.length > 10) cards.length = 10;

// 공개 URL 존재 확인 (배포됐는지)
const urls = cards.map((f) => `${SITE}/cards/${date}/${f}`);
for (const u of urls) {
	const r = await fetch(u, { method: 'HEAD' });
	if (!r.ok) { console.error(`오류: ${u} → HTTP ${r.status}. 카드가 아직 배포되지 않았습니다.`); process.exit(1); }
}
console.log(`공개 URL 확인 완료: ${urls.length}장 모두 200 OK`);

// 1) 자식 컨테이너 생성
const children = [];
for (const u of urls) {
	const c = await api(account.host, `${account.igId}/media`, { image_url: u, is_carousel_item: 'true' }, 'POST');
	await waitFinished(account.host, c.id);
	children.push(c.id);
	console.log(`  컨테이너 생성: ${u.split('/').pop()} → ${c.id}`);
}

// 2) 캐러셀 컨테이너 + 3) 게시
const carousel = await api(account.host, `${account.igId}/media`, { media_type: 'CAROUSEL', children: children.join(','), caption }, 'POST');
await waitFinished(account.host, carousel.id);
const published = await api(account.host, `${account.igId}/media_publish`, { creation_id: carousel.id }, 'POST');
const info = await api(account.host, published.id, { fields: 'permalink' });
console.log(`게시 완료! media_id=${published.id}`);
console.log(`게시물 주소: ${info.permalink}`);
