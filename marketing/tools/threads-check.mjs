// Threads 계정 현황(팔로워 수 등) 조회 스크립트 (Threads API)
// 사용법: node threads-check.mjs
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
	console.error(JSON.stringify({ error: '.env에 THREADS_ACCESS_TOKEN이 없습니다.' }));
	process.exit(1);
}

async function api(path, params = {}) {
	const url = new URL(`https://${HOST}/${API_VERSION}/${path}`);
	for (const [k, v] of Object.entries({ ...params, access_token: TOKEN })) url.searchParams.set(k, v);
	const res = await fetch(url);
	const json = await res.json();
	if (json.error) throw new Error(`${path}: ${json.error.message} (code ${json.error.code})`);
	return json;
}

const result = {};

const me = await api('me', { fields: 'id,username' });
result.username = me.username;
result.userId = me.id;

try {
	const insights = await api(`${me.id}/threads_insights`, { metric: 'followers_count' });
	const metric = insights.data?.find((m) => m.name === 'followers_count');
	result.followersCount = metric?.total_value?.value ?? null;
} catch (e) {
	result.followersCountError = e.message;
}

console.log(JSON.stringify(result, null, 2));
