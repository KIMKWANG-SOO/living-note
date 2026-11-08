# living-note-seo-check

- 일정(초안): 매일 09:00 (`0 9 * * *`, 2026-07 보고서에 기록된 원래 일정)
- 원본 지시문은 2026-11-08 Windows 재설치로 사라져, 최근 보고서 형식을 바탕으로 다시 썼다.

## 지시문

생활정보노트(E:\living-note)의 SEO·성장 현황을 점검해 `docs/seo-status/<오늘 날짜>.md` 보고서를 쓴다. 이 세션은 이전 대화를 모른다. 먼저 `CLAUDE.md`와 `docs/seo-status/`의 가장 최근 보고서를 읽고, 같은 섹션 구성과 표 형식으로 직전 보고와 비교한다.

git과 node는 PATH에 없고 git은 GitHub Desktop 안에 있어 업데이트하면 경로가 바뀐다. 셸 상태가 유지되지 않으므로 **git·node·npm을 쓰는 PowerShell 명령마다** 맨 앞에 아래를 붙인다.

`$gd = (Get-ChildItem "$env:LOCALAPPDATA\GitHubDesktop\app-*\resources\app\git\cmd\git.exe" | Sort-Object LastWriteTime -Descending | Select-Object -First 1).DirectoryName; $env:Path = "$gd;E:\Program Files\nodejs;" + $env:Path; $env:GIT_TERMINAL_PROMPT = '0'; $env:GCM_INTERACTIVE = 'never';`

git이 없거나 푸시가 실패하면 보고서만 남기고 "커밋 못 함" 또는 "푸시 못 함"이라고 보고한다. 오늘 날짜 보고서가 이미 있으면 다시 쓰지 말고 끝낸다.

### 수집 항목

1. 글 수: `src/content/blog/*.md` 개수
2. 구글 서치콘솔: `node marketing/tools/search-console-check.mjs --days 28`, `--days 7`. 조회 범위, 페이지별·검색어별 수치, 직전과 달라진 곳, 노출은 많은데 순위가 낮은 새 페이지 여부
3. 네이버: API가 없으므로 사장 스크린샷이 없으면 "이번 회차 미확인(사장 스크린샷 필요, 마지막 확인 <날짜>)"로 적고 마지막 수치를 함께 남긴다. 추정하지 않는다.
4. `https://living-note.kr/robots.txt`, `https://living-note.kr/sitemap-index.xml` 응답과 lastmod
5. 인스타그램: `node marketing/tools/post-instagram.mjs --check` 의 팔로워·게시물 수
6. 쓰레드: `node marketing/tools/threads-check.mjs` 의 팔로워 수
7. 쿠팡: `marketing/coupang-links.md`의 행·카테고리 수, 날짜 만료("⚠️...까지") 행. 클릭·매출은 권한이 없으므로 "확인 못 함"
8. `npm run build` 결과와 페이지 수, 태그 스키마 통과 여부
9. 직전 보고 이후 빠진 날짜가 있으면 "점검 공백"으로 적는다. 원인을 모르면 "확인 못 함"이라고 쓴다.

### 판단 규칙

- 구글 수치만으로 사이트 상태를 판단하지 않는다. 유입 주력은 네이버다.
- 글·코드·제목은 고치지 않는다. 제안만 쓴다.
- 발행 편수를 늘리자고 제안하지 않는다(사장 결정 사항).
- 하루 1~2명 수준의 팔로워 변동으로 전략을 바꾸자고 하지 않는다.
- 사장에게 부탁할 확인 사항은 구체적으로 적는다.
- 토큰 값을 보고서에 쓰지 않는다. 수치를 지어내지 않는다.

### 마무리

맨 위에 요약 인용구, 맨 아래에 소견과 권고를 쓴다. 보고서 파일만 `git add` 하고 `git commit -m "docs: SEO 점검 보고서 <날짜>" -- docs/seo-status/<날짜>.md`, `git push origin main`. 발행 작업이 같은 저장소에서 아직 돌고 있을 수 있으므로 경로를 지정해 다른 변경이 섞이지 않게 한다.
