// 구글 서치콘솔 Search Analytics 실측 데이터 조회
// 사용법: node marketing/tools/search-console-check.mjs [--days 28]
import { readFileSync } from "node:fs";
import { GoogleAuth } from "google-auth-library";

const KEY_PATH = new URL("../../.credentials/search-console-key.json", import.meta.url);
const SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly"];

const daysArg = process.argv.indexOf("--days");
const days = daysArg !== -1 ? Number(process.argv[daysArg + 1]) : 28;

function fmtDate(d) {
  return d.toISOString().slice(0, 10);
}

async function main() {
  const keyFile = JSON.parse(readFileSync(KEY_PATH, "utf-8"));
  const auth = new GoogleAuth({ credentials: keyFile, scopes: SCOPES });
  const client = await auth.getClient();

  // 1. 이 서비스 계정이 접근 가능한 속성 목록 확인 (도메인/URL-접두어 형식 자동 판별)
  const sitesRes = await client.request({
    url: "https://www.googleapis.com/webmasters/v3/sites",
  });
  const sites = sitesRes.data.siteEntry ?? [];
  const target = sites.find((s) => s.siteUrl.includes("living-note.kr"));

  if (!target) {
    console.error("접근 가능한 속성 중 living-note.kr을 찾을 수 없습니다.");
    console.error(
      "→ Search Console > 설정 > 사용자 및 권한에 서비스 계정 이메일이 추가됐는지 확인하세요."
    );
    console.error("현재 접근 가능한 속성:", sites.map((s) => s.siteUrl));
    process.exit(1);
  }

  console.log(`속성: ${target.siteUrl} (권한: ${target.permissionLevel})`);

  const endDate = new Date();
  endDate.setDate(endDate.getDate() - 3); // 서치콘솔 데이터는 통상 2~3일 지연
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - days);

  // 2. 전체 요약 (사이트 전체 클릭/노출/CTR/평균순위)
  const summaryRes = await client.request({
    url: `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(
      target.siteUrl
    )}/searchAnalytics/query`,
    method: "POST",
    data: {
      startDate: fmtDate(startDate),
      endDate: fmtDate(endDate),
      dimensions: [],
    },
  });
  const summary = summaryRes.data.rows?.[0];
  console.log(`\n=== 최근 ${days}일 요약 (${fmtDate(startDate)} ~ ${fmtDate(endDate)}) ===`);
  if (summary) {
    console.log(`클릭: ${summary.clicks}`);
    console.log(`노출: ${summary.impressions}`);
    console.log(`CTR: ${(summary.ctr * 100).toFixed(2)}%`);
    console.log(`평균 순위: ${summary.position.toFixed(2)}`);
  } else {
    console.log("데이터 없음 (아직 색인/노출이 없을 수 있음)");
  }

  // 3. 페이지별 상세 (노출 많은 순)
  const pageRes = await client.request({
    url: `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(
      target.siteUrl
    )}/searchAnalytics/query`,
    method: "POST",
    data: {
      startDate: fmtDate(startDate),
      endDate: fmtDate(endDate),
      dimensions: ["page"],
      rowLimit: 25,
    },
  });
  const pageRows = pageRes.data.rows ?? [];
  console.log(`\n=== 페이지별 노출 상위 (${pageRows.length}개) ===`);
  for (const row of pageRows.sort((a, b) => b.impressions - a.impressions)) {
    console.log(
      `- ${row.keys[0]} | 클릭 ${row.clicks} | 노출 ${row.impressions} | 평균순위 ${row.position.toFixed(
        2
      )}`
    );
  }

  // 4. 검색어별 상세 (노출 많은 순)
  const queryRes = await client.request({
    url: `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(
      target.siteUrl
    )}/searchAnalytics/query`,
    method: "POST",
    data: {
      startDate: fmtDate(startDate),
      endDate: fmtDate(endDate),
      dimensions: ["query"],
      rowLimit: 25,
    },
  });
  const queryRows = queryRes.data.rows ?? [];
  console.log(`\n=== 검색어별 노출 상위 (${queryRows.length}개) ===`);
  for (const row of queryRows.sort((a, b) => b.impressions - a.impressions)) {
    console.log(
      `- "${row.keys[0]}" | 클릭 ${row.clicks} | 노출 ${row.impressions} | 평균순위 ${row.position.toFixed(
        2
      )}`
    );
  }
}

main().catch((err) => {
  console.error("에러:", err.response?.data ?? err.message);
  process.exit(1);
});
