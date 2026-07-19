# 생활정보노트 SEO 감사 보고서 (구글·네이버 노출 관점)

- 감사일: 2026-07-19
- 대상: https://living-note.vercel.app (Astro 정적 사이트, D:\living-note)
- 감사 방법: 소스 코드 직접 열람 + 라이브 사이트 HTML/이미지/사이트맵/RSS 실제 응답 확인
- 원칙: 코드 수정 없음. 제안만. (반영은 마스터 검수 후)

---

## 0. 잘 되어 있는 것 (유지)

실제 확인 결과, 기본기 상당수는 이미 갖춰져 있음:

- `lang="ko"` (BlogPost.astro:30, index.astro:15 등 전 페이지)
- canonical 태그: 라이브 HTML에서 `<link rel="canonical" href="https://living-note.vercel.app/blog/silson-insurance-claim-guide/">` 확인
- sitemap: `@astrojs/sitemap` 적용, `/sitemap-index.xml` → `/sitemap-0.xml` 200 응답, 전체 6개 URL 수록 확인. robots.txt와 `<link rel="sitemap">` 양쪽에서 참조
- robots.txt: 전체 허용 + Sitemap 명시 (public/robots.txt)
- 구글·네이버 사이트 인증 메타 태그 존재 (BaseHead.astro:42-43)
- og:image 유효성: 라이브에서 `https://living-note.vercel.app/_astro/blog-placeholder-1.Bx0Zcyzv.jpg` HEAD 요청 → **200 OK, image/jpeg, 32KB**. 절대 URL로 정상 렌더링됨 (추측 아님, 실측)
- 글 3편의 title/description: 페이지별 고유하고 검색 의도(청구 방법·발급 방법·검사 주기)에 잘 맞음. 프론트매터 품질 양호
- `<time datetime>` 마크업으로 발행일 노출 (FormattedDate.astro) — 네이버·구글 모두 날짜 인식에 유리
- RSS 피드 존재, `<link rel="alternate">`로 head에서 선언, guid isPermaLink 사용

---

## 1. 페이지별 title / description [우선순위: 상]

### 현재 상태 (확인한 증거)
- 홈: 라이브 title = `생활정보노트` 단독 (index.astro:17에서 `SITE_TITLE`만 전달). description은 SITE_DESCRIPTION.
- 글 목록: `전체 글 | 생활정보노트` — 그러나 description이 **홈과 동일한 SITE_DESCRIPTION 재사용** (blog/index.astro:18)
- 글 페이지: 프론트매터 title 그대로, **사이트명 브랜딩 없음** (예: `실손보험 청구 방법 총정리 — 필요 서류, 청구 기한, 실손24 앱 사용법`)
- about: 고유 title/description 있음. 양호.

### 문제/기회
- 홈 title이 브랜드명 한 단어뿐 → "생활정보노트"를 이미 아는 사람 외에는 검색 유입 불가. 핵심 키워드가 title에 없음.
- 홈/글목록 description 중복 → 검색 결과에서 두 페이지가 같은 스니펫으로 노출, 클릭률 손해.
- 글 title에 사이트명이 없어 SERP에서 브랜드 인지 누적이 안 됨. (단, 현재 글 title이 이미 길어(30자+) 사이트명을 붙이면 잘릴 수 있음 — 구글은 보통 50~60자 표시)

### 개선안
1. **src/pages/index.astro:17** — 홈 title에 키워드 포함:
   ```astro
   <BaseHead title={`${SITE_TITLE} — 보험 청구·민원서류·정부지원 생활정보 가이드`} description={SITE_DESCRIPTION} />
   ```
2. **src/pages/blog/index.astro:18** — 목록 전용 description:
   ```astro
   <BaseHead
     title={`전체 글 | ${SITE_TITLE}`}
     description="생활정보노트의 전체 글 목록입니다. 보험 청구, 민원 서류 발급, 자동차 관리 등 절차 중심 가이드를 최신순으로 확인하세요."
   />
   ```
3. **src/layouts/BlogPost.astro:32** — 글 페이지 title에 사이트명 접미사 추가 (title 잘림이 우려되면 보류 가능하나, 통일성 위해 권장):
   ```astro
   <BaseHead title={`${title} | ${SITE_TITLE}`} description={description} />
   ```

---

## 2. Open Graph / 트위터 카드 [우선순위: 상]

### 현재 상태 (확인한 증거)
라이브 글 페이지 HTML head 실측:
```html
<meta property="og:type" content="website">
<meta property="og:image" content="https://living-note.vercel.app/_astro/blog-placeholder-1.Bx0Zcyzv.jpg">
<meta name="twitter:card" content="summary_large_image">
```
- og:image는 **유효한 절대 URL(200, image/jpeg)** — 렌더링 자체는 문제없음.
- 그러나 이 이미지는 Astro 템플릿 기본 **placeholder 이미지**이며, 글 3편 모두 frontmatter에 `heroImage`가 없어(각 md 파일 확인) 전 페이지가 **동일한 무관한 이미지**로 공유됨.
- og:type이 글 페이지에서도 `website` 고정 (BaseHead.astro:46). `article:published_time` 등 아티클 OG 속성 없음.
- twitter는 `twitter:card` 한 줄뿐 — 대부분의 플랫폼이 og:*로 폴백하므로 치명적이진 않으나 `twitter:title/description/image` 명시가 안전.
- og:image:width/height/alt 없음 → 카카오톡·페이스북 첫 공유 시 미리보기 캐시 생성이 느릴 수 있음.

### 문제/기회
- 카카오톡·네이버 밴드·페이스북 공유 시 모든 글이 똑같은 외국풍 placeholder 썸네일 → 클릭률·신뢰도 손해. 한국 트래픽에서 카카오톡 공유 썸네일은 중요.
- 글 페이지 og:type=article + published_time은 구글·네이버 모두 문서 성격 파악에 활용.

### 개선안
1. **콘텐츠 작업**: 글 3편 frontmatter에 각각 주제에 맞는 `heroImage` 추가 (1200×630 권장, src/assets/에 배치):
   ```yaml
   heroImage: '../../assets/silson-claim-hero.jpg'
   ```
   당장 이미지 제작이 어렵다면 최소한 사이트 로고형 기본 OG 이미지(브랜드명 텍스트 포함)라도 제작해 FallbackImage 교체.
2. **src/components/BaseHead.astro** — Props에 `type`(기본 'website')과 `pubDate`를 추가하고:
   ```astro
   interface Props {
     title: string;
     description: string;
     image?: ImageMetadata;
     type?: 'website' | 'article';
     pubDate?: Date;
     updatedDate?: Date;
   }
   ```
   ```html
   <meta property="og:type" content={type} />
   {type === 'article' && pubDate && (
     <meta property="article:published_time" content={pubDate.toISOString()} />
   )}
   {type === 'article' && updatedDate && (
     <meta property="article:modified_time" content={updatedDate.toISOString()} />
   )}
   <meta property="og:image" content={new URL(image.src, Astro.url)} />
   <meta property="og:image:width" content={String(image.width)} />
   <meta property="og:image:height" content={String(image.height)} />
   <meta name="twitter:title" content={title} />
   <meta name="twitter:description" content={description} />
   <meta name="twitter:image" content={new URL(image.src, Astro.url)} />
   ```
3. **src/layouts/BlogPost.astro:32** — 호출부 수정:
   ```astro
   <BaseHead title={title} description={description} image={heroImage} type="article" pubDate={pubDate} updatedDate={updatedDate} />
   ```
   (현재 heroImage가 BaseHead로 전달조차 안 되고 있음 — heroImage를 넣어도 OG에 반영되지 않는 구조)

---

## 3. 구조화 데이터 (JSON-LD) [우선순위: 상]

### 현재 상태 (확인한 증거)
라이브 HTML 실측 — Article 스키마 1개만 출력:
```json
{"@type":"Article","headline":"...","datePublished":"2026-07-17T00:00:00.000Z","mainEntityOfPage":"...","publisher":{"@type":"Organization","name":"생활정보노트"}}
```
- **author 없음, image 없음, publisher.logo 없음** — 구글 리치 결과 검증에서 권장 속성 미비 경고 대상.
- WebSite, BreadcrumbList, FAQPage 스키마 전무.
- 글 3편 모두 `## 자주 묻는 질문` 섹션 보유 (silson 글: Q 3개, jumin 글: Q 2개, car 글도 FAQ 섹션 존재) → **FAQPage 스키마 최적 후보**.
- 부수 발견: **about.astro가 BlogPost 레이아웃을 재사용**해 소개 페이지에도 Article 스키마 + 발행일(2026-07-19)이 출력됨. 소개 페이지가 '글'로 오인될 수 있음.

### 문제/기회
- FAQPage는 구글 SERP에서 접이식 FAQ 리치 결과 노출 가능(현재는 노출 축소 추세지만 문서 이해에는 여전히 유효). BreadcrumbList는 SERP URL 표시 개선.
- Article에 author·image 보강 시 구글 뉴스/디스커버 및 네이버 문서 신뢰도에 유리.

### 개선안
1. **src/layouts/BlogPost.astro** — Article 스키마 보강:
   ```js
   const jsonLd = {
     '@context': 'https://schema.org',
     '@type': 'Article',
     headline: title,
     description,
     datePublished: pubDate.toISOString(),
     ...(updatedDate && { dateModified: updatedDate.toISOString() }),
     mainEntityOfPage: new URL(Astro.url.pathname, Astro.site).href,
     ...(heroImage && { image: new URL(heroImage.src, Astro.site).href }),
     author: { '@type': 'Person', name: '생활정보노트 편집자' }, // 실명/필명 확정 필요
     publisher: {
       '@type': 'Organization',
       name: SITE_TITLE,
       logo: { '@type': 'ImageObject', url: new URL('/favicon.svg', Astro.site).href },
     },
   };
   ```
2. **BreadcrumbList** — BlogPost.astro에 두 번째 JSON-LD 추가:
   ```js
   const breadcrumbLd = {
     '@context': 'https://schema.org',
     '@type': 'BreadcrumbList',
     itemListElement: [
       { '@type': 'ListItem', position: 1, name: '홈', item: Astro.site?.href },
       { '@type': 'ListItem', position: 2, name: '전체 글', item: new URL('/blog/', Astro.site).href },
       { '@type': 'ListItem', position: 3, name: title },
     ],
   };
   ```
   ```astro
   <script type="application/ld+json" set:html={JSON.stringify(breadcrumbLd)} />
   ```
3. **WebSite 스키마** — src/pages/index.astro head에 추가:
   ```js
   const websiteLd = {
     '@context': 'https://schema.org',
     '@type': 'WebSite',
     name: SITE_TITLE,
     description: SITE_DESCRIPTION,
     url: Astro.site?.href,
     inLanguage: 'ko',
   };
   ```
4. **FAQPage 스키마** — frontmatter에 faq 배열을 추가하는 방식 권장:
   - src/content.config.ts 스키마에 추가:
     ```ts
     faq: z.array(z.object({ question: z.string(), answer: z.string() })).optional(),
     ```
   - 각 글 frontmatter에 본문 FAQ와 동일한 Q/A를 기입 (본문과 불일치하면 스팸 판정 위험이 있으므로 반드시 본문 내용과 일치시킬 것):
     ```yaml
     faq:
       - question: '오래된 진료 내역도 청구할 수 있나요?'
         answer: '네. 진료일로부터 3년 이내라면 청구할 수 있습니다.'
     ```
   - BlogPost.astro에서 조건부 출력:
     ```js
     const faqLd = faq && {
       '@context': 'https://schema.org',
       '@type': 'FAQPage',
       mainEntity: faq.map((f) => ({
         '@type': 'Question', name: f.question,
         acceptedAnswer: { '@type': 'Answer', text: f.answer },
       })),
     };
     ```
5. **src/pages/about.astro** — BlogPost 레이아웃 대신 별도 정적 레이아웃 사용(또는 BlogPost에 `isArticle` prop을 두어 about에서는 Article JSON-LD·발행일을 출력하지 않게). 소개 페이지에는 Organization/AboutPage 스키마가 적합.

---

## 4. 네이버 노출 특화 [우선순위: 상]

### 현재 상태 (확인한 증거)
- naver-site-verification 메타 존재 (BaseHead.astro:43) — 서치어드바이저 등록은 된 것으로 보임 (등록 상태 자체는 코드로 확인 불가 → **확인 못 함**: 서치어드바이저 콘솔 접근 권한 없음. 마스터가 '웹마스터 도구 > 요청 > RSS 제출/사이트맵 제출' 완료 여부 확인 필요).
- RSS 실측: 채널에 `<language>` 없음, 각 item에 **본문 전체(content:encoded) 없음, author 없음, category 없음**. description(요약)만 존재.
- 페이지에 저자 정보 표시 없음 (레이아웃·푸터·JSON-LD 모두 무저자).
- 발행일은 `<time datetime>`으로 명확히 노출 — 양호.

### 문제/기회
- 네이버는 RSS 품질을 중시하며, 본문 포함 피드가 수집 품질에 유리. 저자·연락처가 확인되는 사이트를 신뢰(E-A-T 유사 기준). 현재 사이트는 "누가 쓰는지"가 어디에도 없음.

### 개선안
1. **src/pages/rss.xml.js** — 본문 포함 + 채널 메타 보강:
   ```js
   import { getCollection } from 'astro:content';
   import rss from '@astrojs/rss';
   import sanitizeHtml from 'sanitize-html';
   import MarkdownIt from 'markdown-it';
   const parser = new MarkdownIt();

   export async function GET(context) {
     const posts = await getCollection('blog');
     return rss({
       title: SITE_TITLE,
       description: SITE_DESCRIPTION,
       site: context.site,
       items: posts.map((post) => ({
         title: post.data.title,
         description: post.data.description,
         pubDate: post.data.pubDate,
         link: `/blog/${post.id}/`,
         content: sanitizeHtml(parser.render(post.body)),
       })),
       customData: '<language>ko</language>',
     });
   }
   ```
   (의존성 추가 필요: `npm i sanitize-html markdown-it` — Astro 공식 RSS 문서의 권장 패턴)
2. **저자 정보 노출**: BlogPost.astro 날짜 아래에 저자 표기 추가 + about 페이지에 운영자 소개·연락 수단(이메일) 명시. JSON-LD author와 일치시킬 것 (3-1 참조).
3. **서치어드바이저 운영 체크리스트** (코드 외 작업): RSS 주소(https://living-note.vercel.app/rss.xml)와 사이트맵 제출, '웹 페이지 수집' 요청으로 글 3편 수동 수집 요청.

---

## 5. 내부 링크 구조 [우선순위: 중]

### 현재 상태 (확인한 증거)
- 글 본문 3편 전체에서 내부 링크(`/blog/...`) 검색 결과 **0건** (grep 확인). 글끼리 연결이 전혀 없음.
- 내부 링크는 Header 내비게이션(홈/전체 글/소개)과 목록 페이지의 글 링크가 전부.
- 태그·카테고리 체계 없음 (content.config.ts 스키마에 tags 필드 없음).

### 문제/기회
- 글이 3편뿐이라 지금은 영향이 작지만, 글이 늘수록 내부 링크 부재는 크롤링 깊이·주제 클러스터 형성에 불리. 지금 구조를 잡아두는 것이 저비용.

### 개선안
1. **관련 글 컴포넌트** — src/components/RelatedPosts.astro 신설, BlogPost.astro의 `<slot />` 아래에 배치. 초기에는 최신 글 중 현재 글 제외 2편 노출로 시작:
   ```astro
   ---
   import { getCollection } from 'astro:content';
   const { currentId } = Astro.props;
   const related = (await getCollection('blog'))
     .filter((p) => p.id !== currentId)
     .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
     .slice(0, 2);
   ---
   <aside class="related">
     <h2>함께 보면 좋은 글</h2>
     <ul>{related.map((p) => <li><a href={`/blog/${p.id}/`}>{p.data.title}</a></li>)}</ul>
   </aside>
   ```
   (BlogPost.astro가 post.id를 받도록 [...slug].astro에서 prop 전달 필요)
2. **본문 내 문맥 링크** (콘텐츠 작업): 예 — 실손보험 글의 '필요 서류' 단락에서 주민등록등본 발급 글로, 자동차 검사 글에서 정부24 관련 언급 시 등본 글로 상호 링크. 글마다 최소 1~2개.
3. **tags 필드 도입** — content.config.ts에 `tags: z.array(z.string()).default([])` 추가하고, 글이 10편 이상 되면 태그별 목록 페이지(/tags/[tag].astro) 생성. 지금은 스키마만 준비해도 됨.

---

## 6. 놓친 기본기 [우선순위: 중~하]

### 현재 상태 (확인한 증거)
- canonical / lang / sitemap / robots: 모두 정상 (0장 참조).
- sitemap-0.xml 실측: `<loc>`만 있고 **`<lastmod>` 없음**.
- 블로그 목록 페이지(blog/index.astro): 페이지에 `<h1>`이 없음 (글 제목이 `<h4>`, 사이트명이 Header의 `<h2>`). 홈은 `<h1>` 있음 — 양호.
- 글 목록·상세의 hero 이미지 `alt=""` (blog/index.astro:99, BlogPost.astro:80) — 장식 이미지로는 허용되나, 의미 있는 heroImage 도입 시 alt 필요.
- 404 페이지: src/pages/404.astro **없음** (Glob 확인) — Vercel 기본 404가 노출됨.
- meta author / publisher 태그 없음.

### 개선안
1. **[하] sitemap lastmod** — astro.config.mjs의 sitemap 옵션에 serialize 훅으로 lastmod 부여(간단 버전은 빌드 시각, 정석은 글 updatedDate 매핑):
   ```js
   sitemap({ serialize(item) { item.lastmod = new Date().toISOString(); return item; } })
   ```
   네이버는 사이트맵 갱신 신호에 비교적 민감하므로 저비용 대비 효과 있음.
2. **[중] blog/index.astro에 h1 추가** — `<main>` 상단에:
   ```astro
   <h1>전체 글</h1>
   ```
   (스타일은 기존 .title 계열 재사용)
3. **[하] 404 페이지** — src/pages/404.astro 생성, 홈·전체 글 링크 포함. 잘못된 URL 유입 시 이탈 방지 + 내부 링크 회복 경로.
4. **[하] heroImage 도입 시 alt 필수화** — BlogPost.astro:80의 `alt=""`를 `alt={title}` 수준으로라도 변경.
5. **[하] 커스텀 도메인 검토** (코드 외) — `*.vercel.app` 서브도메인은 네이버에서 신뢰도가 낮게 평가될 수 있음. 장기 운영 시 자체 도메인 연결 후 astro.config.mjs의 `site` 값 변경 + 서치어드바이저/서치콘솔 재등록. (부담되면 후순위)

---

## 확인 못 한 항목

- **네이버 서치어드바이저 / 구글 서치콘솔의 실제 등록·수집 상태**: 콘솔 로그인 권한이 없어 코드·공개 응답으로는 확인 불가. verification 메타는 존재하므로 등록 시도는 된 것으로 추정.
- **RSS 응답 헤더의 charset**: 로컬 콘솔에서 디코딩이 깨져 보였으나 XML 선언이 UTF-8이고 브라우저 파싱 기준 문제 없을 가능성이 높음. 배포 환경에서 `Content-Type: application/xml; charset=utf-8` 헤더가 붙는지 마스터 확인 권장 (vercel.json headers로 강제 가능).
- **실제 검색 노출 현황(색인 여부, 순위)**: 검색 결과 스크래핑은 수행하지 않음.

---

## 우선순위 요약표

| 순위 | 항목 | 파일 | 기대 효과 |
|---|---|---|---|
| 상 | 글별 heroImage + OG article 속성 + heroImage가 BaseHead로 전달 안 되는 구조 수정 | BaseHead.astro, BlogPost.astro, 글 3편 | 공유 썸네일·CTR |
| 상 | Article 스키마 보강(author/image/logo) + FAQPage + BreadcrumbList + WebSite | BlogPost.astro, index.astro, content.config.ts | 리치 결과 |
| 상 | RSS 본문 포함 + language + 저자 정보 노출 | rss.xml.js, BlogPost.astro, about.astro | 네이버 수집 품질 |
| 상 | 홈 title 키워드화, 목록 description 고유화 | index.astro, blog/index.astro | 검색 스니펫 |
| 중 | 관련 글 컴포넌트 + 본문 문맥 링크 | RelatedPosts.astro(신규), 글 3편 | 크롤링·체류 |
| 중 | about의 Article 스키마 오출력 분리, blog 목록 h1 | about.astro, blog/index.astro | 문서 성격 명확화 |
| 하 | sitemap lastmod, 404 페이지, alt, 커스텀 도메인 | astro.config.mjs 외 | 위생 항목 |
