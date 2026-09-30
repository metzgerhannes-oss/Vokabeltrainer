#!/usr/bin/env python3
from __future__ import annotations
import json
import shutil
import subprocess
import sys
import tempfile
import wave
from pathlib import Path

OUT_DIR = Path('assets/audio/phonemes/de/generated')
OUT_WAV = OUT_DIR / 'phonemes.wav'
OUT_JSON = OUT_DIR / 'phonemes.json'
RATE = 160
AMPLITUDE = 170
LEAD_SECONDS = 0.15
GAP_SECONDS = 0.12
PHONEMES = [
    ('A','a','a:'),('B','b','b'),('C','c','k'),('D','d','d'),('E','e','e:'),('F','f','f f'),('G','g','g'),('H','h','h h'),
    ('I','i','i:'),('J','j','j'),('K','k','k'),('L','l','l l'),('M','m','m m'),('N','n','n n'),('O','o','o:'),('P','p','p'),
    ('Q','q','kv'),('R','r','r r'),('S','s','s s'),('T','t','t'),('U','u','u:'),('V','v','f f'),('W','w','v v'),('X','x','ks'),
    ('Y','y','y:'),('Z','z','ts'),('Ä','ae','E:'),('Ö','oe','Y:'),('Ü','ue','y:')
]

def fail(message: str) -> None:
    print(f'phoneme generation failed: {message}', file=sys.stderr)
    raise SystemExit(1)

def main() -> None:
    espeak = shutil.which('espeak')
    if not espeak:
        fail('espeak is required')
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory(prefix='vt-phoneme-') as tmp:
        temp = Path(tmp)
        clips = []
        params = None

        for letter, slug, phoneme in PHONEMES:
            target = temp / f'{slug}.wav'
            result = subprocess.run(
                [espeak, '-v', 'de', '-s', str(RATE), '-a', str(AMPLITUDE), '-w', str(target), f'[[{phoneme}]]'],
                capture_output=True,
                text=True,
            )
            if result.returncode != 0:
                fail(f'espeak {letter}: {result.stderr.strip()}')

            with wave.open(str(target), 'rb') as wav:
                current = (wav.getnchannels(), wav.getsampwidth(), wav.getframerate(), wav.getcomptype())
                if params is None:
                    params = current
                elif current != params:
                    fail(f'inconsistent WAV parameters for {letter}: {current} vs {params}')
                clips.append((letter, wav.readframes(wav.getnframes()), wav.getnframes()))

        channels, width, sample_rate, compression = params
        if channels != 1 or width != 2 or compression != 'NONE':
            fail(f'unexpected PCM format {params}')

        lead_frames = round(sample_rate * LEAD_SECONDS)
        gap_frames = round(sample_rate * GAP_SECONDS)
        silent_frame = b'\x00' * (width * channels)
        frames = bytearray(silent_frame * lead_frames)
        manifest = {
            'version': 1,
            'format': 'audio/wav',
            'sampleRate': sample_rate,
            'channels': channels,
            'clips': {},
        }

        for letter, data, frame_count in clips:
            start = len(frames) / (width * channels * sample_rate)
            frames.extend(data)
            duration = frame_count / sample_rate
            manifest['clips'][letter] = [round(start, 5), round(duration, 5)]
            frames.extend(silent_frame * gap_frames)

        manifest['duration'] = round(len(frames) / (width * channels * sample_rate), 5)

        with wave.open(str(OUT_WAV), 'wb') as output:
            output.setnchannels(channels)
            output.setsampwidth(width)
            output.setframerate(sample_rate)
            output.writeframes(bytes(frames))

        OUT_JSON.write_text(
            json.dumps(manifest, ensure_ascii=False, separators=(',', ':')) + '\n',
            encoding='utf-8',
        )

    with wave.open(str(OUT_WAV), 'rb') as check:
        duration = check.getnframes() / check.getframerate()
        if check.getnchannels() != 1 or check.getsampwidth() != 2 or duration < 18:
            fail('generated WAV validation failed')

    if len(manifest['clips']) != 29:
        fail('generated manifest must contain 29 letter sounds')

    print(
        f'Generated {OUT_WAV} ({OUT_WAV.stat().st_size} bytes) and {OUT_JSON}; '
        f'duration={manifest["duration"]}s clips={len(manifest["clips"])}'
    )

if __name__ == '__main__':
    main()
