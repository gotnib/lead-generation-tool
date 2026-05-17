import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
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

  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  const fromEmail = process.env.FROM_EMAIL ?? gmailUser;

  if (!gmailUser || !gmailPass) {
    return NextResponse.json(
      { error: 'Email not configured. Add GMAIL_USER and GMAIL_APP_PASSWORD to env vars.' },
      { status: 500 }
    );
  }

  const { subject, body } = await req.json();
  if (!subject?.trim() || !body?.trim()) {
    return NextResponse.json({ error: 'Subject and body are required' }, { status: 400 });
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: { user: gmailUser, pass: gmailPass },
  });

  await transporter.sendMail({
    from: `"${fromEmail}" <${fromEmail}>`,
    to: lead.contactEmail,
    subject: subject.trim(),
    text: body.trim(),
  });

  const email = await prisma.email.create({
    data: {
      leadId: id,
      direction: 'sent',
      subject: subject.trim(),
      body: body.trim(),
      fromAddr: fromEmail ?? gmailUser,
      toAddr: lead.contactEmail,
    },
  });

  return NextResponse.json({ ...email, createdAt: email.createdAt.toISOString() });
}
