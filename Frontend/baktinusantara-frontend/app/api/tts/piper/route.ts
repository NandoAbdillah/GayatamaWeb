import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

const PIPER_SERVER_URL = process.env.PIPER_SERVER_URL || 'http://127.0.0.1:5005';

export async function GET() {
  try {
    const res = await fetch(`${PIPER_SERVER_URL}/info`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(1500),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({ available: true, ...data });
    }
  } catch {
    // Piper server not reachable
  }

  return NextResponse.json(
    {
      available: false,
      message: 'Piper TTS server is not running on localhost:5005. Fallback TTS will be used.',
    },
    { status: 200 }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text = typeof body?.text === 'string' ? body.text.trim() : '';

    if (!text) {
      return NextResponse.json({ error: 'Text parameter is required' }, { status: 400 });
    }

    // 1. Try fast synthesis via local Piper HTTP server
    try {
      const piperRes = await fetch(`${PIPER_SERVER_URL}/synthesize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
        signal: AbortSignal.timeout(8000),
      });

      if (piperRes.ok) {
        const audioBuffer = await piperRes.arrayBuffer();
        return new NextResponse(audioBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'audio/wav',
            'Content-Length': audioBuffer.byteLength.toString(),
            'Cache-Control': 'public, max-age=3600',
          },
        });
      }
    } catch {
      // Piper server not responding, try direct python fallback synthesis
    }

    // 2. Direct python fallback synthesis if HTTP server is temporarily down
    try {
      const modelPath = path.join(process.cwd(), 'data', 'piper', 'id_ID-news_tts-medium.onnx');
      const audioBuffer = await synthesizeDirectPython(text, modelPath);
      if (audioBuffer && audioBuffer.length > 0) {
        return new NextResponse(new Uint8Array(audioBuffer), {
          status: 200,
          headers: {
            'Content-Type': 'audio/wav',
            'Content-Length': audioBuffer.length.toString(),
            'Cache-Control': 'public, max-age=3600',
          },
        });
      }
    } catch (directErr) {
      console.error('[Piper TTS API Direct Error]', directErr);
    }

    return NextResponse.json(
      { error: 'Piper TTS synthesis unavailable' },
      { status: 503 }
    );
  } catch (err: any) {
    console.error('[Piper TTS API Route Error]', err);
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}

function synthesizeDirectPython(text: string, modelPath: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const pyCode = `
import sys, io, wave
from piper import PiperVoice
text = sys.stdin.read().strip()
if text:
    voice = PiperVoice.load(r"${modelPath.replace(/\\/g, '\\\\')}")
    buf = io.BytesIO()
    with wave.open(buf, 'wb') as f:
        voice.synthesize_wav(text, f)
    sys.stdout.buffer.write(buf.getvalue())
`;
    const child = spawn('python', ['-c', pyCode], { stdio: ['pipe', 'pipe', 'pipe'] });
    const chunks: Buffer[] = [];
    const errChunks: Buffer[] = [];

    child.stdout.on('data', (c) => chunks.push(c));
    child.stderr.on('data', (c) => errChunks.push(c));

    child.on('close', (code) => {
      if (code === 0 && chunks.length > 0) {
        resolve(Buffer.concat(chunks));
      } else {
        reject(new Error(Buffer.concat(errChunks).toString('utf-8') || `Exited with code ${code}`));
      }
    });

    child.stdin.write(text);
    child.stdin.end();
  });
}
