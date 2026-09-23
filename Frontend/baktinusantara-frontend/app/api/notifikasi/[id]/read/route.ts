import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const authHeader = req.headers.get('authorization');
    const { searchParams } = new URL(req.url);

    const res = await fetch(`${BACKEND_URL}/api/notifikasi/${id}/read?${searchParams.toString()}`, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || 'Gagal menandai notifikasi dibaca.' },
      { status: 500 }
    );
  }
}
