# living-note-daily-post

- 일정(초안): 매일 08:00 (`0 8 * * *`)
- 원본 지시문은 2026-11-08 Windows 재설치로 사라져, `CLAUDE.md`·에이전트 설정·운영 기록을 바탕으로 다시 썼다.

## 지시문

생활정보노트 블로그(E:\living-note)의 오늘 글 1편을 작성·검수·발행하고 카드뉴스를 인스타그램·쓰레드에 게시한다. 이 세션은 이전 대화를 모르므로 아래 파일을 먼저 읽고 그대로 따른다.

- `E:\living-note\CLAUDE.md` (운영 원칙의 정본. 이 지시문과 어긋나면 CLAUDE.md를 따른다)
- `E:\living-note\.claude\agents\blog-writer.md` (글 작성 기준)
- `E:\living-note\.claude\agents\marketing.md` (카드뉴스·SNS 게시 절차)

### 1. 사전 확인 — 하나라도 실패하면 글을 쓰지 말고 중단한 뒤 이유를 보고한다

git과 node는 PATH에 없고 git은 GitHub Desktop 안에 있어 업데이트하면 경로가 바뀐다. 셸 상태가 유지되지 않으므로 **git·node·npm을 쓰는 PowerShell 명령마다** 맨 앞에 아래를 붙인다.

`$gd = (Get-ChildItem "$env:LOCALAPPDATA\GitHubDesktop\app-*\resources\app\git\cmd\git.exe" | Sort-Object LastWriteTime -Descending | Select-Object -First 1).DirectoryName; $env:Path = "$gd;E:\Program Files\nodejs;" + $env:Path; $env:GIT_TERMINAL_PROMPT = '0'; $env:GCM_INTERACTIVE = 'never';`

1. `git --version`, `node --version` 이 동작하는가. git이 없으면 푸시를 못 하므로 중단한다.
2. `git push --dry-run origin main` 이 성공하는가. 실패하면 글을 쓰지 말고 "GitHub 인증 또는 저장소 접근 문제"로 오류 문구와 함께 보고한다.
3. `git log --since="$(Get-Date -Format yyyy-MM-dd) 00:00" --grep="^post:" --oneline` 로 오늘 발행 커밋이 이미 있는지, `src/content/blog/`에 pubDate가 오늘인 글이 있는지 확인한다. **있으면 중복 발행이므로 즉시 끝낸다** (2026-07-28 같은 작업이 두 번 돌아 중복 발행될 뻔한 사고가 있었다).
4. `git pull --ff-only origin main` 후 `git status --short` 를 확인한다. 이번 세션이 만들지 않은 변경이 있으면 건드리지 않고, 파일 목록을 보고에 남긴다.

### 2. 작성·검수

CLAUDE.md의 "매일 발행 루틴"대로 한다. 특히 지킨다.

- **하루 1편.** 편수를 임의로 늘리지 않는다. 지난날 빠진 글을 소급 발행하지 않는다.
- 공공기관 안내문에 없는 것(비교, 자주 막히는 지점, 판단 기준)을 최소 하나 담는다.
- 최근 10편의 제목과 끝맺음이 겹치지 않게 하고, 최근 3편과 다른 카테고리를 고른다. `tags`는 `ALLOWED_TAGS`에서만 고른다.
- 정부 제도 글은 "○○ 개정 2026", "○○ 정책 변경" 검색을 발행 전에 한 번 더 한다.
- 제휴 박스는 `marketing/coupang-links.md`의 링크만, CLAUDE.md 기준을 모두 통과할 때만 넣는다. 금지 범주(사기·의료·사망·상속·체납·압류)에는 넣지 않는다.
- 초안을 비판적 제3자 관점으로 다시 읽어 검수한다. 가능하면 cs 에이전트를 호출한다. 사실관계, FAQ와 본문의 일치(frontmatter `faq`와 본문 FAQ 문구 포함), 품질 기준을 확인하고, 확신 있는 오류는 고치고 불확실한 것은 "공식 사이트에서 확인"으로 헤지한다.

### 3. 카드뉴스와 배포 (배포는 세션당 1회)

1. `marketing.md` 절차대로 `marketing/output/<날짜>-<슬러그>/`에 cards.json, 카드 PNG, caption.txt, threads.txt를 만든다. PNG를 직접 열어 글자 잘림·오타를 확인한다.
2. 카드를 `public/cards/<날짜>-<슬러그>/`로 복사한다.
3. `npm run build`. 실패하면 고치고, 고치지 못하면 푸시하지 않고 보고한다.
4. 이번 세션이 만든 파일만 `git add` 한 뒤 `git commit -m "post: <제목> (<날짜>) + 카드뉴스"`, `git push origin main`. Vercel CLI로 직접 배포하지 않는다.

### 4. SNS 게시

1. `https://living-note.kr/cards/<날짜>-<슬러그>/card-01.png` 가 HTTP 200이 될 때까지 최대 5분 기다린다. 끝내 200이 아니면 인스타는 게시하지 않고 보고한다.
2. `node marketing/tools/post-instagram.mjs --publish --date <날짜>-<슬러그>`
3. `node marketing/tools/post-threads.mjs --publish --text "<threads.txt 내용>"`
4. **게시 명령은 다시 실행하기 전에 출력부터 확인한다.** 이 PC에서는 `post-instagram.mjs --check`가 정상 결과를 출력한 뒤 종료 시 `Assertion failed ... async.c` 오류와 함께 비정상 종료 코드(255)를 냈다. 종료 코드만 보고 재실행하면 중복 게시될 수 있으므로, 게시물 주소나 media_id가 출력됐으면 성공으로 보고 해당 계정에서 게시 여부를 확인한다.
5. 토큰 오류가 나면 즉시 중단하고 "토큰 갱신 필요"로 보고한다. 토큰 값은 로그·보고에 출력하지 않는다. 그 밖의 채널에는 게시하지 않는다.

### 5. 보고

글 제목·주제, 안내문에 없는 무엇을 담았는지, 검수에서 찾아 고친 내용과 확인 근거, 제휴 박스 여부와 이유, 빌드 결과, 커밋 해시, 인스타 게시물 주소, 쓰레드 media_id를 남긴다. 확인하지 못한 것은 "확인 못 함"이라고 쓴다.
