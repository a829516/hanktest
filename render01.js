const { chromium } = require('playwright');
const out = process.argv[2];
const S = 'stroke="#1d2a3a" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"';
const tub = (inner = '') => `<svg viewBox="0 0 100 100" width="170"><path ${S} d="M8 30 Q20 22 32 30 T56 30 T80 30 T96 30"/><path ${S} d="M10 30 L22 86 L78 86 L92 30"/>${inner}</svg>`;
const tri = (inner = '') => `<svg viewBox="0 0 100 100" width="170"><path ${S} d="M50 10 L92 88 L8 88 Z"/>${inner}</svg>`;
const dryer = (dots) => `<svg viewBox="0 0 100 100" width="170"><rect ${S} x="8" y="8" width="84" height="84"/><circle ${S} cx="50" cy="50" r="32"/>${dotRow(dots, 50, 50)}</svg>`;
const dotRow = (n, cx, cy) => Array.from({ length: n }, (_, i) => `<circle cx="${cx + (i - (n - 1) / 2) * 16}" cy="${cy}" r="5.5" fill="#1d2a3a"/>`).join('');
const iron = (dots) => `<svg viewBox="0 0 100 100" width="170"><path ${S} d="M10 80 L90 80 L90 50 Q90 30 66 30 L30 30 Q16 30 10 80 Z"/><path ${S} d="M40 30 Q42 16 64 16 L80 16"/>${dotRow(dots, 54, 58)}</svg>`;
const circ = (t) => `<svg viewBox="0 0 100 100" width="170"><circle ${S} cx="50" cy="50" r="40"/><text x="50" y="66" text-anchor="middle" font-size="44" font-weight="900" fill="#1d2a3a" font-family="Arial">${t}</text></svg>`;
const cross = `<path stroke="#e5484d" stroke-width="7" stroke-linecap="round" d="M10 10 L90 90 M90 10 L10 90"/>`;
const txt = (t, y = 70) => `<text x="50" y="${y}" text-anchor="middle" font-size="30" font-weight="900" fill="#1d2a3a" font-family="Arial">${t}</text>`;
const hand = `<path ${S} stroke-width="5" d="M40 72 L40 50 M48 72 L48 44 M56 72 L56 46 M64 72 L64 54 M40 72 Q52 80 64 72"/>`;

const card = (icon, title, desc) => `<div class="card"><div class="icon">${icon}</div><div><h3>${title}</h3><p>${desc}</p></div></div>`;
const page = (tag, title, cards, note = '') => `<div class="tag">${tag}</div><h2>${title}</h2>${cards.join('')}${note ? `<div class="note">${note}</div>` : ''}`;

const slides = [
  `<div class="cover"><div class="tag">生活符號翻譯機</div><h1>衣服洗標<br>你看得懂<br>幾個？</h1>
   <div class="row">${tub(txt('30'))}${tri()}${dryer(1)}${iron(2)}</div><p class="sub">洗壞衣服之前，先收藏這篇 👉</p></div>`,
  page('01 水洗', '🪣 水桶 = 可以水洗', [
    card(tub(txt('30')), '數字 = 最高水溫', '30 代表水溫不要超過 30°C'),
    card(tub(hand), '水桶裡有手', '只能手洗，不要丟洗衣機'),
    card(tub(cross), '水桶打叉', '不可水洗，通常要送乾洗'),
  ]),
  page('02 漂白', '🔺 三角形 = 漂白', [
    card(tri(), '空白三角形', '任何漂白劑都可以'),
    card(tri(`<path ${S} d="M38 76 L56 36 M52 76 L70 36"/>`), '裡面有兩條斜線', '只能用含氧漂白劑'),
    card(tri(cross), '三角形打叉', '不可漂白'),
  ]),
  page('03 烘乾', '⬜ 方框＋圓圈 = 烘乾機', [
    card(dryer(1), '1 個點', '低溫烘乾'),
    card(dryer(2), '2 個點', '一般溫度烘乾'),
    card(dryer(0).replace('</svg>', cross + '</svg>'), '打叉', '不可用烘衣機'),
  ], '點越多 = 可以用的溫度越高'),
  page('04 熨燙', '🔥 熨斗 = 可以燙', [
    card(iron(1), '1 個點', '低溫，約 110°C'),
    card(iron(2), '2 個點', '中溫，約 150°C'),
    card(iron(3), '3 個點', '高溫，約 200°C'),
  ]),
  page('05 乾洗', '⭕ 圓圈 = 乾洗', [
    card(circ('P'), '圓圈裡有字母', 'P、F 是給乾洗店看的溶劑種類'),
    card(circ('').replace('</svg>', cross + '</svg>'), '圓圈打叉', '不可乾洗'),
  ], '記住口訣：看到 ✕ 就是「不可以」'),
  `<div class="cover end"><h1>🔖 收藏起來<br>洗衣服前翻一下</h1><p class="sub">還有哪個符號看不懂？<br>留言告訴我，下一篇幫你解密 👇</p><div class="tag">追蹤 @fuhao.decoded 看懂每個符號</div></div>`,
];

const css = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@500;900&display=swap');
*{box-sizing:border-box;margin:0}
body{width:1080px;height:1350px;background:#fdf6ec;font-family:'Noto Sans TC','WenQuanYi Zen Hei',sans-serif;color:#1d2a3a;padding:90px 80px;display:flex;flex-direction:column}
.tag{display:inline-block;align-self:flex-start;background:#1d2a3a;color:#fdf6ec;font-size:34px;font-weight:900;padding:10px 26px;border-radius:40px}
h1{font-size:150px;line-height:1.15;font-weight:900;margin:60px 0}
h2{font-size:78px;font-weight:900;margin:36px 0 40px}
.row{display:flex;gap:30px;margin:20px 0 60px}
.row svg{width:200px;background:#fff;border-radius:28px;padding:16px}
.sub{font-size:50px;font-weight:500;line-height:1.5}
.cover{display:flex;flex-direction:column;height:100%}
.end{justify-content:center;gap:40px}.end h1{font-size:110px;margin:0}.end .tag{align-self:flex-start}
.card{display:flex;align-items:center;gap:44px;background:#fff;border-radius:36px;padding:34px 44px;margin-bottom:30px;box-shadow:0 6px 0 #ecdcc4}
.icon svg{display:block}
h3{font-size:56px;font-weight:900;margin-bottom:10px}
p{font-size:42px;font-weight:500;line-height:1.4;color:#45546a}
.end p{color:#1d2a3a}
.note{margin-top:auto;background:#ffd66b;font-size:44px;font-weight:900;padding:28px 40px;border-radius:30px}
`;

(async () => {
  require('fs').writeFileSync(out + '/slides.json', JSON.stringify({ css, slides }));
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
  for (let i = 0; i < slides.length; i++) {
    await p.setContent(`<html><head><meta charset="utf-8"><style>${css}</style></head><body>${slides[i]}</body></html>`, { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: `${out}/${i + 1}.png` });
  }
  await b.close();
})();
