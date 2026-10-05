// 앱 등록용 미리보기 스크린샷(세로 636x1048)을 만든다. 사용: [SCHEME=light|dark] node capture-screenshots.mjs <미리보기 URL> <CDP 포트> (현재 폴더에 저장)
import fs from 'node:fs';

const URL_ = process.argv[2] || 'http://127.0.0.1:4173/';
const PORT = process.argv[3] || '9333';
const W = 636, H = 1048;

const targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
const page = targets.find((t) => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));

let id = 0;
const pending = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
};
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const i = ++id;
  pending.set(i, (m) => (m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result)));
  ws.send(JSON.stringify({ id: i, method, params }));
});
const evalJs = async (expression) => (await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result.value;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: true });
await send('Emulation.setEmulatedMedia', { features: [
  { name: 'prefers-color-scheme', value: process.env.SCHEME || 'light' },
  { name: 'prefers-reduced-motion', value: 'reduce' },
] });
await send('Page.navigate', { url: URL_ });

// 데이터가 모두 뜰 때까지 기다린다 (최신 회차, 빈도, 기록)
for (let i = 0; i < 60; i += 1) {
  const ok = await evalJs(`document.body.innerText.includes('회차별 당첨 기록') && document.querySelectorAll('section').length >= 4 && !!document.body.innerText.match(/최신 당첨 번호 · \\d+회/) && document.body.innerText.includes('187회') || document.body.innerText.match(/\\d+회\\s*\\n/) !== null`);
  if (ok) break;
  await sleep(500);
}
await sleep(1500);

// 번호 생성 (추천 모드, 1게임)
await evalJs(`[...document.querySelectorAll('button')].find((b) => b.textContent.includes('번호 생성하기')).click()`);
await sleep(4500);

const shoot = async (name, scrollExpr) => {
  await evalJs(`window.scrollTo(0, ${scrollExpr}); true`);
  await sleep(600);
  const { data } = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(name, Buffer.from(data, 'base64'));
  console.log('saved', name);
};
const sectionTop = (title) => `(() => { const h = [...document.querySelectorAll('h2')].find((e) => e.textContent.includes('${title}')); return Math.max(0, h.closest('section').getBoundingClientRect().top + window.scrollY - 16); })()`;

await shoot('screenshot-1-generate.png', '0');
await shoot('screenshot-2-latest-frequency.png', await evalJs(sectionTop('최신 당첨 번호')));
await shoot('screenshot-3-position.png', await evalJs(sectionTop('자리별 빈도 분석')));
await shoot('screenshot-4-history.png', await evalJs(sectionTop('회차별 당첨 기록')));
ws.close();
