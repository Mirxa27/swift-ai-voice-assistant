import { NextRequest, NextResponse } from 'next/server';
import { addReport, readReports, clearReports } from '../../../lib/crisis';

function auth(req: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET;
  const header = req.headers.get('authorization');
  return !!secret && header === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!auth(req)) return new NextResponse('Unauthorized', { status: 401 });
  const data = await readReports();
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  await addReport(body);
  return new NextResponse('OK');
}

export async function DELETE(req: NextRequest) {
  if (!auth(req)) return new NextResponse('Unauthorized', { status: 401 });
  await clearReports();
  return new NextResponse('OK');
}
