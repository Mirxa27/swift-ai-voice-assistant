import { NextRequest, NextResponse } from 'next/server';
import { readPrompts, writePrompts } from '../../../lib/prompts';
import { verifyAdmin } from '../../../lib/auth';


export async function GET(req: NextRequest) {
  if (!verifyAdmin(req)) return new NextResponse('Unauthorized', { status: 401 });
  const data = await readPrompts();
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  if (!verifyAdmin(req)) return new NextResponse('Unauthorized', { status: 401 });
  try {
    const body = await req.json();
    await writePrompts(body);
    return new NextResponse('OK');
  } catch {
    return new NextResponse('Invalid', { status: 400 });
  }
}
