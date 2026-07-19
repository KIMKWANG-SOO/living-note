# 쿠팡 파트너스 링크 저장소

매일 글 작성 시 이 저장소에서 **글 주제와 실제로 관련 있는 상품**이 있으면 1개 삽입한다.
관련 상품이 없으면 링크 없이 발행한다 (억지 삽입 금지).

사용 규칙:
- 한 글에 최대 1~2개
- 삽입 형식과 의무 고지 문구는 CLAUDE.md의 "쿠팡 파트너스 제휴 링크 규칙" 참조
- 사용한 링크도 저장소에서 지우지 않는다 (여러 글에 재사용 가능)

| 카테고리 | 상품명 | 링크 | 추천 포인트 |
|---|---|---|---|
| 자동차 | 벤딕트 무선 타이어 공기압 주입기 나노 6000mAh | https://link.coupang.com/a/fwaJtbrw0O | 검사 전 셀프 공기압 점검·보충 |
| 해외직구·쇼핑 | 쿠팡 로켓직구 (해외직구 서비스) | https://link.coupang.com/a/fwBb4py5aS | 해외직구·관세·통관 주제 글에서 "간편하게 시작하는 직구" 맥락으로 안내 |
| 정리·서류 | 시스맥스 EL 3서류받침 | https://link.coupang.com/a/fwByAuuK4a | 민원서류·연말정산·세금 글에서 "서류 정리·보관" 맥락 (예: 증빙서류 모아두기) |

<!-- 새 링크 추가 형식: | 카테고리 | 상품명 | 링크 | 한 줄 추천 이유 | -->

## 배너 (카테고리 관련 글 본문 하단, 고지 문구 위에 삽입)

배너는 상품 박스와 달리 글 하단에 넣는다. 삽입 시 아래 HTML을 그대로 사용하고, 반드시 `.coupang-banner` div로 감싼다. 배너가 들어간 글에도 하단 고지 문구는 필수.

### 자동차 (로켓 자동차용품, 728x90)

```html
<div class="coupang-banner">
  <a href="https://link.coupang.com/a/fwbiN16A3M" target="_blank" referrerpolicy="unsafe-url"><img src="https://ads-partners.coupang.com/banners/1008333?trackingCode=AF6461008&subId=&traceId=V0-301-c1744fa69c93f626-I1008333&w=728&h=90" alt="쿠팡 로켓 자동차용품"></a>
</div>
```
