import { NextRequest, NextResponse } from 'next/server';
import { readProviders, writeProviders } from '../../../lib/providers';

function auth(req: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET;
  const header = req.headers.get('authorization');
  return !!secret && header === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!auth(req)) return new NextResponse('Unauthorized', { status: 401 });
  const data = await readProviders();
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return new NextResponse('Unauthorized', { status: 401 });
  try {
    const body = await req.json();
    await writeProviders(body);
    return new NextResponse('OK');
  } catch {
    return new NextResponse('Invalid', { status: 400 });
  }
}
