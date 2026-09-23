import { NextResponse } from 'next/server';

const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  'BGHxRpbw6tkPk01tgL65p2ThaT3zrzwRtnlSWbK6lJZC51GdYf2CdY-rrI0ol_SbhTjTeiUElZ0yeBpvQEENa1Y';

export async function GET() {
  return NextResponse.json({ publicKey: VAPID_PUBLIC_KEY });
}
