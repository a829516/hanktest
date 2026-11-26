// Renders carousel posts 03-07 for @fuhao.decoded. Usage: node render_batch.js
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const N = '#1d2a3a', R = '#e5484d';
const card = (title, desc, icon = '') => `<div class="card">${icon ? `<div class="ic">${icon}</div>` : ''}<div><h3>${title}</h3><p>${desc}</p></div></div>`;
const table = rows => `<div class="table">${rows.map(([a, b]) => `<div class="tr"><b>${a}</b><span>${b}</span></div>`).join('')}</div>`;
const note = t => `<div class="note">${t}</div>`;
const tag = t => `<div class="tag">${t}</div>`;
const cover = (title, visual, sub) => `<div class="cover">${tag('生活符號翻譯機')}<h1>${title}</h1><div class="vis">${visual}</div><p class="sub">${sub}</p></div>`;
const end = (title, sub = '你身邊還有哪個符號看不懂？<br>留言告訴我，下一篇幫你解密 👇') =>
  `<div class="cover end"><h1>🔖 ${title}</h1><p class="sub">${sub}</p>${tag('追蹤 @fuhao.decoded 看懂每個符號')}</div>`;
const page = (t, h, ...body) => `${tag(t)}<h2>${h}</h2>${body.join('')}`;
const recyc = n => `<svg viewBox="0 0 100 100" width="150"><path d="M50 12 L90 84 L10 84 Z" fill="none" stroke="${N}" stroke-width="6" stroke-linejoin="round"/><text x="50" y="74" text-anchor="middle" font-size="36" font-weight="900" fill="${N}" font-family="Arial">${n}</text></svg>`;
const big = (t, color = N) => `<div class="bigtxt" style="color:${color}">${t}</div>`;

const posts = {
  '03': {
    slides: [
      cover('塑膠容器底下<br>的 <em>1~7</em><br>是什麼？', `<div class="row">${[1, 2, 5, 6].map(recyc).join('')}</div>`, '裝熱湯之前，先看這篇 👉'),
      page('1 ~ 4 號', '♻️ 回收編號對照（上）', table([['1 PET', '寶特瓶'], ['2 HDPE', '牛奶瓶、清潔劑瓶'], ['3 PVC', '水管、部分保鮮膜'], ['4 LDPE', '塑膠袋、軟管']]),
        note('1 號寶特瓶：不建議裝熱水、重複使用')),
      page('5 ~ 7 號', '♻️ 回收編號對照（下）', table([['5 PP', '微波便當盒、豆漿杯'], ['6 PS', '保麗龍、免洗湯匙'], ['7 OTHER', '其他類（含 PC 等）']]),
        note('7 號是「其他」，看不出是什麼材質')),
      page('重點', '🔥 遇到熱食，記住這兩個', card('5 號 PP', '相對耐熱，微波便當盒常用', recyc(5)), card('6 號 PS', '不耐熱，避免裝高溫、油膩的食物', recyc(6)),
        note('能不能微波，還是要看容器上的「可微波」標示')),
      end('收藏起來<br>裝熱食前看一下'),
    ],
    caption: `塑膠容器底下的三角形數字 1~7，你知道是什麼意思嗎？🤔

♻️ 這是塑膠材質的回收編號
🔥 遇到熱食記住：5 號 PP 相對耐熱，6 號 PS 不耐熱
⚠️ 能不能微波，還是要看容器上的「可微波」標示

🔖 收藏起來，裝熱食前看一下
💬 還有哪個符號看不懂？留言告訴我，下一篇幫你解密！

#回收 #塑膠 #回收標誌 #生活小知識 #生活冷知識 #冷知識 #符號解密 #居家 #實用知識 #收藏`,
  },
  '04': {
    slides: [
      cover('充電器上的<br>小字<em>看得懂</em>嗎？', big('INPUT 100-240V<br>OUTPUT 5V⎓2A'), '出國前一定要看這篇 👉'),
      page('INPUT 輸入', '🌍 能不能帶出國？', card('100-240V', '全球電壓都能用<br>出國只要「轉接頭」，不用變壓器'), card('只寫 110V', '不能直接插 220V 的國家<br>要另外準備變壓器'),
        note('看 INPUT 這行，就知道能不能帶出國')),
      page('OUTPUT 輸出', '⚡ 充電快不快？', big('W ＝ V × A', R),
        table([['5V⎓2A', '10W'], ['9V⎓2A', '18W'], ['20V⎓3.25A', '65W']]), note('瓦數越大通常越快（手機也要支援才行）')),
      page('小符號', '🔍 旁邊的符號是什麼？', card('⎓', '直流電（DC）'), card('～', '交流電（AC）'), card('回字形 □', '雙重絕緣，安全設計的一種')),
      end('收藏起來<br>出國前看一下'),
    ],
    caption: `充電器上那排密密麻麻的小字，其實藏著兩個重點 👀

🌍 INPUT 100-240V → 全球通用，出國只要轉接頭
⚡ OUTPUT 伏特 × 安培 = 瓦數，瓦數越大通常充越快

🔖 收藏起來，出國前看一下
💬 還有哪個符號看不懂？留言告訴我，下一篇幫你解密！

#充電器 #出國 #旅行 #3C #生活小知識 #冷知識 #符號解密 #出國必備 #實用知識 #收藏`,
  },
  '05': {
    slides: [
      cover('行動電源<br>可以帶<em>上飛機</em>嗎？', big('🔋 ? Wh'), '關鍵就在這個數字 👉'),
      page('先換算', '🧮 mAh 換成 Wh', big('Wh ＝ mAh × 3.7 ÷ 1000', R),
        table([['10000 mAh', '約 37 Wh'], ['20000 mAh', '約 74 Wh'], ['27000 mAh', '約 100 Wh']]), note('3.7V 是一般鋰電池的電壓，以實際標示為準')),
      page('規定', '✈️ 能不能帶？', card('100 Wh 以下', '✅ 可以隨身攜帶'), card('100 ~ 160 Wh', '⚠️ 需要航空公司同意'), card('超過 160 Wh', '❌ 禁止攜帶')),
      page('最重要', '🚫 一律不能托運', card('只能放隨身行李', '行動電源、備用鋰電池都不能放托運行李箱'),
        note('各航空公司可能有更嚴格規定<br>出發前請再確認')),
      end('收藏起來<br>出國前看一下'),
    ],
    caption: `行動電源能不能帶上飛機？關鍵不是 mAh，而是 Wh！✈️

🧮 Wh ＝ mAh × 3.7 ÷ 1000
✅ 100Wh 以下可隨身帶（20000mAh 約 74Wh）
🚫 一律不能托運！

⚠️ 各航空公司可能有更嚴格規定，出發前請再確認

🔖 收藏起來，出國前看一下
💬 還有哪個符號看不懂？留言告訴我，下一篇幫你解密！

#行動電源 #出國 #旅行 #搭飛機 #出國必備 #生活小知識 #冷知識 #符號解密 #實用知識 #收藏`,
  },
  '06': {
    slides: [
      cover('輪胎側面的<br><em>密碼</em>看得懂嗎？', big('205/55R16 91V'), '換輪胎前先看這篇 👉'),
      page('拆解', '🚗 205/55R16 91V', table([['205', '胎寬 205mm'], ['55', '扁平比 55%'], ['R', '輻射層結構'], ['16', '適用 16 吋輪圈'], ['91', '載重指數'], ['V', '速度等級']])),
      page('91 和 V', '⚖️ 載重和速度', table([['91', '每條最多 615kg'], ['94', '每條最多 670kg']]),
        table([['T', '190 km/h'], ['H', '210 km/h'], ['V', '240 km/h'], ['W', '270 km/h']])),
      page('加碼', '📅 輪胎幾歲了？', card('找 DOT 開頭的那串', '最後 4 碼就是生產日期'), big('2324 → 2024 年第 23 週', R),
        note('買新胎時可以順便看一下生產日期')),
      end('收藏起來<br>換輪胎前看一下'),
    ],
    caption: `輪胎側面那串「205/55R16 91V」到底是什麼？🚗

205 胎寬｜55 扁平比｜R 輻射層｜16 輪圈吋數｜91 載重｜V 速度等級

📅 加碼：DOT 最後 4 碼是生產日期，2324 = 2024 年第 23 週

🔖 收藏起來，換輪胎前看一下
💬 還有哪個符號看不懂？留言告訴我，下一篇幫你解密！

#輪胎 #汽車 #汽車知識 #換輪胎 #生活小知識 #冷知識 #符號解密 #開車 #實用知識 #收藏`,
  },
  '07': {
    slides: [
      cover('手機寫 <em>IP68</em><br>可以泡水嗎？', big('IP 6 8'), '先看懂這兩個數字 👉'),
      page('第一個數字', '🌫️ 防塵等級', table([['5', '防塵（少量進入不影響）'], ['6', '完全防塵']]), note('IPX7 的 X ＝ 沒有測試這一項')),
      page('第二個數字', '💧 防水等級', table([['4', '防潑水'], ['5', '防噴水'], ['7', '浸水 1 公尺 30 分鐘'], ['8', '比 7 更嚴，條件由廠商定']])),
      page('注意', '⚠️ 防水不等於萬能', card('熱水、溫泉、肥皂水', '可能破壞防水'), card('海水、游泳池', '鹽分和化學物質也不適合'), card('會隨時間衰退', '摔過、修過，防水可能變差')),
      end('收藏起來<br>買手機前看一下'),
    ],
    caption: `手機寫 IP68，就可以帶去泡溫泉嗎？❌

🌫️ 第一個數字＝防塵，6 是完全防塵
💧 第二個數字＝防水，7 是浸水 1 公尺 30 分鐘
⚠️ 熱水、肥皂水、海水都可能破壞防水

🔖 收藏起來，買手機前看一下
💬 還有哪個符號看不懂？留言告訴我，下一篇幫你解密！

#IP68 #防水 #手機 #3C #生活小知識 #冷知識 #符號解密 #科技 #實用知識 #收藏`,
  },
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@500;900&display=swap');
*{box-sizing:border-box;margin:0}
body{width:1080px;height:1350px;background:#fdf6ec;font-family:'Noto Sans TC','WenQuanYi Zen Hei',sans-serif;color:${N};padding:90px 80px;display:flex;flex-direction:column}
.tag{display:inline-block;align-self:flex-start;background:${N};color:#fdf6ec;font-size:34px;font-weight:900;padding:10px 26px;border-radius:40px}
h1{font-size:120px;line-height:1.2;font-weight:900;margin:50px 0}
h1 em{font-style:normal;color:${R}}
h2{font-size:74px;font-weight:900;margin:36px 0 40px}
.cover{display:flex;flex-direction:column;height:100%}
.vis{margin:10px 0 50px}.row{display:flex;gap:24px}.row svg{background:#fff;border-radius:28px;padding:14px;width:200px}
.sub{font-size:50px;font-weight:500;line-height:1.5}
.end{justify-content:center;gap:40px}.end h1{font-size:110px;margin:0}
.card{display:flex;align-items:center;gap:40px;background:#fff;border-radius:36px;padding:36px 48px;margin-bottom:28px;box-shadow:0 6px 0 #ecdcc4}
h3{font-size:58px;font-weight:900;margin-bottom:10px}
p{font-size:42px;font-weight:500;line-height:1.45;color:#45546a}
.end p{color:${N}}
.note{margin-top:auto;background:#ffd66b;font-size:44px;font-weight:900;padding:28px 40px;border-radius:30px;line-height:1.4}
.table{background:#fff;border-radius:36px;padding:16px 50px;box-shadow:0 6px 0 #ecdcc4;margin-bottom:28px}
.tr{display:flex;justify-content:space-between;gap:30px;font-size:48px;padding:20px 0;border-bottom:3px dashed #ecdcc4}
.tr:last-child{border:0}.tr b{font-weight:900;white-space:nowrap}.tr span{text-align:right}
.bigtxt{font-family:Arial,'Noto Sans TC',sans-serif;font-size:72px;font-weight:900;line-height:1.35;background:#fff;border-radius:36px;padding:40px 48px;margin-bottom:28px;box-shadow:0 6px 0 #ecdcc4}
`;

(async () => {
  const only = process.argv.slice(2);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  for (const [id, post] of Object.entries(posts)) {
    if (only.length && !only.includes(id)) continue;
    const dir = path.join(__dirname, id);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'caption.txt'), post.caption + '\n');
    fs.writeFileSync(path.join(dir, 'slides.json'), JSON.stringify({ css, slides: post.slides }));
    for (let i = 0; i < post.slides.length; i++) {
      await p.setContent(`<html><head><meta charset="utf-8"><style>${css}</style></head><body>${post.slides[i]}</body></html>`, { waitUntil: 'networkidle' });
      await p.evaluate(() => document.fonts.ready);
      await p.screenshot({ path: path.join(dir, `${i + 1}.jpg`), type: 'jpeg', quality: 92 });
    }
  }
  await b.close();
})();
