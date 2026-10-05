"""Writes the music loop and every sound effect. Run: uv run --with numpy art/make_audio.py (needs ffmpeg)
No samples, no recordings: every sound is arithmetic. Output goes to app/App/Audio and web/play/audio as mp3."""
import os, subprocess, wave
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 22050
# D Phrygian dominant, the scale a lyre in Ur might have been tuned near
N = dict(D2=73.42, G2=98.0, A2=110.0, D3=146.83, Eb3=155.56, A3=220.0, D4=293.66, Eb4=311.13, Fs4=369.99, G4=392.0,
         A4=440.0, Bb4=466.16, C5=523.25, D5=587.33, Eb5=622.25, Fs5=739.99, A5=880.0, D6=1174.66)

def t(secs): return np.arange(int(secs * SR)) / SR
def fade(x, a=0.005, r=0.03):
    n = len(x); env = np.ones(n)
    ia, ir = max(1, int(a * SR)), max(1, int(r * SR))
    env[:ia] = np.linspace(0, 1, ia); env[-ir:] *= np.linspace(1, 0, ir)
    return x * env
def pluck(hz, secs, decay=3.2):
    x = t(secs)
    w = np.sin(2 * np.pi * hz * x) + 0.45 * np.sin(4 * np.pi * hz * x) * np.exp(-x * 5) + 0.2 * np.sin(6 * np.pi * hz * x) * np.exp(-x * 8)
    return fade(w * np.exp(-x * decay), 0.003, 0.05)
def flute(hz, secs):
    x = t(secs); vib = 1 + 0.004 * np.sin(2 * np.pi * 5 * x)
    return fade(np.sin(2 * np.pi * hz * vib * x) + 0.25 * np.sin(4 * np.pi * hz * x), 0.08, 0.15)
def drone(hz, secs):
    x = t(secs); tri = 2 * np.abs(2 * ((hz * x) % 1) - 1) - 1
    return fade((tri * 0.7 + 0.3 * np.sin(2 * np.pi * hz * 1.5 * x)) * (0.85 + 0.15 * np.sin(2 * np.pi * 0.25 * x)), 0.3, 0.4)
def dum(secs=0.3):
    x = t(secs); return fade(np.sin(2 * np.pi * (95 - 120 * x) * x) * np.exp(-x * 14), 0.002, 0.05)
def tek(secs=0.09):
    rng = np.random.default_rng(1); x = t(secs)
    return fade(rng.uniform(-1, 1, len(x)) * np.exp(-x * 60) * 0.6 + np.sin(2 * np.pi * 1900 * x) * np.exp(-x * 80) * 0.3, 0.001, 0.02)
def mix(total, parts):
    out = np.zeros(int(total * SR) + 1)
    for at, snd, vol in parts:
        i = int(at * SR); n = min(len(snd), len(out) - i)
        if n > 0: out[i:i + n] += snd[:n] * vol
    return out

def music():
    beat = 60 / 76; e = beat / 2; bar = 4 * beat
    A = [("A4", 2), ("G4", 1), ("Fs4", 1), ("G4", 2), ("A4", 2), ("Bb4", 1), ("A4", 1), ("G4", 1), ("Fs4", 1), ("Eb4", 2), ("D4", 2)]
    A2 = [("A4", 2), ("G4", 1), ("Fs4", 1), ("G4", 2), ("A4", 2), ("C5", 1), ("Bb4", 1), ("A4", 1), ("G4", 1), ("A4", 4)]
    B = [("D5", 2), ("C5", 1), ("Bb4", 1), ("A4", 2), ("G4", 2), ("Bb4", 1), ("A4", 1), ("G4", 1), ("Fs4", 1), ("G4", 2), ("Fs4", 2)]
    C = [("Eb4", 2), ("Fs4", 1), ("G4", 1), ("A4", 2), ("G4", 1), ("Fs4", 1), ("Eb4", 2), ("D4", 6)]
    parts = []
    for rep in range(2):
        at = rep * 8 * bar
        for name, units in A + A2 + B + C:
            parts.append((at, pluck(N[name], units * e + 0.5), 0.34))
            if rep == 1 and units >= 2: parts.append((at, flute(N[name] * 2, units * e), 0.07))  # second pass: a reed pipe joins
            at += units * e
    for i, root in enumerate(["D2"] * 8 + ["G2"] * 2 + ["D2"] * 2 + ["A2"] * 2 + ["D2"] * 2):
        parts.append((i * bar, drone(N[root], bar + 0.3), 0.16))
        if i >= 2:  # frame drum comes in after two bars: dum tek . tek dum . tek .
            for k, hit in enumerate("DT.TD.T."):
                if hit == "D": parts.append((i * bar + k * e, dum(), 0.5))
                if hit == "T": parts.append((i * bar + k * e, tek(), 0.16))
    return mix(16 * bar, parts)[: int(16 * bar * SR)]

def seq(notes, gap, secs=0.5, vol=0.5, decay=4):
    return mix(gap * len(notes) + secs, [(i * gap, pluck(N[n], secs, decay), vol) for i, n in enumerate(notes)])

def sounds():
    rng = np.random.default_rng(7)
    squeak = lambda: fade(np.sin(2 * np.pi * (2400 + 9000 * t(0.05)) * t(0.05)) * 0.5, 0.002, 0.01)
    rats = mix(1.1, [(i * 0.07, tek(0.05), 0.35) for i in range(12)] + [(0.15 + i * 0.3, squeak(), 0.3) for i in range(3)])
    x = t(2.4)
    plague = fade((np.sin(2 * np.pi * 73.42 * x) + np.sin(2 * np.pi * 77.78 * x) + 0.3 * rng.uniform(-1, 1, len(x)) * np.exp(-x)) * np.sin(np.pi * x / 2.4) ** 2 * 0.5, 0.2, 0.5)
    x = t(1.8)
    gong = fade(sum(np.sin(2 * np.pi * f * x) * a * np.exp(-x * d) for f, a, d in ((110, 1, 1.6), (163, 0.5, 2.2), (247, 0.35, 3), (331, 0.2, 4))) * 0.4, 0.004, 0.3)
    return {
        "tap": fade(np.sin(2 * np.pi * 880 * t(0.05)) * np.exp(-t(0.05) * 40) * 0.5, 0.001, 0.01),
        "harvest": seq(["D5", "Fs5", "A5", "D6"], 0.09, 0.6, 0.4),
        "poor": seq(["Eb4", "D4"], 0.22, 0.8, 0.45, 3),
        "rats": rats,
        "starve": seq(["A3", "Eb3", "D3"], 0.32, 1.2, 0.5, 2.2),
        "arrive": seq(["G4", "D5"], 0.12, 0.5, 0.35),
        "plague": plague,
        "omen": gong,
        "win": mix(2.2, [(0, seq(["D5", "D5", "A5"], 0.16, 0.5, 0.45), 1), (0.5, pluck(N["D6"], 1.6, 1.8), 0.45), (0.5, pluck(N["A5"], 1.6, 1.8), 0.3), (0.5, pluck(N["Fs5"], 1.6, 1.8), 0.25)]),
        "lose": mix(2.4, [(0, seq(["D5", "C5", "Bb4", "A4"], 0.3, 0.9, 0.45, 2.5), 1), (1.2, dum(0.8), 0.7)]),
    }

def save(name, x):
    x = np.clip(x / max(1e-9, np.max(np.abs(x))) * (0.6 if name == "music" else 0.8), -1, 1)
    tmp = os.path.join(ROOT, "art", name + ".wav")
    with wave.open(tmp, "wb") as f:
        f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR); f.writeframes((x * 32767).astype("<i2").tobytes())
    for d in ("app/App/Audio", "web/play/audio"):
        os.makedirs(os.path.join(ROOT, d), exist_ok=True)
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", tmp, "-c:a", "libmp3lame", "-b:a", "64k" if name == "music" else "48k",
                        os.path.join(ROOT, d, name + ".mp3")], check=True)
    os.remove(tmp)

if __name__ == "__main__":
    save("music", music())
    for name, x in sounds().items(): save(name, x)
    print("music +", len(sounds()), "sounds")
