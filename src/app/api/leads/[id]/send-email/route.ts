import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';

export const maxDuration = 30;

function escapeHtml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildHtml(body: string): string {
  const paragraphs = body
    .split(/\n\n+/)
    .map((para) => {
      const inner = para.split('\n').map(escapeHtml).join('<br>');
      return `<p style="margin:0 0 18px;font-size:15px;line-height:1.75;color:#1c1917;">${inner}</p>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background-color:#f5f0e8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
    style="background-color:#f5f0e8;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
          style="max-width:580px;">

          <!-- Amber top bar -->
          <tr>
            <td style="background-color:#f59e0b;height:4px;border-radius:6px 6px 0 0;"></td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color:#ffffff;padding:40px 44px 24px;
              border-left:1px solid #e8dfd0;border-right:1px solid #e8dfd0;">
              ${paragraphs}
            </td>
          </tr>

          <!-- Signature -->
          <tr>
            <td style="background-color:#ffffff;padding:0 44px 32px;
              border-left:1px solid #e8dfd0;border-right:1px solid #e8dfd0;">
              <table cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
                <tr>
                  <td style="border-top:1px solid #e8dfd0;padding-top:20px;">
                    <table cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <!-- Logo -->
                        <td style="vertical-align:middle;padding-right:16px;">
                          <img src="https://clearsite.online/clearsite-logo.png" alt="Clearsite" width="120" style="display:block;border:0;outline:none;">
                        </td>
                        <!-- Divider -->
                        <td style="vertical-align:middle;padding-right:16px;">
                          <div style="width:1px;height:36px;background-color:#e8dfd0;"></div>
                        </td>
                        <!-- Name -->
                        <td style="vertical-align:middle;">
                          <span style="display:block;font-size:14px;font-weight:600;color:#1c1917;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">Jason Davis</span>
                          <span style="font-size:12px;color:#78716c;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">Clearsite</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#faf7f2;padding:18px 44px 24px;
              border-top:1px solid #f0e8d8;
              border-left:1px solid #e8dfd0;border-right:1px solid #e8dfd0;
              border-radius:0 0 6px 6px;">
              <p style="margin:0;font-size:11px;color:#b5a28a;line-height:1.5;">
                This message was sent via
                <span style="color:#d97706;">Clearsite</span>.
                Reply directly to this email to respond.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

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
    html: buildHtml(body.trim()),
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
