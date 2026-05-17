import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '@/lib/prisma';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You write cold outreach emails that sound like a real professional wrote them — not a marketer, not an AI, not a template.

Style rules:
- Vary sentence length naturally. Mix concise sentences with slightly longer ones.
- Write like a confident professional, not casually. Clear and direct, not stiff.
- Sound credible and grounded. No fluff, no hype, no buzzwords.
- Keep it under 150 words total. Every sentence has to earn its place.

Hard avoids — never use these words or phrases:
- leverage, seamlessly, robust, unlock, game changer, dive into, streamline
- "In today's fast-paced world", "I hope this email finds you well"
- Excessive enthusiasm, forced positivity, or empty openers
- Three-part lists ("A, B, and C") — they feel templated
- Em dashes as a crutch
- Generic claims without specifics

The email should feel like:
- A competent professional reaching out after noticing something specific
- Someone who respects the recipient's time and gets to the point
- A low-pressure ask, not a sales pitch

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

  const prompt = `Write a cold outreach email for this business. I offer web design and digital marketing services to local businesses.

Business: ${lead.businessName}
Type: ${lead.category}
Location: ${lead.city}
Reviews: ${ratingLine}
${websiteLine}
${lead.address ? `Address: ${lead.address}` : ''}

Start the email with: ${greeting}

The email should:
- Open with one specific observation about their business (their lack of web presence, their review count, something real — not a compliment)
- Briefly say what I do and what kind of result I've gotten for a similar business
- End with one clear, low-friction ask (a quick call, a question, whatever fits)
- Sign off with a real-looking name and casual title

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
