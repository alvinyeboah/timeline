import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import { buildSystemContext, SARAH_SYSTEM_CONTEXT, CURRENT_YEAR } from '@/lib/mock-data';
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
  let profile: StoredProfile | undefined;
  let messages: Array<{ role: 'user' | 'assistant'; content: string }>;

  try {
    const body = await req.json();
    goal = body.goal;
    profile = body.profile;
    messages = body.messages ?? [];
    if (!goal || !messages.length) throw new Error('Missing goal or messages');
  } catch {
    return new Response('Invalid request body', { status: 400 });
  }

  const context = profile ? buildSystemContext(profile) : SARAH_SYSTEM_CONTEXT;
  const firstName = profile?.fullName?.split(' ')[0] ?? 'Sarah';
  const yearsAway = goal.targetYear - CURRENT_YEAR;

  const systemPrompt = `${context}

You are a knowledgeable, concise financial advisor helping ${firstName} with a specific goal.

Goal: ${goal.name}
Type: ${goal.type}
Target year: ${goal.targetYear} (${yearsAway} years away)
Estimated cost: $${goal.estimatedCost.toLocaleString('en-CA')}
Monthly needed: $${goal.monthlyContributionNeeded.toLocaleString('en-CA')}/mo
${goal.location ? `Location: ${goal.location}` : ''}

Answer questions about this goal directly and practically. Keep responses concise (2-4 sentences unless asked for more detail). Focus on actionable advice relevant to ${firstName}'s situation in Canada.`;

  const stream = await getClient().chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
    stream: true,
    temperature: 0.5,
    max_tokens: 400,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? '';
        if (text) controller.enqueue(encoder.encode(text));
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
