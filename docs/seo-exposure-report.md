# 생활정보노트 검색 노출 점검 보고서

- 점검일: 2026-07-19 (배포 당일)
- 대상: https://living-note.vercel.app (로컬 소스: D:\living-note, Astro + @astrojs/sitemap)
- 전제: 구글 서치콘솔·네이버 서치어드바이저 소유권 확인 및 사이트맵 제출 완료 상태

---

## 1. 확인 결과 요약

| 항목 | 결과 | 증거 |
|---|---|---|
| 구글 `site:living-note.vercel.app` 검색 | **색인된 페이지 0건** | 웹 검색 결과에 해당 도메인 페이지가 하나도 없음. 다른 vercel.app 노트 앱들만 반환됨 |
| 구글 브랜드명 "생활정보노트" 검색 | **본 사이트 미노출** | life-note.co.kr(동명의 타 사이트), mylifenote.ai, TikTok 계정만 노출. living-note.vercel.app 없음 |
| 네이버 `site:` 검색 | **확인 못 함** | WebFetch가 search.naver.com 접근을 차단당함 ("unable to fetch from search.naver.com"). 결과 유무를 실측하지 못했으므로 노출 여부 단정 불가. 브라우저에서 수동 확인 필요 |
| /robots.txt | **정상 (200)** | `User-agent: * / Allow: /` + `Sitemap: https://living-note.vercel.app/sitemap-index.xml`. 크롤링 차단 없음 |
| /sitemap-index.xml | **정상** | 유효한 XML, sitemap-0.xml 1개 참조 |
| /sitemap-0.xml | **정상, URL 6건** | `/`, `/about/`, `/blog/`, 블로그 글 3건. 단, **lastmod 없음** |
| /rss.xml | **정상, item 3건** | RSS 2.0 유효. 글 3건 (7/17, 7/18, 7/19 발행) |
| 홈페이지 응답 | **정상 (200)** | HTML 정상 로드, noindex 없음 |

### 색인 대상 콘텐츠 현황
- 게시글 3건:
  1. 자동차 정기검사 총정리 (2026-07-19)
  2. 주민등록등본 인터넷 발급 방법 (2026-07-18)
  3. 실손보험 청구 방법 총정리 (2026-07-17)

---

## 2. 사이트 기술 상태 (소스 코드 실측)

`D:\living-note\src` 코드 확인 결과, 기본 SEO 골격은 갖춰져 있음:

- `src/components/BaseHead.astro`: `<title>`, meta description, canonical URL, OG 태그(og:locale ko_KR 포함), twitter:card, 구글/네이버 사이트 인증 메타 태그 모두 존재
- `src/layouts/BlogPost.astro`: 블로그 글에 `Article` 타입 JSON-LD 삽입됨
- `astro.config.mjs`: `site` 설정 정상, sitemap 통합 활성화
- `robots.txt`: 전체 허용 + 사이트맵 명시

참고: WebFetch로 홈페이지를 가져왔을 때 head 태그가 요약에서 누락됐으나, 이는 도구의 마크다운 변환 특성 때문이며 소스 코드에서 태그 존재를 직접 확인함. **noindex, 크롤링 차단, 5xx 오류 등 기술적 차단 요인은 발견되지 않음.**

---

## 3. 원인 분석

노출이 안 되는 원인은 기술적 결함이 아니라 다음 두 가지로 판단됨:

### 3-1. 색인 소요 기간 미경과 (주원인)
- 사이트가 **오늘(2026-07-19) 처음 배포**됐고, 가장 오래된 글도 7/17 발행분임.
- 구글은 신규 도메인의 경우 사이트맵 제출 후 색인까지 통상 수일~수주 소요. 네이버는 신규 사이트 색인이 더 느린 편(수주 이상)으로 알려져 있음.
- robots.txt·사이트맵·메타 태그가 모두 정상이므로, 현 시점의 미노출은 **정상 범위**임.

### 3-2. 콘텐츠 양·신뢰 신호 부족 (부차 원인)
- 색인 대상 페이지가 총 6개(글 3건)로 매우 적음. 검색엔진이 크롤링 예산을 배정하고 사이트를 신뢰하기에는 콘텐츠 볼륨이 부족함.
- 외부에서 이 도메인으로 들어오는 링크(백링크)가 사실상 0으로 추정됨 — 브랜드명 검색에서도 전혀 잡히지 않음.
- 브랜드명 "생활정보노트"는 기존 사이트 life-note.co.kr 및 유사 서비스(Life Note 등)와 검색 결과에서 경쟁 관계에 있어, 색인 이후에도 브랜드 검색 상위 노출에 시간이 걸릴 수 있음.

### 확인 못 한 항목
- **네이버 실제 색인 여부**: search.naver.com이 자동화 접근을 차단하여 실측 불가. 네이버 서치어드바이저의 "웹 페이지 수집" 및 "사이트 진단" 메뉴에서 수동 확인 권장.
- 구글 서치콘솔 내부 색인 상태(커버리지 리포트): 계정 접근이 필요하여 확인 못 함.

---

## 4. 개선 제안 (우선순위순, 코드 반영 가능 항목)

### P1 — 사이트맵에 lastmod 추가
- 현재 sitemap-0.xml에 lastmod가 없어 검색엔진이 페이지 갱신 여부를 판단할 수 없음.
- `astro.config.mjs`의 sitemap 통합에 `serialize` 옵션으로 각 글의 pubDate/updatedDate를 lastmod로 출력하도록 설정.

### P1 — 구조화 데이터 보강
- `BlogPost.astro`의 JSON-LD `Article`에 누락 필드 추가: `image`, `author`(Person), `publisher.logo`.
- 홈/블로그 목록 페이지에 `WebSite` + `Blog` JSON-LD 추가 (현재 글 페이지에만 있음).
- 글 페이지에 `BreadcrumbList` JSON-LD 추가 — 검색 결과에 경로 표시로 CTR 개선.
- 절차형 콘텐츠(등본 발급, 보험 청구 등)에 `HowTo` 또는 `FAQPage` 스키마 추가 — 리치 결과 노출 가능성.

### P2 — 메타 태그 보완
- `og:type`이 모든 페이지에서 `website`로 고정되어 있음 → 블로그 글에서는 `article`로 출력하고 `article:published_time`, `article:modified_time` 추가 (`BaseHead.astro`에 prop 추가).
- `twitter:title`, `twitter:description`, `twitter:image`를 명시적으로 추가.
- 블로그 글 hero 이미지의 `alt`가 현재 빈 문자열(`alt=""`) → 제목 기반 대체 텍스트 부여.

### P2 — 내부 링크 강화
- 글 하단에 "관련 글" 섹션 추가 (같은 카테고리/태그 기준). 현재 글 3건이 서로 연결되지 않아 크롤러의 페이지 발견 경로가 목록 페이지뿐임.
- 본문 내에서 관련 글 상호 링크 (예: 실손보험 글 ↔ 등본 발급 글).

### P3 — 콘텐츠·운영 (코드 외 병행 사항)
- 콘텐츠 볼륨 확대: 최소 15~20건 이상 꾸준히 발행 — 현재 3건으로는 색인·체류 신호 모두 부족.
- 구글 서치콘솔 "URL 검사 → 색인 생성 요청"으로 글 6개 URL 개별 수동 요청 (신규 사이트에 가장 즉효).
- 네이버 서치어드바이저 "웹 페이지 수집 요청" 동일하게 실행.
- 카테고리/태그 페이지 도입 시 사이트 구조 신호 개선 (Astro content collection에 tags 필드 추가).

---

## 5. 결론

- **구글·네이버 모두 현재 미노출** (구글: 실측으로 0건 확인, 네이버: 접근 차단으로 실측 못 했으나 배포 당일이므로 색인 전일 가능성이 높음).
- **기술적 차단 요인 없음**: robots.txt, 사이트맵, RSS, 메타 태그, JSON-LD 모두 정상 동작 확인.
- **주원인은 "배포 당일 + 콘텐츠 3건"이라는 시간·볼륨 문제**이며, 이는 결함이 아니라 정상적인 색인 대기 상태임.
- 단기 액션: 서치콘솔/서치어드바이저에서 수동 색인 요청 + P1 항목(lastmod, 구조화 데이터) 반영 후 1~2주 뒤 재점검 권장.
