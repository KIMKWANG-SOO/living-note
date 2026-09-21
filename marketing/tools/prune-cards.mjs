// public/cards 정리 — 인스타 게시가 끝난 오래된 카드뉴스 배포본을 제거해 배포 용량을 줄인다.
// 사용법:
//   node prune-cards.mjs                    # 드라이런(기본): 지울 폴더만 보여주고 아무것도 지우지 않음
//   node prune-cards.mjs --apply            # 실제 삭제
//   node prune-cards.mjs --keep-days 14     # 보존 기간 변경 (기본 7일, 오늘 포함)
//
// 안전장치:
//   - public/cards/<폴더>가 marketing/output/<같은 폴더>와 파일 단위로 바이트 동일할 때만 삭제한다.
//     (marketing/output이 원본이다. 다르거나 원본이 없는 폴더는 건드리지 않고 경고만 낸다.)
//   - 폴더명 앞 YYYY-MM-DD가 보존 기간 안이면 삭제하지 않는다.
//   - 삭제된 파일은 git 이력에 남아 있어 복구할 수 있다(git show <커밋>:public/cards/...).
import { readFileSync, readdirSync, existsSync, statSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const ROOT = 'D:/living-note';
const PUB = join(ROOT, 'public', 'cards');
const SRC = join(ROOT, 'marketing', 'output');

const args = process.argv.slice(2);
const apply = args.includes('--apply');
const kdIdx = args.indexOf('--keep-days');
const keepDays = kdIdx >= 0 ? Number(args[kdIdx + 1]) : 7;
if (!Number.isInteger(keepDays) || keepDays < 1) {
	console.error('오류: --keep-days는 1 이상의 정수여야 합니다.');
	process.exit(1);
}

const sha = (f) => createHash('sha1').update(readFileSync(f)).digest('hex');
const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const cutoffDate = new Date();
cutoffDate.setDate(cutoffDate.getDate() - (keepDays - 1));
const cutoff = ymd(cutoffDate);

let keep = 0, remove = 0, skipped = 0, removedBytes = 0;
for (const name of readdirSync(PUB).sort()) {
	const pubDir = join(PUB, name);
	if (!statSync(pubDir).isDirectory()) continue;
	const m = name.match(/^(\d{4}-\d{2}-\d{2})/);
	if (!m) { console.warn(`건너뜀(날짜 접두어 없음): ${name}`); skipped++; continue; }
	if (m[1] >= cutoff) { keep++; continue; }

	const srcDir = join(SRC, name);
	const files = readdirSync(pubDir);
	const mismatch = !existsSync(srcDir)
		? '원본 폴더 없음'
		: files.find((f) => !existsSync(join(srcDir, f)) || sha(join(pubDir, f)) !== sha(join(srcDir, f)));
	if (mismatch) { console.warn(`건너뜀(원본과 불일치: ${mismatch === true ? '' : mismatch}): ${name}`); skipped++; continue; }

	const bytes = files.reduce((s, f) => s + statSync(join(pubDir, f)).size, 0);
	removedBytes += bytes;
	remove++;
	if (apply) rmSync(pubDir, { recursive: true });
}

const mb = (removedBytes / 1024 / 1024).toFixed(1);
console.log(`${apply ? '[삭제 완료]' : '[드라이런]'} 기준일 ${cutoff} 이전 폴더: 삭제 ${remove}개(${mb}MB) / 보존 ${keep}개 / 건너뜀 ${skipped}개`);
if (!apply) console.log('실제로 지우려면 --apply 를 붙이세요.');
