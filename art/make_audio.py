"""Writes the music loop and every sound effect. Run: uv run --with numpy art/make_audio.py (needs ffmpeg)
No samples, no recordings: every sound is arithmetic. Output goes to app/App/Audio and web/play/audio as mp3."""
import os, subprocess, wave
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 44100
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

# ---- the music: a slow lo-fi loop. Kalimba over jazzy chords, a soft pad, a round bass, a quiet beat.
NOTE = {n: 440 * 2 ** ((i - 57) / 12) for i, n in enumerate(f"{k}{o}" for o in range(8) for k in ("C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"))}

def kalimba(hz, secs, vel=1.0):
    x = t(secs)
    body = np.sin(2 * np.pi * hz * x) * np.exp(-x * 3.2) + 0.35 * np.sin(2 * np.pi * hz * 2 * x) * np.exp(-x * 6)
    tine = 0.22 * np.sin(2 * np.pi * hz * 5.4 * x) * np.exp(-x * 30)  # the bright tick of the tine
    return fade(body + tine, 0.002, 0.08) * vel
def pad(freqs, secs):
    x = t(secs); out = 0
    for i, hz in enumerate(freqs):  # each note is three slightly detuned sines, so the chord shimmers
        out = out + sum(np.sin(2 * np.pi * hz * d * x + i) for d in (0.997, 1.0, 1.004)) / 3
    return fade(out / len(freqs) * (0.9 + 0.1 * np.sin(2 * np.pi * 0.2 * x)), 0.7, 0.9)
def bass(hz, secs):
    x = t(secs); return fade(np.tanh(1.6 * (np.sin(2 * np.pi * hz * x) + 0.25 * np.sin(4 * np.pi * hz * x))) * np.exp(-x * 1.1), 0.01, 0.08)
def ocarina(hz, secs):
    x = t(secs); vib = hz * (1 + 0.005 * np.sin(2 * np.pi * 5.2 * x) * np.minimum(1, x / 0.3))
    return fade(np.sin(2 * np.pi * np.cumsum(vib) / SR) + 0.12 * np.sin(4 * np.pi * np.cumsum(vib) / SR), 0.05, 0.12)
def kick(secs=0.28):
    x = t(secs); return fade(np.sin(2 * np.pi * (48 * x + 70 / 22 * (1 - np.exp(-22 * x)))) * np.exp(-x * 11), 0.002, 0.05)
def shaker(secs=0.07):
    n = np.random.default_rng(3).uniform(-1, 1, int(secs * SR)); n = np.diff(n, prepend=0)  # differencing leaves the hiss
    return fade(n * np.exp(-t(secs) * 55), 0.004, 0.02)

def comb(x, delay, gain):
    y = x.copy()
    for k in range(delay, len(x), delay): y[k:k + delay] += gain * y[k - delay:k][: len(y[k:k + delay])]
    return y
def reverb(x, seed):
    """A small room: four feedback delays of unrelated lengths, summed. Different lengths per ear."""
    return sum(comb(x, int(SR * d), 0.72) for d in np.array([0.0297, 0.0371, 0.0411, 0.0437]) * (1 + 0.035 * seed)) / 4

def music():
    beat = 60 / 84; e = beat / 2; bar = 4 * beat; swing = 0.09 * beat
    chords = [("A2", ["A3", "C4", "E4", "G4"]), ("F2", ["A3", "C4", "E4", "F4"]), ("C3", ["G3", "B3", "C4", "E4"]), ("G2", ["G3", "A3", "B3", "D4"])]
    # the tune, two bars to a line: (note, beats). A minor pentatonic, so it sits on every chord.
    tune = [("E5", 1.5), ("D5", .5), ("C5", 1), ("A4", 1), ("C5", 1.5), ("D5", .5), ("C5", 1), ("A4", 1),
            ("E5", 1), ("G5", 1), ("E5", 1), ("D5", 1), ("D5", 2), ("B4", 1), ("G4", 1),
            ("A5", 1.5), ("G5", .5), ("E5", 1), ("C5", 1), ("D5", 1), ("C5", 1), ("A4", 2),
            ("C5", 1), ("E5", 1), ("G5", 1), ("E5", 1), ("D5", 2), ("E5", 2)]
    dry, wet = [], []
    for i in range(16):
        at = i * bar; root, notes = chords[i % 4]
        wet.append((at, pad([NOTE[n] for n in notes], bar + 0.6), 0.20))
        dry.append((at, bass(NOTE[root], beat * 2.5), 0.50)); dry.append((at + beat * 2.5, bass(NOTE[root], beat * 1.2), 0.32))
        up = [NOTE[n] * 2 for n in notes]
        for k, step in enumerate((0, 2, 3, 2, 1, 2, 3, 1) if i % 2 == 0 else (0, 1, 2, 3, 2, 1, 3, 2)):  # the kalimba walks the chord
            if i < 2 and k % 2: continue  # the first two bars are sparse, so the loop breathes when it comes round
            wet.append((at + k * e + (swing if k % 2 else 0), kalimba(up[step], 1.4, 0.75 + 0.25 * ((k * 7 + i * 3) % 4) / 3), 0.20))
        if i >= 2:
            for k in (0, 2): dry.append((at + k * beat, kick(), 0.55))
            for k in range(8):
                if k % 2: dry.append((at + k * e + swing, shaker(), 0.10 + 0.05 * (k % 4 == 3)))
    at = 8 * bar  # the ocarina takes the second half
    for name, beats in tune:
        wet.append((at, ocarina(NOTE[name], beats * beat * 0.95), 0.16)); at += beats * beat
    n = int(16 * bar * SR)
    d, w = mix(32 * bar, dry + [(a + 16 * bar, s, v) for a, s, v in dry]), mix(32 * bar, wet + [(a + 16 * bar, s, v) for a, s, v in wet])
    out = []
    for seed in (0, 1):  # left, right
        room = reverb(w, seed)
        full = d + w * 0.8 + room * 0.55
        out.append(np.tanh(full[n: 2 * n] * 1.3))  # the second pass, so the room's tail is already ringing at the loop point
    return np.stack(out, axis=1)

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
    if x.ndim == 1: x = np.stack([x, x], axis=1)
    x = np.clip(x / max(1e-9, np.max(np.abs(x))) * (0.85 if name == "music" else 0.8), -1, 1)
    tmp = os.path.join(ROOT, "art", name + ".wav")
    with wave.open(tmp, "wb") as f:
        f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes((x * 32767).astype("<i2").tobytes())
    for d in ("app/App/Audio", "web/play/audio"):
        os.makedirs(os.path.join(ROOT, d), exist_ok=True)
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", tmp, "-c:a", "libmp3lame", "-b:a", "128k" if name == "music" else "96k",
                        os.path.join(ROOT, d, name + ".mp3")], check=True)
    os.remove(tmp)

if __name__ == "__main__":
    save("music", music())
    for name, x in sounds().items(): save(name, x)
    print("music +", len(sounds()), "sounds")
