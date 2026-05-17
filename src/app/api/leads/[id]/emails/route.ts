import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const emails = await prisma.email.findMany({
    where: { leadId: id },
    orderBy: { createdAt: 'asc' },
  });
  return NextResponse.json(emails.map((e) => ({ ...e, createdAt: e.createdAt.toISOString() })));
}
