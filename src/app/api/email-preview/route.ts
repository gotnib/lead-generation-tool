import { NextResponse } from 'next/server';

const SAMPLE_BODY = `Hi Mike,

I came across Eastside Auto Care while looking at local repair shops in Charlotte — noticed you've built up a solid reputation with your customers, which says a lot.

One thing I did notice: your online presence isn't quite matching the quality of your actual work. You're not showing up on the first page for searches like "auto repair Charlotte" or "mechanic near me," and that's likely costing you new customers every week who end up calling a competitor instead.

We build fast, clean websites for shops like yours — ones that actually rank on Google and turn visitors into calls. Most of our clients start seeing results within 90 days.

Would it be worth a quick 15-minute call to see if it makes sense? No pitch, just an honest look at where things stand.`;

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
  <title>Email Preview</title>
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
                    <!-- Logo mark + wordmark -->
                    <table cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:14px;">
                      <tr>
                        <td style="width:36px;height:36px;background-color:#f59e0b;border-radius:18px;text-align:center;vertical-align:middle;">
                          <span style="color:#ffffff;font-size:19px;font-weight:900;font-family:Georgia,'Times New Roman',serif;line-height:36px;">C</span>
                        </td>
                        <td style="padding-left:10px;vertical-align:middle;">
                          <span style="font-size:17px;font-weight:700;color:#1c1917;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">Clear</span><span style="font-size:17px;font-weight:700;color:#d97706;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">site</span><br>
                          <span style="font-size:9px;letter-spacing:0.12em;color:#a8a29e;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">FIND&nbsp;&middot;&nbsp;ENRICH&nbsp;&middot;&nbsp;CONNECT&nbsp;&middot;&nbsp;GROW</span>
                        </td>
                      </tr>
                    </table>
                    <!-- Sender name -->
                    <table cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
                      <tr>
                        <td style="border-top:1px solid #f0e8d8;padding-top:10px;">
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

export async function GET() {
  return new NextResponse(buildHtml(SAMPLE_BODY), {
    headers: { 'Content-Type': 'text/html' },
  });
}
