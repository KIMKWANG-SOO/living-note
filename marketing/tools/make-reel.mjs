// 카드뉴스 PNG들을 이어붙여 인스타 릴스용 세로 슬라이드쇼 영상(mp4, 1080x1920, 무음)을 만든다.
// 사용법: node make-reel.mjs --dir D:\living-note\public\cards\<날짜>-<슬러그>
// 출력: 같은 폴더에 reel.mp4 (오디오는 없음 — 인스타 앱에서 직접 트렌드 음원을 붙여 업로드하는 걸 전제로 함)
import { execFileSync } from 'node:child_process';
import { readdirSync, existsSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const args = process.argv.slice(2);
const getArg = (name) => {
	const i = args.indexOf(name);
	return i >= 0 ? args[i + 1] : undefined;
};

const dir = getArg('--dir');
if (!dir || !existsSync(dir)) {
	console.error('오류: --dir <카드 폴더 경로> 필요');
	process.exit(1);
}

const cards = readdirSync(dir).filter((f) => /^card-\d+\.png$/.test(f)).sort();
if (cards.length < 2) {
	console.error(`오류: 카드가 2장 미만 (${cards.length}장)`);
	process.exit(1);
}

const BG = '0x1e40af'; // 브랜드 accent-dark 색, 세로 캔버스 여백 색
const tmp = mkdtempSync(join(tmpdir(), 'reel-'));
const segFiles = [];

cards.forEach((file, i) => {
	const isFirst = i === 0;
	const isLast = i === cards.length - 1;
	const duration = isFirst ? 2.8 : isLast ? 3.5 : 2.3;
	const seg = join(tmp, `seg-${String(i).padStart(2, '0')}.mp4`);
	execFileSync('ffmpeg', [
		'-y',
		'-loop', '1',
		'-i', join(dir, file),
		'-t', String(duration),
		'-vf', `scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=${BG},format=yuv420p`,
		'-r', '30',
		'-c:v', 'libx264',
		'-pix_fmt', 'yuv420p',
		seg,
	], { stdio: 'inherit' });
	segFiles.push(seg);
});

const listPath = join(tmp, 'list.txt');
writeFileSync(listPath, segFiles.map((f) => `file '${f.replace(/\\/g, '/')}'`).join('\n'), 'utf8');

const outPath = join(dir, 'reel.mp4');
execFileSync('ffmpeg', ['-y', '-f', 'concat', '-safe', '0', '-i', listPath, '-c', 'copy', outPath], { stdio: 'inherit' });

rmSync(tmp, { recursive: true, force: true });
console.log(`릴스 영상 생성 완료: ${outPath}`);
