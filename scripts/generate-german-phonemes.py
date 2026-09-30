#!/usr/bin/env python3
from __future__ import annotations
import json
import math
import shutil
import struct
import subprocess
import sys
import wave
from pathlib import Path

OUT_DIR = Path('assets/audio/phonemes/de/generated')
OUT_JSON = OUT_DIR / 'phonemes.json'
RATE = 160
AMPLITUDE = 170
MIN_DURATION = 0.30
MIN_RMS = 150.0
MIN_PEAK = 1000
PHONEMES = [
    ('A','a','a:'),('B','b','b'),('C','c','k'),('D','d','d'),('E','e','e:'),('F','f','f f'),('G','g','g'),('H','h','h h'),
    ('I','i','i:'),('J','j','j'),('K','k','k'),('L','l','l l'),('M','m','m m'),('N','n','n n'),('O','o','o:'),('P','p','p'),
    ('Q','q','kv'),('R','r','r r'),('S','s','s s'),('T','t','t'),('U','u','u:'),('V','v','f f'),('W','w','v v'),('X','x','ks'),
    ('Y','y','y:'),('Z','z','ts'),('Ä','ae','E:'),('Ö','oe','Y:'),('Ü','ue','y:')
]

def fail(message: str) -> None:
    print(f'phoneme generation failed: {message}', file=sys.stderr)
    raise SystemExit(1)

def pcm_stats(data: bytes) -> tuple[float, int]:
    if not data or len(data) % 2:
        fail('invalid PCM payload')
    values = struct.unpack('<' + 'h' * (len(data) // 2), data)
    peak = max(abs(value) for value in values)
    rms = math.sqrt(sum(value * value for value in values) / len(values))
    return rms, peak

def main() -> None:
    espeak = shutil.which('espeak')
    if not espeak:
        fail('espeak is required')
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    expected = {f'{slug}.wav' for _, slug, _ in PHONEMES} | {'phonemes.json'}
    for old in OUT_DIR.iterdir():
        if old.is_file() and old.name not in expected:
            old.unlink()

    manifest = {'version': 2, 'format': 'audio/wav', 'files': {}}
    for letter, slug, phoneme in PHONEMES:
        target = OUT_DIR / f'{slug}.wav'
        result = subprocess.run(
            [espeak, '-v', 'de', '-s', str(RATE), '-a', str(AMPLITUDE), '-w', str(target), f'[[{phoneme}]]'],
            capture_output=True,
            text=True,
        )
        if result.returncode != 0:
            fail(f'espeak {letter}: {result.stderr.strip()}')

        with wave.open(str(target), 'rb') as wav:
            channels = wav.getnchannels()
            width = wav.getsampwidth()
            sample_rate = wav.getframerate()
            compression = wav.getcomptype()
            frames = wav.getnframes()
            data = wav.readframes(frames)

        duration = frames / sample_rate
        if channels != 1 or width != 2 or compression != 'NONE':
            fail(f'unexpected PCM format for {letter}')
        rms, peak = pcm_stats(data)
        if duration < MIN_DURATION or rms < MIN_RMS or peak < MIN_PEAK:
            fail(f'inaudible phoneme {letter}: duration={duration:.3f}s rms={rms:.1f} peak={peak}')

        manifest['files'][letter] = {
            'file': f'{slug}.wav',
            'duration': round(duration, 5),
            'rms': round(rms, 1),
            'peak': peak,
        }

    if len(manifest['files']) != 29:
        fail('generated manifest must contain 29 letter sounds')

    OUT_JSON.write_text(
        json.dumps(manifest, ensure_ascii=False, separators=(',', ':')) + '\n',
        encoding='utf-8',
    )

    total = sum((OUT_DIR / entry['file']).stat().st_size for entry in manifest['files'].values())
    quietest = min((entry['rms'], letter) for letter, entry in manifest['files'].items())
    print(
        f'Generated {len(manifest["files"])} native WAV phonemes ({total} bytes total); '
        f'quietest={quietest[1]} rms={quietest[0]}'
    )

if __name__ == '__main__':
    main()
