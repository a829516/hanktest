"""Turn a carousel post folder into a 9:16 Reel MP4.  Usage: python3 make_reel.py 01"""
import subprocess, sys, tempfile
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

BG = (253, 246, 236)
NAVY = (29, 42, 58)
FONT = "/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc"
SEC, FADE = 2.8, 0.35


def frame(slide: Path, out: Path):
    canvas = Image.new("RGB", (1080, 1920), BG)
    img = Image.open(slide).convert("RGB")  # 1080x1350
    canvas.paste(img, (0, 285))
    d = ImageDraw.Draw(canvas)
    f1 = ImageFont.truetype(FONT, 46)
    f2 = ImageFont.truetype(FONT, 40)
    d.rounded_rectangle((300, 130, 780, 215), radius=42, fill=NAVY)
    d.text((540, 172), "@fuhao.decoded", font=f1, fill=BG, anchor="mm")
    d.text((540, 1760), "收藏起來，用到就翻", font=f2, fill=NAVY, anchor="mm")
    canvas.save(out)


def intro(caption: str, out: Path):
    """Navy 9:16 hook card so the Reel cover differs from the carousel cover."""
    import re
    line = caption.strip().splitlines()[0]
    line = re.sub(r"[^\w\s，。？！、：＝=%~\-\.\u4e00-\u9fff]", "", line).strip()
    canvas = Image.new("RGB", (1080, 1920), NAVY)
    d = ImageDraw.Draw(canvas)
    f = ImageFont.truetype(FONT, 96)
    lines, cur = [], ""
    for ch in line:
        if d.textlength(cur + ch, font=f) > 900:
            lines.append(cur); cur = ch
        else:
            cur += ch
    lines.append(cur)
    y = 960 - len(lines) * 70
    for ln in lines:
        d.text((540, y), ln, font=f, fill=BG, anchor="mm"); y += 140
    d.rounded_rectangle((330, 1500, 750, 1590), radius=45, fill=(255, 214, 107))
    d.text((540, 1545), "答案在下面", font=ImageFont.truetype(FONT, 50), fill=NAVY, anchor="mm")
    d.text((540, 300), "@fuhao.decoded", font=ImageFont.truetype(FONT, 46), fill=BG, anchor="mm")
    canvas.save(out)


def main(post):
    folder = Path(__file__).parent / post
    slides = sorted(folder.glob("[0-9].jpg"), key=lambda p: int(p.stem))
    tmp = Path(tempfile.mkdtemp())
    frames = [tmp / "intro.png"]
    intro((folder / "caption.txt").read_text(), frames[0])
    for s in slides:
        fp = tmp / f"{s.stem}.png"
        frame(s, fp)
        frames.append(fp)
    args = ["ffmpeg", "-y", "-loglevel", "error"]
    for fp in frames:
        args += ["-loop", "1", "-t", str(SEC), "-i", str(fp)]
    n = len(frames)
    args += ["-f", "lavfi", "-t", str(n * SEC), "-i", "anullsrc=r=44100:cl=stereo"]
    chain, prev, offset = [], "[0:v]", 0.0
    for i in range(1, n):
        offset += SEC - FADE
        lab = f"[v{i}]"
        chain.append(f"{prev}[{i}:v]xfade=transition=slideleft:duration={FADE}:offset={offset:.2f}{lab}")
        prev = lab
    chain.append(f"{prev}format=yuv420p,fps=30[vout]")
    out = folder / "reel.mp4"
    args += ["-filter_complex", ";".join(chain), "-map", "[vout]", "-map", f"{n}:a",
             "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-c:a", "aac", "-b:a", "128k",
             "-shortest", "-movflags", "+faststart", str(out)]
    subprocess.run(args, check=True)
    print(out)


if __name__ == "__main__":
    main(sys.argv[1])
