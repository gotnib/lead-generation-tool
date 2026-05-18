import { NextResponse } from 'next/server';
import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import { prisma } from '@/lib/prisma';
import { Readable } from 'stream';

export const maxDuration = 55;

export async function POST() {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  if (!gmailUser || !gmailPass) {
    return NextResponse.json({ error: 'Email not configured' }, { status: 500 });
  }

  const leads = await prisma.lead.findMany({
    where: { contactEmail: { not: null } },
    select: { id: true, contactEmail: true },
  });

  if (leads.length === 0) return NextResponse.json({ updatedIds: [] });

  const client = new ImapFlow({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: { user: gmailUser, pass: gmailPass },
    logger: false,
  });

  const updatedIds: string[] = [];

  try {
    await client.connect();
    await client.mailboxOpen('INBOX');

    for (const lead of leads) {
      const contactEmail = lead.contactEmail!;

      const searchResult = await client.search({ from: contactEmail });
      const uids: number[] = Array.isArray(searchResult) ? searchResult : [];
      if (uids.length === 0) continue;

      const existing = await prisma.email.findMany({
        where: { leadId: lead.id, direction: 'received' },
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

        const fromAddr = parsed.from?.value?.[0]?.address ?? contactEmail;
        const toValue = Array.isArray(parsed.to) ? parsed.to[0] : parsed.to;
        const toAddr = toValue?.value?.[0]?.address ?? gmailUser;
        const subject = parsed.subject ?? '(no subject)';
        const body = (parsed.text ?? '').trim();
        const date = parsed.date ?? new Date();

        const key = `${fromAddr}|${subject}|${date.toISOString().slice(0, 16)}`;
        if (existingKeys.has(key)) continue;

        newEmails.push({ subject, body, fromAddr, toAddr, createdAt: date });
        existingKeys.add(key);
      }

      if (newEmails.length > 0) {
        await Promise.all(
          newEmails.map((e) =>
            prisma.email.create({ data: { leadId: lead.id, direction: 'received', ...e } })
          )
        );
        await prisma.lead.update({
          where: { id: lead.id },
          data: { hasUnreadReply: true },
        });
        updatedIds.push(lead.id);
      }
    }

    await client.logout();
  } catch (err) {
    console.error('Global IMAP sync error:', err);
    try { await client.logout(); } catch { /* ignore */ }
  }

  return NextResponse.json({ updatedIds });
}
