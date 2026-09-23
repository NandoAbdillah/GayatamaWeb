import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export async function PATCH(req: NextRequest) {
  try {
    let body = {};
    try {
      body = await req.json();
    } catch {
      // no body
    }

    const authHeader = req.headers.get('authorization');

    const res = await fetch(`${BACKEND_URL}/api/notifikasi/read-all`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || 'Gagal menandai semua notifikasi dibaca.' },
      { status: 500 }
    );
  }
}
