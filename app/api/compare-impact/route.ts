import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import { SARAH_SYSTEM_CONTEXT, buildSystemContext, CURRENT_YEAR } from '@/lib/mock-data';
import { Goal } from '@/lib/types';
import { StoredProfile } from '@/lib/profile-storage';

function getClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return new Response('OPENAI_API_KEY not configured', { status: 500 });
  }

  let goal: Goal;
  let prevYear: number;
  let newYear: number;
  let profile: StoredProfile | undefined;

  try {
    const body = await req.json();
    goal = body.goal;
    prevYear = body.prevYear;
    newYear = body.newYear;
    profile = body.profile;
    if (!goal || !prevYear || !newYear) throw new Error('Missing required fields');
  } catch {
    return new Response('Invalid request body', { status: 400 });
  }

  const context = profile ? buildSystemContext(profile) : SARAH_SYSTEM_CONTEXT;
  const firstName = profile?.fullName?.split(' ')[0] ?? 'Sarah';
  const capacity = profile?.monthlySavingsCapacity ?? 1517;
  const yearsBeforeMove = prevYear - CURRENT_YEAR;
  const yearsAfterMove = newYear - CURRENT_YEAR;
  const monthlyBefore = yearsBeforeMove > 0 ? Math.round(goal.estimatedCost / (yearsBeforeMove * 12)) : goal.estimatedCost;
  const monthlyAfter = yearsAfterMove > 0 ? Math.round(goal.estimatedCost / (yearsAfterMove * 12)) : goal.estimatedCost;

  const systemPrompt = `${context}

You are a sharp, concise financial advisor. Compare the impact of moving a goal on a user's financial timeline.
Write two short paragraphs:
1. "Before (${prevYear}):" — describe the financial reality at the original year
2. "After (${newYear}):" — describe what changes at the new year
Then one final sentence summarizing the net cost-benefit.
Be specific with numbers. Keep total response under 120 words. No bullet points.`;

  const userMessage = `${firstName} moved their "${goal.name}" goal from ${prevYear} to ${newYear}.
Cost: $${goal.estimatedCost.toLocaleString('en-CA')}
Before: $${monthlyBefore.toLocaleString('en-CA')}/mo needed over ${yearsBeforeMove} years
After: $${monthlyAfter.toLocaleString('en-CA')}/mo needed over ${yearsAfterMove} years
Monthly savings capacity: $${capacity.toLocaleString('en-CA')}`;

  try {
    const stream = await getClient().chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      stream: true,
      temperature: 0.5,
      max_tokens: 200,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content;
            if (text) controller.enqueue(encoder.encode(text));
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
    console.error('[compare-impact] error:', err);
    return new Response('AI streaming failed', { status: 500 });
  }
}
