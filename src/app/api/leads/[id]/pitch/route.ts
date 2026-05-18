import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '@/lib/prisma';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You write cold outreach emails that are professional, credible, and written like a real person — not a marketer, not a template, not AI-generated copy.

Tone: Think senior consultant or experienced agency owner reaching out. Polished but not stiff. Warm but not overly familiar. Confident without being pushy.

Style rules:
- Vary sentence length naturally. Mix concise sentences with slightly longer ones.
- Use proper grammar and punctuation throughout.
- Sound knowledgeable and specific — generic claims have no place here.
- Keep it under 150 words. Respect the recipient's time.

Hard avoids — never use these words or phrases:
- leverage, seamlessly, robust, unlock, game changer, dive into, streamline, cutting-edge, innovative
- "I hope this email finds you well", "I wanted to reach out", "touching base"
- Excessive exclamation points or enthusiasm
- Three-part lists ("A, B, and C") — they feel templated
- Vague outcomes ("grow your business", "increase revenue") without specifics
- Em dashes as a crutch

The email should feel like:
- A professional who did their homework before writing
- Someone making a specific, relevant observation — not a cold blast
- A respectful ask that's easy to respond to or decline

Format exactly as:
Subject: [subject line]

[email body]`;

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const greeting = lead.contactName ? `Hi ${lead.contactName.split(' ')[0]},` : 'Hi,';
  const ratingLine = lead.rating
    ? `${lead.rating} stars with ${lead.reviewCount ?? 0} reviews`
    : 'no rating data';
  const websiteLine = lead.website ? `Website: ${lead.website}` : 'No website listed';

  const prompt = `Write a cold outreach email for this business. I offer website redesign services for local businesses — clean, fast, mobile-friendly sites built from scratch.

Business: ${lead.businessName}
Type: ${lead.category}
Location: ${lead.city}
Reviews: ${ratingLine}
${websiteLine}
${lead.address ? `Address: ${lead.address}` : ''}

Start the email with: ${greeting}

The email should:
- Open with one specific observation about their current web presence (no website, outdated site, no reviews, something concrete)
- Briefly describe what a redesign would do for a business like theirs — be specific, not generic
- End with a soft, no-pressure invitation: ask a question about their situation, or offer to show them what a redesign could look like — no call scheduling
- Sign off as Jason Davis, Clearsite

Do not explain what you're doing. Just write the email.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    });

    const pitchEmail =
      message.content[0].type === 'text' ? message.content[0].text : '';

    await prisma.lead.update({ where: { id }, data: { pitchEmail } });

    return NextResponse.json({ pitchEmail });
  } catch (err) {
    console.error('Anthropic error:', err);
    return NextResponse.json(
      { error: 'Failed to generate email. Check your ANTHROPIC_API_KEY.' },
      { status: 500 }
    );
  }
}
