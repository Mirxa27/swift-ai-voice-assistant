import { NextRequest, NextResponse } from 'next/server';
import { readProviders, writeProviders } from '../../../lib/providers';
import { verifyAdmin } from '../../../lib/auth';


export async function GET(req: NextRequest) {
  if (!verifyAdmin(req)) return new NextResponse('Unauthorized', { status: 401 });
  const data = await readProviders();
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  if (!verifyAdmin(req)) return new NextResponse('Unauthorized', { status: 401 });
  try {
    const body = await req.json();
    await writeProviders(body);
    return new NextResponse('OK');
  } catch {
    return new NextResponse('Invalid', { status: 400 });
  }
}
