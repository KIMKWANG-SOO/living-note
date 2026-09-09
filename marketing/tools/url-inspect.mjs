// 서치콘솔 URL 검사 API로 "구글이 마지막으로 크롤한 시각"을 확인한다.
// 제목을 바꾼 글이 실제로 재크롤됐는지 판단하는 근거로 쓴다.
import { readFileSync } from 'node:fs';
import { GoogleAuth } from 'google-auth-library';

const keyFile = JSON.parse(
	readFileSync('.credentials/search-console-key.json', 'utf8')
);
const auth = new GoogleAuth({
	credentials: keyFile,
	scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
});
const client = await auth.getClient();

const urls = process.argv.slice(2);
if (urls.length === 0) {
	console.error('사용법: node inspect-url.mjs <검사할 URL> ...');
	process.exit(1);
}

for (const url of urls) {
	try {
		const res = await client.request({
			url: 'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect',
			method: 'POST',
			data: {
				inspectionUrl: url,
				siteUrl: 'https://living-note.kr/',
				languageCode: 'ko',
			},
		});
		const r = res.data.inspectionResult?.indexStatusResult ?? {};
		console.log(
			[
				url.replace('https://living-note.kr', ''),
				`색인:${r.coverageState ?? '?'}`,
				`마지막크롤:${r.lastCrawlTime ?? '없음'}`,
				`로봇:${r.robotsTxtState ?? '?'}`,
				`색인허용:${r.indexingState ?? '?'}`,
			].join('  ')
		);
	} catch (e) {
		const msg = e?.response?.data?.error?.message ?? e.message;
		console.log(`${url}  ERROR: ${msg}`);
	}
}
