import { NextRequest, NextResponse } from 'next/server';
import { addReport, readReports, clearReports } from '../../../lib/crisis';
import { verifyAdmin } from '../../../lib/auth';


export async function GET(req: NextRequest) {
  if (!verifyAdmin(req)) return new NextResponse('Unauthorized', { status: 401 });
  const data = await readReports();
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  await addReport(body);
  return new NextResponse('OK');
}

export async function DELETE(req: NextRequest) {
  if (!verifyAdmin(req)) return new NextResponse('Unauthorized', { status: 401 });
  await clearReports();
  return new NextResponse('OK');
}
