import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';

export const maxDuration = 30;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (!lead.contactEmail) return NextResponse.json({ error: 'No contact email set for this lead' }, { status: 400 });

  const fromEmail = process.env.FROM_EMAIL;
  const apiKey = process.env.RESEND_API_KEY;
  if (!fromEmail || !apiKey) {
    return NextResponse.json({ error: 'Email not configured. Add RESEND_API_KEY and FROM_EMAIL to env vars.' }, { status: 500 });
  }

  const { subject, body } = await req.json();
  if (!subject?.trim() || !body?.trim()) {
    return NextResponse.json({ error: 'Subject and body are required' }, { status: 400 });
  }

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from: fromEmail,
    to: lead.contactEmail,
    subject: subject.trim(),
    text: body.trim(),
  });

  if (error) {
    console.error('Resend error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const email = await prisma.email.create({
    data: {
      leadId: id,
      direction: 'sent',
      subject: subject.trim(),
      body: body.trim(),
      fromAddr: fromEmail,
      toAddr: lead.contactEmail,
    },
  });

  return NextResponse.json({ ...email, createdAt: email.createdAt.toISOString() });
}
