import { NextRequest, NextResponse } from 'next/server';
import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import { prisma } from '@/lib/prisma';
import { Readable } from 'stream';

export const maxDuration = 30;

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (!lead.contactEmail) {
    return NextResponse.json({ error: 'No contact email set for this lead' }, { status: 400 });
  }

  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  if (!gmailUser || !gmailPass) {
    return NextResponse.json(
      { error: 'Email not configured. Add GMAIL_USER and GMAIL_APP_PASSWORD to env vars.' },
      { status: 500 }
    );
  }

  const client = new ImapFlow({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: { user: gmailUser, pass: gmailPass },
    logger: false,
  });

  try {
    await client.connect();
    await client.mailboxOpen('INBOX');

    const searchResult = await client.search({ from: lead.contactEmail });
    const uids: number[] = Array.isArray(searchResult) ? searchResult : [];

    if (uids.length === 0) {
      await client.logout();
      return NextResponse.json({ newCount: 0 });
    }

    // Fetch existing received emails to avoid duplicates
    const existing = await prisma.email.findMany({
      where: { leadId: id, direction: 'received' },
      select: { fromAddr: true, subject: true, createdAt: true },
    });
    const existingKeys = new Set(
      existing.map((e) => `${e.fromAddr}|${e.subject}|${e.createdAt.toISOString().slice(0, 16)}`)
    );

    const newEmails: {
      subject: string;
      body: string;
      fromAddr: string;
      toAddr: string;
      createdAt: Date;
    }[] = [];

    for await (const msg of client.fetch(uids, { source: true })) {
      if (!msg.source) continue;

      const source = msg.source instanceof Buffer
        ? msg.source
        : Buffer.from(msg.source as Uint8Array);

      const parsed = await simpleParser(Readable.from(source));

      const fromAddr = parsed.from?.value?.[0]?.address ?? lead.contactEmail;
      const toValue = Array.isArray(parsed.to) ? parsed.to[0] : parsed.to;
      const toAddr = toValue?.value?.[0]?.address ?? gmailUser;
      const subject = parsed.subject ?? '(no subject)';
      const body = parsed.text ?? '';
      const date = parsed.date ?? new Date();

      const key = `${fromAddr}|${subject}|${date.toISOString().slice(0, 16)}`;
      if (existingKeys.has(key)) continue;

      newEmails.push({ subject, body: body.trim(), fromAddr, toAddr, createdAt: date });
      existingKeys.add(key);
    }

    await client.logout();

    if (newEmails.length === 0) {
      return NextResponse.json({ newCount: 0 });
    }

    const created = await Promise.all(
      newEmails.map((e) =>
        prisma.email.create({
          data: { leadId: id, direction: 'received', ...e },
        })
      )
    );

    return NextResponse.json({
      newCount: created.length,
      emails: created.map((e) => ({ ...e, createdAt: e.createdAt.toISOString() })),
    });
  } catch (err) {
    console.error('IMAP sync error:', err);
    try { await client.logout(); } catch { /* ignore */ }
    return NextResponse.json({ error: 'Failed to sync emails' }, { status: 500 });
  }
}
