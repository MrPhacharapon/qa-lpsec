import { NextResponse } from 'next/server';
import { getFullAppData } from '@/lib/sheets';

// Revalidate cache every 60 seconds at Vercel Edge
export const revalidate = 60;

export async function GET() {
  try {
    const data = await getFullAppData();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { status: 'error', message: errorMsg },
      { status: 500 }
    );
  }
}
