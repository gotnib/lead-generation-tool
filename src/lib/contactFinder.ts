import Anthropic from '@anthropic-ai/sdk';

interface ContactResult {
  contactName: string | null;
  contactEmail: string | null;
}

interface LeadInfo {
  businessName: string;
  website: string | null;
  category: string;
  city: string;
}

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

async function fetchPage(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LeadBot/1.0)' },
    signal: AbortSignal.timeout(6000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

async function scrapeWebsite(rawUrl: string): Promise<{ text: string; emails: string[] }> {
  const base = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
  const origin = new URL(base).origin;

  const pagesToTry = [
    base,
    `${origin}/contact`,
    `${origin}/contact-us`,
    `${origin}/about`,
    `${origin}/about-us`,
    `${origin}/team`,
  ];

  const emailSet = new Set<string>();
  const textParts: string[] = [];

  for (const url of pagesToTry) {
    try {
      const html = await fetchPage(url);
      const emails = html.match(EMAIL_RE) ?? [];
      emails.forEach((e) => emailSet.add(e.toLowerCase()));
      textParts.push(stripHtml(html).slice(0, 4000));
    } catch {
      // page not found or timed out — continue
    }
    if (emailSet.size > 0 && textParts.length >= 2) break; // enough data
  }

  return {
    text: textParts.join('\n---\n').slice(0, 12000),
    emails: Array.from(emailSet).filter((e) => !e.includes('example.com')),
  };
}

export async function findContact(lead: LeadInfo): Promise<ContactResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');

  let context = 'No website available for this business.';

  if (lead.website) {
    try {
      const { text, emails } = await scrapeWebsite(lead.website);
      const emailList = emails.length > 0 ? `Emails found on site: ${emails.join(', ')}` : 'No email addresses found on site.';
      context = `Website content (excerpts):\n${text}\n\n${emailList}`;
    } catch {
      context = `Website (${lead.website}) could not be fetched.`;
    }
  }

  const client = new Anthropic({ apiKey });

  const msg = await client.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 256,
    messages: [
      {
        role: 'user',
        content: `Find the best decision-maker to contact at "${lead.businessName}", a ${lead.category} business in ${lead.city}.

${context}

Identify:
1. The decision-maker's full name (owner, general manager, or whoever handles marketing/web decisions for a small business). Use the name from the website if you can find it.
2. Their email address. Prefer a personal email (firstname@domain.com) over generic ones (info@, contact@). If only generic emails are available, use the best one.

Return JSON only — no explanation, no markdown:
{"contactName": "Jane Smith", "contactEmail": "jane@example.com"}

Use null for any field you cannot determine with reasonable confidence.`,
      },
    ],
  });

  const raw = msg.content[0].type === 'text' ? msg.content[0].text.trim() : '{}';
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return { contactName: null, contactEmail: null };

  try {
    return JSON.parse(match[0]) as ContactResult;
  } catch {
    return { contactName: null, contactEmail: null };
  }
}
