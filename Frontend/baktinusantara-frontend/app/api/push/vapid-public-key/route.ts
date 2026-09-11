import { NextResponse } from 'next/server';
import { pushStore } from '@/lib/server/push-store';

export async function GET() {
  const publicKey = pushStore.getVapidPublicKey();
  return NextResponse.json({ publicKey });
}
