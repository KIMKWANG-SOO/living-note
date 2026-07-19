# 생활정보노트 (living-note)

한국어 생활 정보 블로그. Astro 정적 사이트 → GitHub push → Vercel 자동 배포.
목표: 검색(구글·네이버) 유입을 만드는 부업 사이트. 매일 글 1편 발행 + 사이트 점검.

## 매일 발행 루틴 (자동 실행 시 이 순서를 따를 것)

1. **주제 선정**: `src/content/blog/`의 기존 글 목록을 확인해 **중복되지 않는** 주제를 고른다.
   - 카테고리 풀: 보험(청구·비교·용어), 민원 서류(정부24·홈택스·대법원 인터넷등기소), 정부 지원금·복지 제도, 자동차(검사·세금·보험), 부동산·전월세(계약·확정일자·전입신고), 건강보험·연말정산·세금, 통신·금융 생활 꿀팁
   - 검색 수요가 있는 "방법/절차/총정리/기한/비용" 형태의 주제를 우선한다.
2. **글 작성**: `src/content/blog/영문-슬러그.md` 생성. 아래 품질 기준 준수.
3. **점검(빌드)**: `npm run build` 실행. 실패하면 고친 뒤 재시도.
4. **발행**: `git add -A && git commit && git push` → Vercel이 자동 배포.
5. **보고**: 발행한 글 제목·주제와 빌드 결과를 요약해 남긴다.

## 글 품질 기준 (SEO)

- frontmatter: `title`(핵심 키워드 포함, 25~40자), `description`(80~140자, 검색 결과에 그대로 노출된다고 생각하고 작성), `pubDate`(오늘 날짜 YYYY-MM-DD)
- 본문 1,500자 이상. H2/H3로 구조화, 절차는 번호 목록, 비교는 표 사용
- 반드시 "자주 묻는 질문" 섹션 포함 (2~3개)
- 마지막에 공식 출처 안내 + 인용구(>)로 면책 문구
- **사실 검증 원칙**: 금액·기한·수수료 등 변동 가능한 수치는 단정하지 말고 "공식 사이트에서 확인" 안내를 병기한다. 확실하지 않은 수치는 쓰지 않는다. 의료·법률·투자 조언이 아닌 일반 정보 제공 톤을 유지한다.
- 슬러그는 영문 소문자-하이픈 (예: `year-end-tax-guide.md`)

## 쿠팡 파트너스 제휴 링크 규칙

- **링크는 사장이 파트너스에서 생성해 제공한 것만 사용한다** (`https://link.coupang.com/...` 형식). 에이전트가 임의로 쿠팡 URL을 만들지 않는다.
- 제휴 링크가 들어간 글에는 **본문 맨 아래에 반드시 고지 문구**를 넣는다 (쿠팡 파트너스 의무 사항).
- 글 주제와 실제로 관련 있는 상품만 추천한다. 억지 끼워넣기 금지 (글당 최대 1~2개).
- 삽입 패턴 (마크다운 글 안에 HTML로 삽입):

```html
<div class="product-box">
  <div class="product-label">🛒 함께 보면 좋은 준비물</div>
  <a href="쿠팡파트너스링크" target="_blank" rel="nofollow sponsored noopener">상품명</a>
  <p class="product-note">한 줄 추천 이유 (예: 검사 전 셀프 점검에 쓰는 타이어 공기압 게이지)</p>
</div>
```

- 고지 문구 (본문 마지막, 면책 인용구 위에):

```html
<p class="affiliate-disclosure">이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.</p>
```

## 주간 점검 (주 1회, 발행 루틴에 추가로)

- 배포된 사이트(https://living-note.kr) 접속 확인
- 깨진 링크·오래된 정보가 있는 글 확인, 필요 시 `updatedDate` 추가하며 수정

## 명령어

- 개발 서버: `npm run dev` (localhost:4321)
- 빌드 점검: `npm run build`
- 미리보기: `npm run preview`

## 배포 규칙 (회사 매뉴얼 준수)

- **배포는 `git push origin main`으로만 한다.** Vercel CLI 등으로 직접 배포하지 말 것.
- 배포·서버 구성(Vercel 프로젝트 설정 등)은 기존 방식 그대로 유지하고 임의로 바꾸지 말 것.
- 작업 원칙: 정확성 > 검증 > 최소 변경. 수정 후 반드시 `npm run build`로 검증하고, 검증 없이 성공했다고 보고하지 않는다.

## 구조

- 글: `src/content/blog/*.md` (frontmatter 스키마: `src/content.config.ts`)
- 사이트 상수: `src/consts.ts`
- 레이아웃: `src/layouts/BlogPost.astro` (JSON-LD 포함)
- SEO: sitemap 자동 생성(@astrojs/sitemap), `public/robots.txt`, RSS(`src/pages/rss.xml.js`)
