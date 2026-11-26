const { chromium } = require('playwright');
const out = process.argv[2];
// deterministic pseudo barcode
let seed = 7; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
const barcode = (digits, hl = 3, w = 760) => {
  let x = 0, bars = '';
  while (x < 300) { const bw = 2 + Math.floor(rnd() * 4) * 2; if (rnd() > 0.45) bars += `<rect x="${x}" y="0" width="${bw}" height="150" fill="#1d2a3a"/>`; x += bw + 2; }
  const ds = digits.split('').map((d, i) => `<tspan fill="${i < hl ? '#e5484d' : '#1d2a3a'}">${d}</tspan>`).join('');
  return `<svg viewBox="-10 -10 320 200" width="${w}"><rect x="-10" y="-10" width="320" height="200" rx="10" fill="#fff"/>${bars}<text x="150" y="182" text-anchor="middle" font-size="30" font-weight="900" letter-spacing="4" font-family="Arial">${ds}</text></svg>`;
};
const card = (title, desc) => `<div class="card"><div><h3>${title}</h3><p>${desc}</p></div></div>`;
const row = (code, place) => `<div class="tr"><b>${code}</b><span>${place}</span></div>`;

const slides = [
  `<div class="cover"><div class="tag">生活符號翻譯機</div><h1>條碼 <em>471</em> 開頭<br>＝台灣製造？</h1>
   <div class="bc">${barcode('4710000123456')}</div><p class="sub">90% 的人都誤會了 👉</p></div>`,
  `<div class="tag">答案</div><h1 class="big">❌ 不是！</h1>
   ${card('471 只代表…', '這個條碼是向<b>台灣的條碼機構</b>申請的')}
   ${card('不代表…', '商品是在<b>台灣生產</b>的')}
   <div class="note">條碼 ≠ 產地證明</div>`,
  `<div class="tag">為什麼？</div><h2>舉個例子 🤔</h2>
   ${card('🇹🇼 台灣公司・國外工廠', '在台灣申請條碼 → 開頭是 471<br>但商品可能是在其他國家製造')}
   ${card('🌏 外國品牌・台灣代工', '用品牌自己國家的條碼<br>開頭不是 471，卻是台灣製造')}
   <div class="note">條碼看的是「在哪裡註冊」，不是「在哪裡生產」</div>`,
  `<div class="tag">加碼</div><h2>常見條碼開頭</h2><div class="table">
   ${row('471', '台灣')}${row('690–699', '中國')}${row('45・49', '日本')}${row('880', '韓國')}
   ${row('000–139', '美國・加拿大')}${row('400–440', '德國')}${row('978・979', '📚 書籍（ISBN）')}</div>
   <p class="small">同樣只代表註冊地，不代表產地</p>`,
  `<div class="tag">那產地要看哪裡？</div><h2>看包裝上的這幾個字 👀</h2>
   ${card('「原產地」', '例：原產地：台灣')}
   ${card('「製造地」或「產地」', '例：Made in Taiwan')}
   <div class="note">台灣法規要求商品標示原產地，比條碼可靠多了</div>`,
  `<div class="cover end"><h1>🔖 收藏起來<br>買東西前看一下</h1><p class="sub">你身邊還有哪個符號看不懂？<br>留言告訴我，下一篇幫你解密 👇</p><div class="tag">追蹤 @fuhao.decoded 看懂每個符號</div></div>`,
];

const css = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@500;900&display=swap');
*{box-sizing:border-box;margin:0}
body{width:1080px;height:1350px;background:#fdf6ec;font-family:'Noto Sans TC','WenQuanYi Zen Hei',sans-serif;color:#1d2a3a;padding:90px 80px;display:flex;flex-direction:column}
.tag{display:inline-block;align-self:flex-start;background:#1d2a3a;color:#fdf6ec;font-size:34px;font-weight:900;padding:10px 26px;border-radius:40px}
h1{font-size:120px;line-height:1.2;font-weight:900;margin:50px 0}
h1 em{font-style:normal;color:#e5484d}
h1.big{font-size:150px;margin:40px 0 50px}
h2{font-size:78px;font-weight:900;margin:36px 0 40px}
.bc{margin:10px 0 60px}
.sub{font-size:50px;font-weight:500;line-height:1.5}
.cover{display:flex;flex-direction:column;height:100%}
.end{justify-content:center;gap:40px}.end h1{font-size:110px;margin:0}
.card{background:#fff;border-radius:36px;padding:40px 50px;margin-bottom:30px;box-shadow:0 6px 0 #ecdcc4}
h3{font-size:58px;font-weight:900;margin-bottom:12px}
p{font-size:44px;font-weight:500;line-height:1.45;color:#45546a}
p b{color:#e5484d}
.end p{color:#1d2a3a}
.note{margin-top:auto;background:#ffd66b;font-size:46px;font-weight:900;padding:30px 40px;border-radius:30px;line-height:1.4}
.table{background:#fff;border-radius:36px;padding:20px 50px;box-shadow:0 6px 0 #ecdcc4}
.tr{display:flex;justify-content:space-between;font-size:50px;padding:22px 0;border-bottom:3px dashed #ecdcc4}
.tr:last-child{border:0}.tr b{font-weight:900;font-family:Arial,sans-serif}.tr:first-child b{color:#e5484d}
.small{margin-top:36px;font-size:40px}
`;

(async () => {
  require('fs').writeFileSync(out + '/slides.json', JSON.stringify({ css, slides }));
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  for (let i = 0; i < slides.length; i++) {
    await p.setContent(`<html><head><meta charset="utf-8"><style>${css}</style></head><body>${slides[i]}</body></html>`, { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: `${out}/${i + 1}.png` });
  }
  await b.close();
})();
