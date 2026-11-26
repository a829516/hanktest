// Animated 9:16 Reel from a post's slides.json + caption.txt, with original synthesized music.
// Usage: node make_reel.js 01
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const FPS = 30;
const post = process.argv[2];
const dir = path.join(__dirname, post);
const { css, slides: allSlides } = JSON.parse(fs.readFileSync(path.join(dir, 'slides.json'), 'utf8'));
const slides = allSlides.slice(1); // intro card replaces the carousel cover
const hook = fs.readFileSync(path.join(dir, 'caption.txt'), 'utf8').trim().split('\n')[0];

const slideCss = css.replace(/(^|\n)\s*body\{/, '$1.slide{').replace("@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@500;900&display=swap');", '');
const html = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@500;900&display=swap" rel="stylesheet">
<style>
${slideCss}
html,body{margin:0;padding:0;width:1080px;height:1920px;overflow:hidden;background:#fdf6ec;font-family:'Noto Sans TC',sans-serif}
#stage{position:relative;width:1080px;height:1920px;overflow:hidden}
.blob{position:absolute;border-radius:50%;filter:blur(2px);opacity:.55}
.scene{position:absolute;inset:0;will-change:transform,opacity}
.slide{position:absolute;left:0;top:285px;transform-origin:50% 50%}
.hdr{position:absolute;top:120px;left:50%;transform:translateX(-50%);background:#1d2a3a;color:#fdf6ec;font-size:44px;font-weight:900;padding:14px 40px;border-radius:50px;font-family:Arial,'Noto Sans TC',sans-serif;z-index:5}
.ftr{position:absolute;bottom:120px;width:100%;text-align:center;font-size:44px;font-weight:900;color:#1d2a3a;z-index:5}
#bar{position:absolute;top:0;left:0;height:12px;background:#e5484d;z-index:9}
.intro{background:#1d2a3a;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:90px}
.hook{color:#fdf6ec;font-size:104px;font-weight:900;line-height:1.3;text-align:center;padding:0 80px}
.hook span{display:inline-block}
.pill{background:#ffd66b;color:#1d2a3a;font-size:58px;font-weight:900;padding:22px 60px;border-radius:60px}
.qm{position:absolute;font-size:260px;font-weight:900;color:#ffd66b;opacity:.15}
</style></head><body><div id="stage">
<div class="blob" style="width:520px;height:520px;background:#ffe7a8;left:-160px;top:200px" data-k="0"></div>
<div class="blob" style="width:420px;height:420px;background:#f9d5d3;right:-140px;top:1250px" data-k="1"></div>
<div class="blob" style="width:300px;height:300px;background:#d9ecf7;right:80px;top:40px" data-k="2"></div>
<div id="bar"></div>
<div class="hdr">@fuhao.decoded</div>
<div class="ftr">🔖 收藏起來，用到就翻</div>
<div class="scene intro" id="s0"><div class="qm" style="left:60px;top:180px">?</div><div class="qm" style="right:60px;bottom:220px">?</div>
<div class="hook" id="hook"></div><div class="pill" id="pill">答案在下面 👇</div></div>
${slides.map((s, i) => `<div class="scene" id="s${i + 1}"><div class="slide">${s}</div></div>`).join('')}
</div>
<script>
const hookText = ${JSON.stringify(hook)};
const hookEl = document.getElementById('hook');
// split hook into small chunks (2 chars, keep emoji/latin words whole)
const chunks = hookText.match(/[A-Za-z0-9%.=＝]+|\\p{Extended_Pictographic}\\uFE0F?|[\\s\\S]{1}/gu) || [hookText];
hookEl.innerHTML = chunks.map(c => '<span>' + (c === ' ' ? '&nbsp;' : c) + '</span>').join('');
const ease = p => 1 - Math.pow(1 - p, 3);
const back = p => { const c = 1.70158; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); };
const clamp = p => Math.max(0, Math.min(1, p));
// build timeline
const scenes = [...document.querySelectorAll('.scene')];
const timeline = []; const pops = [];
let t = 0;
scenes.forEach((sc, i) => {
  let items = [];
  if (i === 0) items = [...hookEl.children];
  else {
    const sl = sc.querySelector('.slide');
    for (const ch of sl.children) {
      if (ch.classList.contains('cover')) items.push(...ch.children);
      else if (ch.classList.contains('table')) items.push(...ch.children);
      else items.push(ch);
    }
  }
  const step = i === 0 ? Math.min(0.06, 1.2 / Math.max(1, items.length)) : 0.22;
  const isLast = i === scenes.length - 1;
  const dur = i === 0 ? 2.6 : isLast ? 2.6 : Math.max(2.8, 0.4 + items.length * step + 1.7);
  const its = items.map((el, k) => ({ el, at: t + 0.35 + k * step }));
  if (i > 0) its.forEach(x => pops.push(+x.at.toFixed(2)));
  timeline.push({ sc, start: t, dur, its });
  t += dur;
});
window.TOTAL = t; window.POPS = pops;
window.setTime = (T) => {
  document.getElementById('bar').style.width = (T / window.TOTAL * 100) + '%';
  document.querySelectorAll('.blob').forEach(b => { const k = +b.dataset.k; b.style.transform = 'translate(' + (Math.sin(T * 0.6 + k * 2) * 40) + 'px,' + (Math.cos(T * 0.5 + k) * 50) + 'px)'; });
  const introOn = T < timeline[0].dur;
  document.querySelector('.hdr').style.opacity = 1;
  document.querySelector('.ftr').style.opacity = introOn ? 0 : 1;
  timeline.forEach((s, i) => {
    const local = T - s.start, next = timeline[i + 1];
    let x = 100, op = 0;
    if (local >= 0) { const p = ease(clamp(local / 0.4)); x = i === 0 ? 0 : 100 * (1 - p); op = 1; }
    if (next && T >= next.start) { const q = ease(clamp((T - next.start) / 0.4)); x = -30 * q; op = 1 - q; }
    s.sc.style.transform = 'translateX(' + x + '%)'; s.sc.style.opacity = op; s.sc.style.zIndex = i + 1;
    const sl = s.sc.querySelector('.slide');
    if (sl) sl.style.transform = 'scale(' + (1 + 0.025 * clamp(local / s.dur)) + ')';
    s.its.forEach(({ el, at }) => {
      const p = clamp((T - at) / 0.45), e = back(p);
      el.style.opacity = Math.min(1, p * 1.6);
      el.style.transform = 'translateY(' + ((1 - e) * 60) + 'px) scale(' + (0.9 + 0.1 * e) + ')';
    });
  });
  const pill = document.getElementById('pill');
  const pp = clamp((T - 1.6) / 0.4);
  pill.style.opacity = pp; pill.style.transform = 'scale(' + ((0.6 + 0.4 * back(pp)) * (1 + 0.04 * Math.sin(T * 8))) + ')';
};
</script></body></html>`;

(async () => {
  const frames = fs.mkdtempSync(path.join(require('os').tmpdir(), 'reel-'));
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.setContent(html, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  const total = await p.evaluate(() => window.TOTAL);
  const pops = await p.evaluate(() => window.POPS);
  const n = Math.ceil(total * FPS);
  for (let f = 0; f < n; f++) {
    await p.evaluate(T => window.setTime(T), f / FPS);
    await p.screenshot({ path: path.join(frames, String(f).padStart(5, '0') + '.jpg'), type: 'jpeg', quality: 88 });
  }
  await b.close();
  const wav = path.join(frames, 'music.wav');
  execFileSync('python3', [path.join(__dirname, 'music.py'), wav, String(total), pops.join(',')]);
  const out = path.join(dir, 'reel.mp4');
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(frames, '%05d.jpg'), '-i', wav,
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-shortest', '-movflags', '+faststart', out]);
  fs.rmSync(frames, { recursive: true, force: true });
  console.log(out, total.toFixed(1) + 's');
})();
