"""Generate 8-bit style sound effects for Quest 404."""
import wave
import struct
import math
import os

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

def noise(duration, volume=0.2):
    """Generate noise."""
    import random
    samples = []
    n = int(SAMPLE_RATE * duration)
    random.seed(42)
    for _ in range(n):
        samples.append(random.uniform(-1, 1) * volume * 32767)
    return samples

def fade_out(samples, fade_samples=None):
    if fade_samples is None:
        fade_samples = len(samples) // 3
    for i in range(fade_samples):
        idx = len(samples) - fade_samples + i
        if idx >= 0 and idx < len(samples):
            samples[idx] *= (1.0 - i / fade_samples)
    return samples

def fade_in(samples, fade_samples=500):
    for i in range(min(fade_samples, len(samples))):
        samples[i] *= (i / fade_samples)
    return samples

# --- SFX: Menu selection bip ---
def gen_sfx_choice():
    s = square_wave(880, 0.05, 0.25)
    s += square_wave(1320, 0.05, 0.2)
    return fade_out(s, 200)

# --- SFX: Victory fanfare ---
def gen_sfx_victory():
    notes = [523, 659, 784, 1047]  # C5 E5 G5 C6
    s = []
    for i, note in enumerate(notes):
        dur = 0.15 if i < 3 else 0.4
        s += square_wave(note, dur, 0.25)
        s += [0] * int(SAMPLE_RATE * 0.03)  # tiny gap
    return fade_out(s, 2000)

# --- SFX: Death/fail wah-wah ---
def gen_sfx_death():
    s = []
    duration = 0.8
    n = int(SAMPLE_RATE * duration)
    for i in range(n):
        t = i / SAMPLE_RATE
        progress = i / n
        # Descending frequency from 400 to 100 Hz
        freq = 400 - 300 * progress
        val = 1.0 if math.sin(2 * math.pi * freq * t) >= 0 else -1.0
        # Volume decreases
        vol = 0.3 * (1.0 - progress * 0.7)
        s.append(val * vol * 32767)
    return s

# --- Music: Simple chiptune loop ---
def gen_music_loop():
    # A simple medieval/adventure melody loop (~8 seconds)
    bpm = 140
    beat = 60.0 / bpm

    # Melody notes (freq, beats)
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

    # Bass notes (simpler)
    bass = [
        (165, 4), (147, 4),  # E3, D3
        (220, 4), (165, 4),  # A3, E3
        (147, 4), (131, 4),  # D3, C3
        (196, 4), (147, 4),  # G3, D3
    ]

    total_beats = sum(b for _, b in melody)
    total_duration = total_beats * beat
    n = int(SAMPLE_RATE * total_duration)

    # Generate melody
    melody_samples = []
    for freq, beats in melody:
        dur = beats * beat
        note_samples = square_wave(freq, dur, 0.18)
        # Add slight attack/release
        note_samples = fade_in(note_samples, 100)
        note_samples = fade_out(note_samples, int(len(note_samples) * 0.15))
        melody_samples += note_samples

    # Generate bass
    bass_samples = []
    for freq, beats in bass:
        dur = beats * beat
        note_samples = square_wave(freq, dur, 0.12)
        note_samples = fade_in(note_samples, 80)
        note_samples = fade_out(note_samples, int(len(note_samples) * 0.1))
        bass_samples += note_samples

    # Mix
    min_len = min(len(melody_samples), len(bass_samples))
    mixed = []
    for i in range(min_len):
        mixed.append(melody_samples[i] + bass_samples[i])

    # Add remaining melody if longer
    if len(melody_samples) > min_len:
        mixed += melody_samples[min_len:]

    return mixed

if __name__ == '__main__':
    script_dir = os.path.dirname(os.path.abspath(__file__))

    print("Generating sfx_choice.wav...")
    write_wav(os.path.join(script_dir, 'sfx_choice.wav'), gen_sfx_choice())

    print("Generating sfx_victory.wav...")
    write_wav(os.path.join(script_dir, 'sfx_victory.wav'), gen_sfx_victory())

    print("Generating sfx_death.wav...")
    write_wav(os.path.join(script_dir, 'sfx_death.wav'), gen_sfx_death())

    print("Generating music_loop.wav...")
    write_wav(os.path.join(script_dir, 'music_loop.wav'), gen_music_loop())

    print("Done! All audio files generated.")
