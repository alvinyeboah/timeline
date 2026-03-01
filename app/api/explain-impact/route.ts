import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import { SARAH_SYSTEM_CONTEXT, buildSystemContext, CURRENT_YEAR } from '@/lib/mock-data';
import { Goal } from '@/lib/types';
import { StoredProfile } from '@/lib/profile-storage';

function getClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const buildSystemPrompt = (allGoals: Goal[], profile?: StoredProfile) => {
  const context = profile ? buildSystemContext(profile) : SARAH_SYSTEM_CONTEXT;
  const capacity = profile?.monthlySavingsCapacity ?? 1517;
  const firstName = profile?.fullName?.split(' ')[0] ?? 'Sarah';

  const goalsContext =
    allGoals.length > 1
      ? `\n\n${firstName}'s other goals:\n${allGoals
          .map((g) => `- ${g.name} (${g.targetYear}): $${g.estimatedCost.toLocaleString()} — needs $${g.monthlyContributionNeeded}/mo`)
          .join('\n')}`
      : '';

  return `${context}${goalsContext}

You are a friendly, sharp financial advisor. Explain the financial impact of the goal provided in 3–4 sentences.

Guidelines:
- Be specific with numbers (use ${firstName}'s actual savings capacity of $${capacity.toLocaleString('en-CA')}/mo)
- Calculate the gap (how much they need vs. how much they have available)
- Suggest 1–2 practical options to close the gap
- Keep it conversational and encouraging, not scary
- Current year: ${CURRENT_YEAR}
- Don't use bullet points — write flowing paragraphs`;
};

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return new Response('OPENAI_API_KEY not configured', { status: 500 });
  }

  let goal: Goal;
  let allGoals: Goal[] = [];
  let profile: StoredProfile | undefined;

  try {
    const body = await req.json();
    goal = body.goal;
    allGoals = body.allGoals || [goal];
    profile = body.profile;
    if (!goal) throw new Error('No goal provided');
  } catch {
    return new Response('Invalid request body', { status: 400 });
  }

  const firstName = profile?.fullName?.split(' ')[0] ?? 'Sarah';

  const userMessage = `Explain the financial impact of this goal for ${firstName}:
Name: ${goal.name}
Target year: ${goal.targetYear} (${goal.targetYear - CURRENT_YEAR} years away)
Estimated cost: $${goal.estimatedCost.toLocaleString('en-CA')}
Monthly contribution needed: $${goal.monthlyContributionNeeded.toLocaleString('en-CA')}
Original goal: "${goal.rawInput}"`;

  try {
    const stream = await getClient().chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: buildSystemPrompt(allGoals, profile) },
        { role: 'user', content: userMessage },
      ],
      stream: true,
      temperature: 0.6,
      max_tokens: 250,
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content;
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (err) {
    console.error('[explain-impact] error:', err);
    return new Response('AI streaming failed', { status: 500 });
  }
}
