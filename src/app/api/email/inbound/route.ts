import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-webhook-secret');
  if (!secret || secret !== process.env.INBOUND_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { from, to, subject, body } = await req.json();
  if (!from) return NextResponse.json({ error: 'Missing from' }, { status: 400 });

  const lead = await prisma.lead.findFirst({
    where: { contactEmail: { equals: from, mode: 'insensitive' } },
  });

  if (!lead) {
    console.log(`Inbound email from ${from} — no matching lead found`);
    return NextResponse.json({ ok: true });
  }

  await prisma.email.create({
    data: {
      leadId: lead.id,
      direction: 'received',
      subject: subject ?? '(no subject)',
      body: body ?? '',
      fromAddr: from,
      toAddr: to ?? '',
    },
  });

  return NextResponse.json({ ok: true });
}
