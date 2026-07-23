// Threads OAuth 인증 코드를 장기 액세스 토큰으로 교환해 .env에 저장한다.
// 사용법: node get-threads-token.mjs --app-id <ID> --app-secret <SECRET> --code <CODE> --redirect-uri <URI>
// 토큰 값 자체는 콘솔에 출력하지 않는다.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = 'D:/living-note';
const ENV_PATH = join(ROOT, '.env');

const args = process.argv.slice(2);
const getArg = (name) => {
	const i = args.indexOf(name);
	return i >= 0 ? args[i + 1] : undefined;
};

const appId = getArg('--app-id');
const appSecret = getArg('--app-secret');
let code = getArg('--code');
const redirectUri = getArg('--redirect-uri');

if (!appId || !appSecret || !code || !redirectUri) {
	console.error('오류: --app-id --app-secret --code --redirect-uri 모두 필요합니다.');
	process.exit(1);
}

// 리디렉션된 URL 끝에 붙는 "#_" 아티팩트 제거 (Meta 리디렉션의 알려진 특징)
code = code.replace(/#_$/, '');

console.log('1단계: 인증 코드 → 단기 토큰 교환 중...');
const shortRes = await fetch('https://graph.threads.net/oauth/access_token', {
	method: 'POST',
	headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
	body: new URLSearchParams({
		client_id: appId,
		client_secret: appSecret,
		grant_type: 'authorization_code',
		redirect_uri: redirectUri,
		code,
	}),
});
const shortJson = await shortRes.json();
if (!shortRes.ok || shortJson.error_message || !shortJson.access_token) {
	console.error('단기 토큰 교환 실패:', shortJson.error_message ?? JSON.stringify(shortJson));
	process.exit(1);
}
console.log(`단기 토큰 확보 완료 (user_id=${shortJson.user_id})`);

console.log('2단계: 단기 토큰 → 장기(60일) 토큰 교환 중...');
const longUrl = new URL('https://graph.threads.net/access_token');
longUrl.searchParams.set('grant_type', 'th_exchange_token');
longUrl.searchParams.set('client_secret', appSecret);
longUrl.searchParams.set('access_token', shortJson.access_token);
const longRes = await fetch(longUrl);
const longJson = await longRes.json();
if (!longRes.ok || !longJson.access_token) {
	console.error('장기 토큰 교환 실패:', JSON.stringify(longJson));
	process.exit(1);
}
const days = longJson.expires_in ? Math.round(longJson.expires_in / 86400) : '알 수 없음';
console.log(`장기 토큰 확보 완료 (유효기간 약 ${days}일)`);

// .env 업데이트 (기존 THREADS_ACCESS_TOKEN 줄이 있으면 교체, 없으면 추가)
let envContent = existsSync(ENV_PATH) ? readFileSync(ENV_PATH, 'utf8') : '';
const line = `THREADS_ACCESS_TOKEN=${longJson.access_token}`;
if (/^THREADS_ACCESS_TOKEN=.*/m.test(envContent)) {
	envContent = envContent.replace(/^THREADS_ACCESS_TOKEN=.*/m, line);
} else {
	envContent = envContent.trimEnd() + '\n' + line + '\n';
}
writeFileSync(ENV_PATH, envContent, 'utf8');
console.log('.env 저장 완료 (THREADS_ACCESS_TOKEN). 토큰 값은 콘솔에 출력하지 않습니다.');
