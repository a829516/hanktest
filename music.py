"""Synthesize an original, royalty-free upbeat loop plus 'pop' sound effects.
Usage: python3 music.py <out.wav> <duration_sec> [pop_times_comma_separated]"""
import sys, wave
import numpy as np

SR = 44100
BPM = 112
BEAT = 60 / BPM


def env(n, a=0.005, r=0.3):
    t = np.arange(n) / SR
    e = np.minimum(1, t / a) * np.exp(-t / r)
    return e


def tone(freq, dur, kind="sine", a=0.005, r=0.3):
    n = int(dur * SR)
    t = np.arange(n) / SR
    if kind == "tri":
        w = 2 * np.abs(2 * ((t * freq) % 1) - 1) - 1
    else:
        w = np.sin(2 * np.pi * freq * t)
    return w * env(n, a, r)


def note(m):  # midi -> Hz
    return 440 * 2 ** ((m - 69) / 12)


def add(buf, sig, start):
    i = int(start * SR)
    if i >= len(buf):
        return
    j = min(len(buf), i + len(sig))
    buf[i:j] += sig[: j - i]


def main(out, dur, pops):
    n = int(dur * SR) + SR
    mus = np.zeros(n)
    # I–V–vi–IV in C major
    chords = [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]]
    bar = BEAT * 4
    t, k = 0.0, 0
    rng = np.random.default_rng(7)
    while t < dur:
        ch = chords[k % 4]
        for m in ch:  # soft pad
            add(mus, 0.06 * tone(note(m), bar, "sine", a=0.3, r=1.2), t)
        add(mus, 0.16 * tone(note(ch[0] - 24), bar, "sine", a=0.01, r=0.5), t)  # bass
        for b in range(8):  # pluck arpeggio on 8ths
            m = ch[[0, 1, 2, 1, 0, 2, 1, 2][b]] + 12
            add(mus, 0.07 * tone(note(m), 0.4, "tri", r=0.12), t + b * BEAT / 2)
        for b in range(4):  # kick
            kt = np.arange(int(0.25 * SR)) / SR
            kick = np.sin(2 * np.pi * (50 + 90 * np.exp(-kt * 30)) * kt) * np.exp(-kt * 12)
            add(mus, 0.35 * kick, t + b * BEAT)
            hat = rng.standard_normal(int(0.05 * SR)) * np.exp(-np.arange(int(0.05 * SR)) / SR * 80)
            add(mus, 0.04 * np.diff(hat, prepend=0), t + b * BEAT + BEAT / 2)
        t += bar
        k += 1
    for p in pops:  # UI pop effect
        pt = np.arange(int(0.12 * SR)) / SR
        pop = np.sin(2 * np.pi * (600 + 900 * pt / 0.12) * pt) * np.exp(-pt * 35)
        add(mus, 0.18 * pop, p)
    mus = mus[: int(dur * SR)]
    fade = int(0.8 * SR)
    mus[-fade:] *= np.linspace(1, 0, fade)
    mus = mus / (np.abs(mus).max() + 1e-9) * 0.8
    pcm = (mus * 32767).astype(np.int16)
    with wave.open(out, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(pcm.tobytes())


if __name__ == "__main__":
    pops = [float(x) for x in sys.argv[3].split(",")] if len(sys.argv) > 3 and sys.argv[3] else []
    main(sys.argv[1], float(sys.argv[2]), pops)
