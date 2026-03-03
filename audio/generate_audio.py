"""Generate 8-bit style sound effects and music for the adventure game."""
import wave
import struct
import math
import os
import random

SAMPLE_RATE = 22050


def write_wav(filename, samples):
    with wave.open(filename, 'w') as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(SAMPLE_RATE)
        for s in samples:
            clamped = max(-32767, min(32767, int(s)))
            f.writeframes(struct.pack('<h', clamped))


def square_wave(freq, duration, volume=0.3):
    """Generate a square wave (classic 8-bit sound)."""
    samples = []
    n = int(SAMPLE_RATE * duration)
    for i in range(n):
        t = i / SAMPLE_RATE
        val = 1.0 if math.sin(2 * math.pi * freq * t) >= 0 else -1.0
        samples.append(val * volume * 32767)
    return samples


def triangle_wave(freq, duration, volume=0.3):
    """Generate a triangle wave (softer 8-bit sound)."""
    samples = []
    n = int(SAMPLE_RATE * duration)
    for i in range(n):
        t = i / SAMPLE_RATE
        phase = (t * freq) % 1.0
        val = 4.0 * abs(phase - 0.5) - 1.0
        samples.append(val * volume * 32767)
    return samples


def noise(duration, volume=0.2):
    """Generate noise."""
    samples = []
    n = int(SAMPLE_RATE * duration)
    rng = random.Random(42)
    for _ in range(n):
        samples.append(rng.uniform(-1, 1) * volume * 32767)
    return samples


def silence(duration):
    """Generate silence."""
    return [0] * int(SAMPLE_RATE * duration)


def fade_out(samples, fade_samples=None):
    if fade_samples is None:
        fade_samples = len(samples) // 3
    for i in range(fade_samples):
        idx = len(samples) - fade_samples + i
        if 0 <= idx < len(samples):
            samples[idx] *= (1.0 - i / fade_samples)
    return samples


def fade_in(samples, fade_samples=500):
    for i in range(min(fade_samples, len(samples))):
        samples[i] *= (i / fade_samples)
    return samples


def mix_tracks(*tracks):
    """Mix multiple sample lists together."""
    max_len = max(len(t) for t in tracks)
    mixed = [0.0] * max_len
    for track in tracks:
        for i, s in enumerate(track):
            mixed[i] += s
    # Clamp
    for i in range(len(mixed)):
        mixed[i] = max(-32767, min(32767, mixed[i]))
    return mixed


def make_melody(notes, bpm, wave_fn=square_wave, volume=0.18):
    """Generate a melody from a list of (freq, beats) tuples.
    freq=0 means rest/silence."""
    beat = 60.0 / bpm
    samples = []
    for freq, beats in notes:
        dur = beats * beat
        if freq == 0:
            samples += silence(dur)
        else:
            note_samples = wave_fn(freq, dur, volume)
            note_samples = fade_in(note_samples, 100)
            note_samples = fade_out(note_samples, int(len(note_samples) * 0.15))
            samples += note_samples
    return samples


def make_bass(notes, bpm, volume=0.12):
    """Generate a bass line from (freq, beats) tuples."""
    return make_melody(notes, bpm, wave_fn=square_wave, volume=volume)


# ============================================================
# SFX
# ============================================================

def gen_sfx_choice():
    """Menu selection bip."""
    s = square_wave(880, 0.05, 0.25)
    s += square_wave(1320, 0.05, 0.2)
    return fade_out(s, 200)


def gen_sfx_victory():
    """Victory fanfare."""
    notes = [523, 659, 784, 1047]  # C5 E5 G5 C6
    s = []
    for i, note in enumerate(notes):
        dur = 0.15 if i < 3 else 0.4
        s += square_wave(note, dur, 0.25)
        s += silence(0.03)
    return fade_out(s, 2000)


def gen_sfx_death():
    """Death/fail wah-wah."""
    s = []
    duration = 0.8
    n = int(SAMPLE_RATE * duration)
    for i in range(n):
        t = i / SAMPLE_RATE
        progress = i / n
        freq = 400 - 300 * progress
        val = 1.0 if math.sin(2 * math.pi * freq * t) >= 0 else -1.0
        vol = 0.3 * (1.0 - progress * 0.7)
        s.append(val * vol * 32767)
    return s


# ============================================================
# MUSIC — Menú / Landing
# ============================================================

def gen_music_menu():
    """Calm, mysterious chiptune for the menu and title screen (~12s loop).
    Ambient, slightly mystical — sets the adventure mood."""
    bpm = 90

    # Melody: pentatonic, airy, with rests
    melody = [
        (330, 2), (0, 1), (392, 1), (440, 2), (0, 1), (330, 1),   # E4 . G4 A4 . E4
        (494, 2), (440, 1), (392, 1), (330, 2), (0, 2),            # B4 A4 G4 E4 .
        (294, 2), (0, 1), (330, 1), (392, 2), (330, 1), (294, 1),  # D4 . E4 G4 E4 D4
        (262, 2), (294, 1), (330, 1), (294, 4),                    # C4 D4 E4 D4----
    ]

    # Bass: sustained notes, triangle wave for softness
    bass = [
        (165, 4), (165, 4),  # E3
        (147, 4), (147, 4),  # D3
        (131, 4), (131, 4),  # C3
        (147, 4), (147, 4),  # D3
    ]

    melody_s = make_melody(melody, bpm, wave_fn=triangle_wave, volume=0.15)
    bass_s = make_melody(bass, bpm, wave_fn=triangle_wave, volume=0.10)

    return mix_tracks(melody_s, bass_s)


# ============================================================
# MUSIC — Gameplay (adventure, exploration)
# ============================================================

def gen_music_adventure():
    """Upbeat adventure theme for gameplay (~8s loop).
    The original music_loop — medieval/energetic."""
    bpm = 140

    melody = [
        (330, 1), (392, 1), (440, 1), (392, 1),  # E4 G4 A4 G4
        (330, 1), (294, 1), (330, 2),              # E4 D4 E4
        (440, 1), (494, 1), (523, 1), (494, 1),    # A4 B4 C5 B4
        (440, 1), (392, 1), (330, 2),              # A4 G4 E4
        (294, 1), (330, 1), (392, 1), (330, 1),    # D4 E4 G4 E4
        (294, 1), (262, 1), (294, 2),              # D4 C4 D4
        (392, 1), (440, 1), (392, 1), (330, 1),    # G4 A4 G4 E4
        (294, 1), (330, 1), (294, 2),              # D4 E4 D4
    ]

    bass = [
        (165, 4), (147, 4),  # E3, D3
        (220, 4), (165, 4),  # A3, E3
        (147, 4), (131, 4),  # D3, C3
        (196, 4), (147, 4),  # G3, D3
    ]

    melody_s = make_melody(melody, bpm, volume=0.18)
    bass_s = make_bass(bass, bpm, volume=0.12)

    return mix_tracks(melody_s, bass_s)


def gen_music_tension():
    """Tense/suspenseful theme for dangerous nodes (~10s loop).
    Minor key, slower, with chromatic bass."""
    bpm = 100

    # Melody: minor, sparse, with rests for suspense
    melody = [
        (330, 2), (311, 2), (294, 2), (0, 2),      # E4 Eb4 D4 .
        (262, 1), (294, 1), (311, 2), (0, 4),       # C4 D4 Eb4 .---
        (349, 2), (330, 2), (311, 2), (0, 2),       # F4 E4 Eb4 .
        (294, 1), (262, 1), (247, 2), (262, 4),     # D4 C4 B3 C4---
    ]

    # Bass: chromatic descent, ominous
    bass = [
        (165, 4), (156, 4),  # E3 Eb3
        (147, 4), (139, 4),  # D3 Db3
        (131, 4), (139, 4),  # C3 Db3
        (147, 4), (131, 4),  # D3 C3
    ]

    melody_s = make_melody(melody, bpm, wave_fn=square_wave, volume=0.14)
    bass_s = make_melody(bass, bpm, wave_fn=square_wave, volume=0.10)

    # Add sparse noise hits for atmosphere
    beat = 60.0 / bpm
    total = int(sum(b for _, b in melody) * beat * SAMPLE_RATE)
    noise_layer = [0.0] * total
    rng = random.Random(99)
    for i in range(total):
        if rng.random() < 0.002:
            for j in range(min(200, total - i)):
                noise_layer[i + j] = rng.uniform(-1, 1) * 0.04 * 32767

    return mix_tracks(melody_s, bass_s, noise_layer)


# ============================================================
# MUSIC — Victory ending (epic/triumphant)
# ============================================================

def gen_music_victory():
    """Epic victory music that plays after the victory SFX (~10s).
    Triumphant, major key, layered."""
    bpm = 130

    # Melody: heroic, ascending, major key
    melody = [
        (523, 1), (587, 1), (659, 1), (784, 1),    # C5 D5 E5 G5
        (880, 2), (784, 1), (659, 1),                # A5-- G5 E5
        (784, 2), (659, 1), (523, 1),                # G5-- E5 C5
        (587, 1), (659, 2), (0, 1),                  # D5 E5-- .
        (523, 1), (659, 1), (784, 1), (880, 1),     # C5 E5 G5 A5
        (1047, 3), (880, 1),                          # C6--- A5
        (784, 2), (659, 2),                           # G5-- E5--
        (523, 2), (0, 2),                             # C5-- .
    ]

    # Bass: power notes
    bass = [
        (262, 4), (220, 4),  # C4, A3
        (196, 4), (220, 4),  # G3, A3
        (262, 4), (220, 4),  # C4, A3
        (196, 4), (262, 4),  # G3, C4
    ]

    # Harmony: thirds above melody, softer
    harmony = [
        (659, 1), (698, 1), (784, 1), (988, 1),
        (1047, 2), (988, 1), (784, 1),
        (988, 2), (784, 1), (659, 1),
        (698, 1), (784, 2), (0, 1),
        (659, 1), (784, 1), (988, 1), (1047, 1),
        (1319, 3), (1047, 1),
        (988, 2), (784, 2),
        (659, 2), (0, 2),
    ]

    melody_s = make_melody(melody, bpm, volume=0.16)
    bass_s = make_bass(bass, bpm, volume=0.12)
    harmony_s = make_melody(harmony, bpm, wave_fn=triangle_wave, volume=0.08)

    return mix_tracks(melody_s, bass_s, harmony_s)


# ============================================================
# MUSIC — Death/game over ending (somber)
# ============================================================

def gen_music_death():
    """Somber game-over music that plays after the death SFX (~8s).
    Slow, minor, descending. Comedic-tragic feel."""
    bpm = 70

    # Melody: descending, minor, with pauses
    melody = [
        (392, 2), (370, 2), (330, 2), (311, 2),    # G4 F#4 E4 Eb4
        (294, 2), (262, 2), (247, 4),                # D4 C4 B3---
        (262, 2), (247, 2), (220, 2), (208, 2),     # C4 B3 A3 Ab3
        (196, 4), (0, 4),                             # G3--- .---
    ]

    # Bass: pedal tone, ominous
    bass = [
        (98, 8), (98, 8),    # G2---
        (87, 8), (98, 8),    # F2--- G2---
    ]

    melody_s = make_melody(melody, bpm, wave_fn=square_wave, volume=0.14)
    bass_s = make_melody(bass, bpm, wave_fn=triangle_wave, volume=0.10)

    return mix_tracks(melody_s, bass_s)


# ============================================================
# Generate all files
# ============================================================

if __name__ == '__main__':
    base_dir = os.path.dirname(os.path.abspath(__file__))
    sfx_dir = os.path.join(base_dir, 'sfx')
    music_dir = os.path.join(base_dir, 'music')

    os.makedirs(sfx_dir, exist_ok=True)
    os.makedirs(music_dir, exist_ok=True)

    # SFX
    print("Generating sfx/choice.wav...")
    write_wav(os.path.join(sfx_dir, 'choice.wav'), gen_sfx_choice())

    print("Generating sfx/victory.wav...")
    write_wav(os.path.join(sfx_dir, 'victory.wav'), gen_sfx_victory())

    print("Generating sfx/death.wav...")
    write_wav(os.path.join(sfx_dir, 'death.wav'), gen_sfx_death())

    # Music
    print("Generating music/menu.wav...")
    write_wav(os.path.join(music_dir, 'menu.wav'), gen_music_menu())

    print("Generating music/adventure.wav...")
    write_wav(os.path.join(music_dir, 'adventure.wav'), gen_music_adventure())

    print("Generating music/tension.wav...")
    write_wav(os.path.join(music_dir, 'tension.wav'), gen_music_tension())

    print("Generating music/victory.wav...")
    write_wav(os.path.join(music_dir, 'victory.wav'), gen_music_victory())

    print("Generating music/death.wav...")
    write_wav(os.path.join(music_dir, 'death.wav'), gen_music_death())

    print("\nDone! All audio files generated.")
    print(f"  SFX:   {sfx_dir}")
    print(f"  Music: {music_dir}")
