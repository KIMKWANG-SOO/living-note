# living-note-weekly-standup

- 일정(초안): 매주 월요일 10:00 (`0 10 * * 1`)
- 원본 지시문은 2026-11-08 Windows 재설치로 사라져, `CLAUDE.md`·`cs/` 최근 보고서를 바탕으로 다시 썼다.

## 지시문

생활정보노트(E:\living-note)의 주간 유지보수를 총괄 마스터로서 진행한다. 이 세션은 이전 대화를 모른다. `CLAUDE.md`, `.claude/agents/master.md`, `cs/`의 가장 최근 정기품질점검 보고서를 먼저 읽는다.

git과 node는 PATH에 없고 git은 GitHub Desktop 안에 있어 업데이트하면 경로가 바뀐다. 셸 상태가 유지되지 않으므로 **git·node·npm을 쓰는 PowerShell 명령마다** 맨 앞에 아래를 붙인다.

`$gd = (Get-ChildItem "$env:LOCALAPPDATA\GitHubDesktop\app-*\resources\app\git\cmd\git.exe" | Sort-Object LastWriteTime -Descending | Select-Object -First 1).DirectoryName; $env:Path = "$gd;E:\Program Files\nodejs;" + $env:Path; $env:GIT_TERMINAL_PROMPT = '0'; $env:GCM_INTERACTIVE = 'never';`

### 사전 확인

- git이 없거나 `git push --dry-run origin main` 이 실패하면 중단하고 오류 문구와 함께 보고한다.
- `git log --since="5 days ago" --grep="주간 유지보수"` 에 커밋이 있으면 이번 주 점검은 이미 끝난 것이므로 끝낸다.
- `git pull --ff-only origin main` 후 `git status --short`. 이번 세션이 만들지 않은 변경은 건드리지 않고 보고에 남긴다.

### 팀별 지시 (Agent 도구로 호출, 독립 업무는 병렬)

**CS팀 — 오래된 글 점검.** `cs/정기품질점검-<오늘 날짜>.md`에 보고서를 쓴다.
1. 지난 보고서의 "다음 회차 우선 후보"와 재확인 항목을 이어받는다. 기존 보고서의 "## N. 파일명.md" 헤더로 점검 완료 글을 집계해 미점검 글을 고른다.
2. 기본 트랙 1편(미점검 중 pubDate가 가장 오래된 글) + 정책 트랙 3편(세금·연금·사회보험 등 제도 변화가 잦은 글), 총 4편을 전문으로 읽는다.
3. 공식 안내와의 일치뿐 아니라 pubDate 이후 바뀐 것을 따로 찾는다. 예외 없이 단정하는 문장을 먼저 검증한다.
4. frontmatter `faq`와 본문 FAQ 일치, 내부 링크, 쿠팡 링크(저장소 등록·고지 문구·금지 범주)를 확인한다. 경계선 사례는 CLAUDE.md 2026-09-29 판단 기준을 따르고 다시 질문하지 않는다.
5. 수정 제안은 수정 전/후 문구와 근거로 쓰고, 근거가 원문인지 요약인지 밝힌다. 확인 못 한 것은 목록으로 남긴다. CS팀은 글을 고치거나 커밋하지 않는다.

**디자인팀 — 화면 개선 1건.** 작고 이유가 분명한 것만. 글 내용과 기능 로직은 건드리지 않는다.

**개발팀 — 기술 점검.** 빌드 경고, 의존성 보안 알림(`npm audit`, 메이저 업그레이드는 제안만), 깨진 내부 링크, sitemap·RSS·구조화 데이터를 확인한다. 글 내용과 Vercel 설정은 건드리지 않는다.

### 검수와 반영

1. 직원 보고만 믿지 말고 결과물 파일과 빌드 출력을 직접 확인한다.
2. CS 지적 중 근거가 확실한 것은 총괄이 직접 글에 반영한다. **CS 수정안도 그대로 믿지 말고 근거와 대조한다.** 근거가 2차 자료뿐이거나 불확실하면 단정하지 말고 "공식 기관에서 확인" 문구로 헤지하고, 반영하지 않은 항목은 이유를 남긴다. frontmatter와 본문 FAQ를 함께 고친다.
3. 같은 오류가 다른 글에도 있는지 검색한다.
4. 제목·슬러그는 바꾸지 않는다. 발행 편수·태그 목록·Vercel 설정도 임의로 바꾸지 않는다.

### 마무리

`npm run build` 성공을 확인한 뒤 이번 세션이 만든 변경만 `git add` 하고 `git commit -m "chore: 주간 유지보수 <날짜>"`, `git push origin main`. 실패하면 푸시하지 않고 보고한다.

보고에는 팀별 산출물, 반영한 수정과 근거, 보류한 것과 이유, 빌드 결과, 커밋 해시, 사장이 결정·확인해야 할 사항을 남긴다. 확인하지 못한 것은 "확인 못 함"이라고 쓴다.
