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
    signal: AbortSignal.timeout(5000),
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
      (html.match(EMAIL_RE) ?? []).forEach((e) => emailSet.add(e.toLowerCase()));
      textParts.push(stripHtml(html).slice(0, 3000));
    } catch {
      // page not found or timed out — continue
    }
  }

  return {
    text: textParts.join('\n---\n').slice(0, 12000),
    emails: Array.from(emailSet).filter(
      (e) => !e.includes('example.com') && !e.includes('sentry.io') && !e.includes('w3.org')
    ),
  };
}

export async function findContact(lead: LeadInfo): Promise<ContactResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');

  let context = 'No website available for this business.';

  if (lead.website) {
    try {
      const { text, emails } = await scrapeWebsite(lead.website);
      const emailList = emails.length > 0
        ? `Emails found: ${emails.join(', ')}`
        : 'No email addresses found on site.';
      context = `Website: ${lead.website}\n\n${text}\n\n${emailList}`;
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
        content: `Find the best person to contact at "${lead.businessName}", a ${lead.category} business in ${lead.city}.

${context}

Return the decision-maker's name and email. For a small local business the owner or manager is usually the right contact.

Rules:
- Prefer a direct personal email (john@domain.com) over generic ones (info@, contact@)
- If you found emails on the site, use the most relevant one
- If no email was found but you can see a domain, suggest info@thatdomain.com as a best guess
- Set null only if you have absolutely no basis for a guess

Return JSON only:
{"contactName": "John Smith", "contactEmail": "john@example.com"}`,
      },
    ],
  });

  const textBlock = msg.content.find((b) => b.type === 'text');
  const raw = textBlock?.type === 'text' ? textBlock.text.trim() : '{}';
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return { contactName: null, contactEmail: null };

  try {
    return JSON.parse(match[0]) as ContactResult;
  } catch {
    return { contactName: null, contactEmail: null };
  }
}
