// Threads 텍스트 게시 스크립트 (Meta Threads API)
// 사용법:
//   node post-threads.mjs --check                 # 토큰·계정 확인만 (게시 안 함)
//   node post-threads.mjs --publish --text "..."   # 텍스트 게시
// 전제: D:\living-note\.env 에 THREADS_ACCESS_TOKEN 저장되어 있을 것
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = 'D:/living-note';
const HOST = 'graph.threads.net';
const API_VERSION = 'v1.0';

const env = {};
for (const line of readFileSync(join(ROOT, '.env'), 'utf8').split(/\r?\n/)) {
	const i = line.indexOf('=');
	if (i > 0) env[line.slice(0, i).trim()] = line.slice(i + 1).trim();
}
const TOKEN = env.THREADS_ACCESS_TOKEN;
if (!TOKEN) {
	console.error('오류: .env에 THREADS_ACCESS_TOKEN이 없습니다. 아직 Threads 연동 전입니다.');
	process.exit(1);
}

const args = process.argv.slice(2);
const getArg = (name) => {
	const i = args.indexOf(name);
	return i >= 0 ? args[i + 1] : undefined;
};

async function api(path, params = {}, method = 'GET') {
	const url = new URL(`https://${HOST}/${API_VERSION}/${path}`);
	const body = new URLSearchParams({ ...params, access_token: TOKEN });
	let res;
	if (method === 'GET') {
		for (const [k, v] of body) url.searchParams.set(k, v);
		res = await fetch(url);
	} else {
		res = await fetch(url, { method: 'POST', body });
	}
	const json = await res.json();
	if (json.error) throw new Error(`${path}: ${json.error.message} (code ${json.error.code})`);
	return json;
}

async function waitFinished(containerId) {
	for (let i = 0; i < 20; i++) {
		const st = await api(containerId, { fields: 'status,error_message' });
		if (st.status === 'FINISHED') return;
		if (st.status === 'ERROR') throw new Error(`컨테이너 처리 실패: ${st.error_message ?? containerId}`);
		await new Promise((r) => setTimeout(r, 1500));
	}
	throw new Error(`컨테이너 처리 시간 초과: ${containerId}`);
}

const me = await api('me', { fields: 'id,username' });
console.log(`계정 확인: @${me.username} (id=${me.id})`);

if (args.includes('--check')) {
	console.log('토큰 정상 — 게시 준비 완료.');
	process.exit(0);
}

if (!args.includes('--publish')) {
	console.log('아무 작업도 지정되지 않았습니다. --check 또는 --publish --text "..."');
	process.exit(0);
}

const text = getArg('--text');
if (!text) {
	console.error('오류: --text "게시할 내용" 필요 (500자 이내 권장)');
	process.exit(1);
}

const container = await api(`${me.id}/threads`, { media_type: 'TEXT', text }, 'POST');
await waitFinished(container.id);
const published = await api(`${me.id}/threads_publish`, { creation_id: container.id }, 'POST');
console.log(`게시 완료! media_id=${published.id}`);
