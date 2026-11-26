// Shared helpers for rendering @fuhao.decoded carousel posts.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const N = '#1d2a3a', R = '#e5484d';
const h = {
  card: (title, desc, icon = '') => `<div class="card">${icon ? `<div class="ic">${icon}</div>` : ''}<div><h3>${title}</h3><p>${desc}</p></div></div>`,
  table: rows => `<div class="table">${rows.map(([a, b]) => `<div class="tr"><b>${a}</b><span>${b}</span></div>`).join('')}</div>`,
  swatches: rows => `<div class="table">${rows.map(([c, a, b]) => `<div class="tr"><b><i style="background:${c}"></i>${a}</b><span>${b}</span></div>`).join('')}</div>`,
  note: t => `<div class="note">${t}</div>`,
  tag: t => `<div class="tag">${t}</div>`,
  big: (t, color = N) => `<div class="bigtxt" style="color:${color}">${t}</div>`,
  sym: t => `<span class="sym">${t}</span>`,
};
h.cover = (title, visual, sub) => `<div class="cover">${h.tag('生活符號翻譯機')}<h1>${title}</h1><div class="vis">${visual}</div><p class="sub">${sub}</p></div>`;
h.end = (title, sub = '你身邊還有哪個符號看不懂？<br>留言告訴我，下一篇幫你解密 👇') =>
  `<div class="cover end"><h1>🔖 ${title}</h1><p class="sub">${sub}</p>${h.tag('追蹤 @fuhao.decoded 看懂每個符號')}</div>`;
h.page = (t, title, ...body) => `${h.tag(t)}<h2>${title}</h2>${body.join('')}`;
h.R = R;

const css = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@500;900&display=swap');
*{box-sizing:border-box;margin:0}
body{width:1080px;height:1350px;background:#fdf6ec;font-family:'Noto Sans TC','WenQuanYi Zen Hei',sans-serif;color:${N};padding:90px 80px;display:flex;flex-direction:column}
.tag{display:inline-block;align-self:flex-start;background:${N};color:#fdf6ec;font-size:34px;font-weight:900;padding:10px 26px;border-radius:40px}
h1{font-size:120px;line-height:1.2;font-weight:900;margin:50px 0}
h1 em{font-style:normal;color:${R}}
h2{font-size:74px;font-weight:900;margin:36px 0 40px}
.cover{display:flex;flex-direction:column;height:100%}
.vis{margin:10px 0 50px}
.sub{font-size:50px;font-weight:500;line-height:1.5}
.end{justify-content:center;gap:40px}.end h1{font-size:110px;margin:0}
.card{display:flex;align-items:center;gap:40px;background:#fff;border-radius:36px;padding:32px 48px;margin-bottom:26px;box-shadow:0 6px 0 #ecdcc4}
.ic{font-size:80px;min-width:110px;text-align:center;font-weight:900;font-family:'Noto Sans TC',sans-serif}
h3{font-size:56px;font-weight:900;margin-bottom:8px}
p{font-size:42px;font-weight:500;line-height:1.45;color:#45546a}
.end p{color:${N}}
.note{margin-top:auto;background:#ffd66b;font-size:44px;font-weight:900;padding:28px 40px;border-radius:30px;line-height:1.4}
.table{background:#fff;border-radius:36px;padding:16px 50px;box-shadow:0 6px 0 #ecdcc4;margin-bottom:26px}
.tr{display:flex;justify-content:space-between;align-items:center;gap:30px;font-size:46px;padding:18px 0;border-bottom:3px dashed #ecdcc4}
.tr:last-child{border:0}.tr b{font-weight:900;white-space:nowrap;display:flex;align-items:center;gap:20px}.tr span{text-align:right}
.tr i{display:inline-block;width:46px;height:46px;border-radius:12px}
.dj{font-family:'DejaVu Serif',serif;font-weight:700}
.bigtxt{font-family:Arial,'Noto Sans TC',sans-serif;font-size:72px;font-weight:900;line-height:1.35;background:#fff;border-radius:36px;padding:40px 48px;margin-bottom:26px;box-shadow:0 6px 0 #ecdcc4}
`;

async function render(posts, outDir, only = []) {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  for (const [id, post] of Object.entries(posts)) {
    if (only.length && !only.includes(id)) continue;
    const dir = path.join(outDir, id);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'caption.txt'), post.caption.trim() + '\n');
    fs.writeFileSync(path.join(dir, 'slides.json'), JSON.stringify({ css, slides: post.slides }));
    for (let i = 0; i < post.slides.length; i++) {
      await p.setContent(`<html><head><meta charset="utf-8"><style>${css}</style></head><body>${post.slides[i]}</body></html>`, { waitUntil: 'networkidle' });
      await p.evaluate(() => document.fonts.ready);
      await p.screenshot({ path: path.join(dir, `${i + 1}.jpg`), type: 'jpeg', quality: 92 });
    }
  }
  await b.close();
}

const tags = t => `${t} #生活小知識 #冷知識 #符號解密 #實用知識 #收藏`;
const outro = (save) => `🔖 收藏起來，${save}\n💬 還有哪個符號看不懂？留言告訴我，下一篇幫你解密！`;

module.exports = { h, render, tags, outro };
