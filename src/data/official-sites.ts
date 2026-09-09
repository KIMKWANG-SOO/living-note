// 글 본문이 인용한 공식 사이트를 "바로 가기" 버튼으로 바꾸기 위한 목록.
//
// 규칙
// - URL은 기억으로 적지 않는다. 2026-09-09에 전부 실제 응답을 확인했다.
//   (bare 도메인은 막히고 www만 열리는 곳이 여럿이라, 확인된 주소를 그대로 적어둔다.)
// - `match`는 글 본문에 실제로 등장하는 문자열이다. 본문에 그 문자열이 있을 때만
//   버튼이 붙으므로 글이 언급하지 않은 사이트가 끼어들지 않는다.
// - 여기에 없는 사이트를 임의로 추가하지 않는다. 글이 인용한 도메인만 등록한다.
// - 기관이 통폐합되면 여기서 새 주소로 바꾼다. 옛 도메인을 `match`에 남겨두면
//   옛 주소를 적은 글도 새 사이트로 안내된다(예: ei.go.kr → 고용24).

export type OfficialSite = {
	/** 버튼에 보일 이름 */
	name: string;
	/** 실제 이동할 주소 (2026-09-09 응답 확인 완료) */
	url: string;
	/** 본문에서 이 사이트를 가리킨다고 볼 문자열들 */
	match: string[];
	/** 무엇을 할 수 있는 곳인지 한 줄 설명 */
	note: string;
};

export const OFFICIAL_SITES: OfficialSite[] = [
	{
		name: '정부24',
		url: 'https://www.gov.kr/',
		match: ['gov.kr'],
		note: '민원 서류 발급과 정부 서비스 신청',
	},
	{
		name: '국세청 홈택스',
		url: 'https://hometax.go.kr/',
		match: ['hometax.go.kr'],
		note: '종합소득세·부가세 신고, 연말정산, 현금영수증',
	},
	{
		name: '위택스',
		url: 'https://www.wetax.go.kr/',
		match: ['wetax.go.kr'],
		note: '취득세·자동차세 등 지방세 신고와 납부',
	},
	{
		name: '서울시 ETAX',
		url: 'https://etax.seoul.go.kr/',
		match: ['etax.seoul.go.kr'],
		note: '서울시 지방세 조회와 납부',
	},
	{
		name: '복지로',
		url: 'https://www.bokjiro.go.kr/',
		match: ['bokjiro.go.kr'],
		note: '복지 제도 모의계산과 온라인 신청',
	},
	{
		name: '고용24',
		url: 'https://www.work24.go.kr/',
		match: ['work24.go.kr', 'ei.go.kr', 'work.go.kr'],
		note: '실업급여·육아휴직급여 신청, 구직 등록 (옛 고용보험·워크넷 통합)',
	},
	{
		name: '국민건강보험',
		url: 'https://www.nhis.or.kr/',
		match: ['nhis.or.kr', '국민건강보험공단'],
		note: '건강보험 자격 확인, 보험료 조회, 환급금 신청',
	},
	{
		name: '노인장기요양보험',
		url: 'https://www.longtermcare.or.kr/',
		match: ['longtermcare.or.kr'],
		note: '장기요양 등급 신청과 판정 결과 조회',
	},
	{
		name: '국민연금공단',
		url: 'https://www.nps.or.kr/',
		match: ['nps.or.kr'],
		note: '예상수령액 조회, 연금 청구, 임의가입 신청',
	},
	{
		name: '동물보호관리시스템',
		url: 'https://www.animal.go.kr/',
		match: ['animal.go.kr'],
		note: '동물등록, 유실·유기동물 조회와 신고',
	},
	{
		name: '자동차365',
		url: 'https://www.car365.go.kr/',
		match: ['car365.go.kr', 'ecar.go.kr', 'car.go.kr'],
		note: '자동차 등록·검사·이력 조회 (옛 자동차민원 대국민포털)',
	},
	{
		name: '금융소비자 포털 파인',
		url: 'https://fine.fss.or.kr/',
		match: ['fine.fss.or.kr'],
		note: '휴면예금·보험금 조회, 금융 정보 확인',
	},
	{
		name: '금융감독원',
		url: 'https://www.fss.or.kr/',
		match: ['fss.or.kr'],
		note: '금융 민원·분쟁 조정 신청(1332)',
	},
	{
		name: '계좌정보통합관리서비스',
		url: 'https://payinfo.or.kr/',
		match: ['payinfo.or.kr', 'accountinfo.or.kr'],
		note: '내 계좌 한눈에 조회, 잠자는 돈 찾기, 자동이체 정리',
	},
	{
		name: '국세청',
		url: 'https://www.nts.go.kr/',
		match: ['nts.go.kr'],
		note: '세법 안내와 세무 상담(126)',
	},
	{
		name: '고용노동부',
		url: 'https://www.moel.go.kr/',
		match: ['moel.go.kr'],
		note: '노동 관련 제도 안내와 민원(1350)',
	},
	{
		name: '전자가족관계등록시스템',
		url: 'https://efamily.scourt.go.kr/',
		match: ['efamily.scourt.go.kr'],
		note: '가족관계·혼인관계증명서 발급',
	},
	{
		name: '가족관계 온라인 신고',
		url: 'https://ecfs.scourt.go.kr/',
		match: ['ecfs.scourt.go.kr'],
		note: '출생·사망 등 가족관계 신고',
	},
	{
		name: '인터넷등기소',
		url: 'https://www.iros.go.kr/',
		match: ['iros.go.kr'],
		note: '등기부등본 열람·발급, 등기 신청',
	},
	{
		name: 'Msafer 명의도용방지',
		url: 'https://www.msafer.or.kr/',
		match: ['msafer.or.kr'],
		note: '내 명의로 개통된 휴대폰 조회와 가입 제한',
	},
	{
		name: '스마트초이스',
		url: 'https://www.smartchoice.or.kr/',
		match: ['smartchoice.or.kr'],
		note: '통신 요금제 비교, 미환급금 조회',
	},
	{
		name: '무공해차 통합누리집',
		url: 'https://ev.or.kr/',
		match: ['ev.or.kr'],
		note: '전기차 보조금 확인과 구매 지원 신청',
	},
	{
		name: '한국장학재단',
		url: 'https://www.kosaf.go.kr/',
		match: ['kosaf.go.kr'],
		note: '국가장학금·학자금대출 신청',
	},
	{
		name: '대한법률구조공단',
		url: 'https://www.klac.or.kr/',
		match: ['klac.or.kr'],
		note: '무료 법률 상담(132)과 소송 구조',
	},
	{
		name: '찾기쉬운 생활법령정보',
		url: 'https://easylaw.go.kr/',
		match: ['easylaw.go.kr'],
		note: '생활 법률을 쉬운 말로 정리한 안내',
	},
	{
		name: '국가법령정보센터',
		url: 'https://law.go.kr/',
		match: ['law.go.kr'],
		note: '법령·시행령 원문 확인',
	},
	{
		name: '예금보험공사 금융안심포털',
		url: 'https://fins.kdic.or.kr/',
		match: ['fins.kdic.or.kr', 'kdic.or.kr'],
		note: '예금자보호 대상 확인, 착오송금 반환 신청',
	},
	{
		name: '경찰청 범죄경력 발급',
		url: 'https://crims.police.go.kr/',
		match: ['crims.police.go.kr'],
		note: '범죄·수사경력 회보서 인터넷 발급',
	},
	{
		name: '관세청 유니패스',
		url: 'https://unipass.customs.go.kr/csp/index.do',
		match: ['unipass.customs.go.kr'],
		note: '해외직구 통관 조회, 개인통관고유부호 발급',
	},
	{
		name: '안전운전 통합민원',
		url: 'https://www.safedriving.or.kr/',
		match: ['safedriving.or.kr'],
		note: '운전면허 갱신·적성검사 예약, 벌점 조회',
	},
	{
		name: '국토교통부',
		url: 'https://www.molit.go.kr/',
		match: ['molit.go.kr'],
		note: '부동산·교통 제도 안내',
	},
	{
		name: '외교부 해외안전여행',
		url: 'https://0404.go.kr/',
		match: ['0404.go.kr'],
		note: '여행경보 확인, 영사조력·신속해외송금 안내',
	},
	{
		name: '한국주택금융공사',
		url: 'https://www.hf.go.kr/',
		match: ['hf.go.kr'],
		note: '주택연금·전세자금보증 신청',
	},
	{
		name: '층간소음 이웃사이센터',
		url: 'https://floor.noiseinfo.or.kr/',
		match: ['floor.noiseinfo.or.kr'],
		note: '층간소음 상담 신청과 소음 측정',
	},
	{
		name: '금융위원회',
		url: 'https://www.fsc.go.kr/',
		match: ['fsc.go.kr'],
		note: '금융 정책과 제도 발표 확인',
	},
	{
		name: '보건복지부',
		url: 'https://www.mohw.go.kr/',
		match: ['mohw.go.kr'],
		note: '복지·보건 제도 안내와 보도자료',
	},
	{
		name: '보험다모아',
		url: 'https://e-insmarket.or.kr/',
		match: ['e-insmarket.or.kr'],
		note: '자동차·실손보험 보험료 한눈에 비교',
	},
	{
		name: '카히스토리',
		url: 'https://www.carhistory.or.kr/',
		match: ['carhistory.or.kr'],
		note: '중고차 사고이력 조회',
	},
	{
		name: '과실비율 정보포털',
		url: 'https://accident.knia.or.kr/',
		match: ['accident.knia.or.kr'],
		note: '사고 유형별 과실비율 기준 확인',
	},
	{
		name: '자동차보험 가입경력 조회',
		url: 'https://carinfo.knia.or.kr/',
		match: ['carinfo.knia.or.kr'],
		note: '보험 가입경력·할인할증등급 확인',
	},
	{
		name: '4대사회보험 정보연계센터',
		url: 'https://www.4insure.or.kr/',
		match: ['4insure.or.kr'],
		note: '4대보험 가입 내역 확인, 두루누리 지원 신청',
	},
	{
		name: '여신금융협회',
		url: 'https://www.crefia.or.kr/',
		match: ['crefia.or.kr'],
		note: '카드포인트 통합조회와 현금 전환',
	},
	{
		name: '신용회복위원회',
		url: 'https://www.ccrs.or.kr/',
		match: ['ccrs.or.kr'],
		note: '개인워크아웃·채무조정 신청(1600-5500)',
	},
	{
		name: '고향사랑e음',
		url: 'https://ilovegohyang.go.kr/',
		match: ['ilovegohyang.go.kr'],
		note: '고향사랑기부와 답례품 신청',
	},
	{
		name: '도시가스 캐시백',
		url: 'https://k-gascashback.or.kr/',
		match: ['k-gascashback.or.kr'],
		note: '도시가스 절약 캐시백 참여 신청',
	},
	{
		name: '희망두배 청년통장',
		url: 'https://account.welfare.seoul.kr/',
		match: ['account.welfare.seoul.kr'],
		note: '서울시 청년통장 신청과 자격 확인',
	},
	{
		name: 'ISIC 국제학생증',
		url: 'https://isic.co.kr/',
		match: ['isic.co.kr'],
		note: '국제학생증 발급 신청',
	},
	{
		name: '하이패스',
		url: 'https://www.hipass.co.kr/',
		match: ['hipass.co.kr'],
		note: '미납 통행료 조회와 납부, 단말기 등록',
	},
	{
		name: '사이버교통안전교육',
		url: 'https://www.cyberts.kr/',
		match: ['cyberts.kr'],
		note: '교통안전교육 온라인 수강',
	},
	{
		name: '한전 전기차 충전서비스',
		url: 'https://evc.kepco.co.kr/',
		match: ['evc.kepco.co.kr'],
		note: '전기차 충전 카드 발급과 요금 조회',
	},
	{
		name: 'SRT 예매',
		url: 'https://etk.srail.kr/',
		match: ['srail.kr'],
		note: 'SRT 승차권 예매와 반환',
	},
	{
		name: '에너지바우처',
		url: 'https://www.energyv.or.kr/',
		match: ['energyv.or.kr'],
		note: '에너지바우처 신청과 잔액 확인',
	},
	{
		name: '소비자상담센터',
		url: 'https://15990903.or.kr/',
		match: ['15990903.or.kr'],
		note: '소비자 피해 상담 접수(1372)',
	},
	{
		name: '한국소비자원',
		url: 'https://www.kca.go.kr/',
		match: ['kca.go.kr', '한국소비자원'],
		note: '소비자분쟁해결기준 확인, 피해 구제 신청',
	},
	{
		name: '여권안내',
		url: 'https://www.passport.go.kr/',
		match: ['passport.go.kr'],
		note: '여권 발급 기관 안내, 수수료와 준비물 확인',
	},
	{
		name: '하이코리아',
		url: 'https://www.hikorea.go.kr/',
		match: ['hikorea.go.kr', 'ses.go.kr'],
		note: '출입국 민원, 자동출입국심사 등록 안내',
	},
	{
		name: '한전 사이버지점',
		url: 'https://cyber.kepco.co.kr/ckepco/',
		match: ['cyber.kepco.co.kr', '한국전력'],
		note: '전기요금 조회와 납부, 요금제 확인',
	},
];

/**
 * 글 본문에서 실제로 인용된 사이트만 골라낸다.
 * 문서에 없는 사이트를 임의로 끼워 넣지 않는 것이 이 함수의 핵심이다.
 */
export function findCitedSites(body: string): OfficialSite[] {
	return OFFICIAL_SITES.filter((site) => site.match.some((token) => body.includes(token)));
}
