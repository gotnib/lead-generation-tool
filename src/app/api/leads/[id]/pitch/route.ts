import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '@/lib/prisma';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const ratingInfo = lead.rating
    ? `${lead.rating} stars (${lead.reviewCount ?? 0} reviews)`
    : 'Not rated';

  const prompt = `You are a skilled B2B sales copywriter. Write a compelling cold outreach email for this local business lead.

Business: ${lead.businessName}
Category: ${lead.category}
Location: ${lead.city}
Rating: ${ratingInfo}
${lead.website ? `Website: ${lead.website}` : ''}
${lead.address ? `Address: ${lead.address}` : ''}

Write a short, professional cold pitch email that:
1. Opens with a specific, personalized hook related to their business or location
2. Introduces our digital marketing / lead generation services in 1-2 sentences
3. States a concrete, believable outcome or benefit (e.g., "helped a similar ${lead.category} in ${lead.city} get 30% more calls in 60 days")
4. Has a clear, low-friction call to action (15-min call, quick question, etc.)
5. Is under 150 words total
6. Sounds human, not salesy or templated
7. Ends with a real-looking name and title

Format the response as:
Subject: [subject line]

[email body]`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    });

    const pitchEmail =
      message.content[0].type === 'text' ? message.content[0].text : '';

    // Persist so re-opening the panel shows the last generated email
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
