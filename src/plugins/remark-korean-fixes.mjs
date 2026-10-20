// 한국어 본문에서 마크다운 표준 규칙 때문에 생기는 두 가지 깨짐을 바로잡는 remark 플러그인.
//
// 1) 자동링크 괄호 깨짐
//    "정부24(www.gov.kr)에서"처럼 주소 뒤에 닫는 괄호와 한글이 붙으면, GFM 자동링크가
//    ")에서"까지 주소로 삼켜 http://www.gov.kr)에서 같은 깨진 링크를 만든다.
//    짝이 없는 닫는 괄호에서 링크를 끊고, 나머지는 일반 글자로 돌려놓는다.
//
// 2) 굵게 표시 깨짐
//    "**20일(유급)**로"처럼 닫는 **가 괄호 같은 문장부호 뒤에 오고 바로 한글이 붙으면
//    CommonMark 규칙상 굵게로 인식되지 않아 별표가 화면에 그대로 보인다.
//    파싱 후 글자로 남은 ** 짝을 찾아 굵게(strong)로 바꾼다.

function isAutolink(node) {
	if (node.type !== 'link' || node.children.length !== 1) return false;
	const child = node.children[0];
	if (child.type !== 'text') return false;
	const v = child.value;
	return node.url === v || node.url === `http://${v}` || node.url === `https://${v}` || node.url === `mailto:${v}`;
}

// 짝이 맞지 않는 첫 닫는 괄호 위치. 없으면 -1.
function unbalancedParen(text) {
	let depth = 0;
	for (let i = 0; i < text.length; i++) {
		if (text[i] === '(') depth++;
		else if (text[i] === ')') {
			if (depth === 0) return i;
			depth--;
		}
	}
	return -1;
}

function fixAutolinks(parent) {
	for (let i = 0; i < parent.children.length; i++) {
		const node = parent.children[i];
		if (!isAutolink(node)) continue;
		const text = node.children[0].value;
		const cut = unbalancedParen(text);
		if (cut <= 0) continue;
		const rest = text.slice(cut);
		if (!node.url.endsWith(rest)) continue;
		node.children[0].value = text.slice(0, cut);
		node.url = node.url.slice(0, node.url.length - rest.length);
		const next = parent.children[i + 1];
		if (next && next.type === 'text') next.value = rest + next.value;
		else parent.children.splice(i + 1, 0, { type: 'text', value: rest });
	}
}

// 형제 노드들에 흩어진 글자 "**" 짝을 찾아 strong 노드로 감싼다.
function fixBold(parent) {
	let changed = true;
	while (changed) {
		changed = false;
		const kids = parent.children;
		let open = null; // { index, offset }
		for (let i = 0; i < kids.length && !changed; i++) {
			const node = kids[i];
			if (node.type !== 'text') continue;
			let from = open && open.index === i ? open.offset + 2 : 0;
			while (!changed) {
				const at = node.value.indexOf('**', from);
				if (at === -1) break;
				if (!open) {
					open = { index: i, offset: at };
					from = at + 2;
					continue;
				}
				// 닫는 ** 발견: 여는 위치부터 닫는 위치까지를 strong으로 묶는다.
				const startNode = kids[open.index];
				const before = startNode.value.slice(0, open.offset);
				let inner;
				let after;
				if (open.index === i) {
					inner = [{ type: 'text', value: node.value.slice(open.offset + 2, at) }];
					after = node.value.slice(at + 2);
				} else {
					inner = [
						{ type: 'text', value: startNode.value.slice(open.offset + 2) },
						...kids.slice(open.index + 1, i),
						{ type: 'text', value: node.value.slice(0, at) },
					];
					after = node.value.slice(at + 2);
				}
				inner = inner.filter((n) => n.type !== 'text' || n.value !== '');
				if (inner.length === 0) {
					// "****" 같은 빈 굵게는 건드리지 않는다.
					open = null;
					from = at + 2;
					continue;
				}
				const replacement = [];
				if (before) replacement.push({ type: 'text', value: before });
				replacement.push({ type: 'strong', children: inner });
				if (after) replacement.push({ type: 'text', value: after });
				kids.splice(open.index, i - open.index + 1, ...replacement);
				changed = true;
			}
		}
	}
}

function walk(node) {
	if (!node.children) return;
	if (node.type === 'code' || node.type === 'inlineCode') return;
	fixAutolinks(node);
	fixBold(node);
	for (const child of node.children) walk(child);
}

export default function remarkKoreanFixes() {
	return (tree) => walk(tree);
}
