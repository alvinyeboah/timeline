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
  let allGoals: Goal[];
  let profile: StoredProfile | undefined;

  try {
    const body = await req.json();
    goal = body.goal;
    allGoals = body.allGoals ?? [goal];
    profile = body.profile;
    if (!goal) throw new Error('No goal provided');
  } catch {
    return new Response('Invalid request body', { status: 400 });
  }

  const context = profile ? buildSystemContext(profile) : SARAH_SYSTEM_CONTEXT;
  const firstName = profile?.fullName?.split(' ')[0] ?? 'Sarah';
  const lastName = profile?.fullName?.split(' ').slice(1).join(' ') ?? 'Chen';
  const capacity = profile?.monthlySavingsCapacity ?? 1517;
  const income = profile?.income ?? 85000;
  const province = profile?.province ?? 'Ontario';
  const yearsAway = goal.targetYear - CURRENT_YEAR;

  const notesContext = goal.notes ? `\n\nUser's personal notes on this goal:\n"${goal.notes}"` : '';

  const systemPrompt = `${context}

You are writing a professional message on behalf of ${firstName} to send to their financial advisor.
Format the message as:
1. Greeting (Dear [Advisor],)
2. Brief intro: who they are and their current financial situation
3. Their primary goal/concern: what they want to achieve
4. Specific ask: what guidance they need from the advisor
5. Sign-off (Best, ${firstName} ${lastName})

Write in first person (as ${firstName}). Keep it professional but warm.
Be specific with numbers. Total length: 150-200 words.`;

  const userMessage = `Write the advisor message for this goal:
Goal: ${goal.name}
Target year: ${goal.targetYear} (${yearsAway} years away)
Cost: $${goal.estimatedCost.toLocaleString('en-CA')}
Monthly needed: $${goal.monthlyContributionNeeded.toLocaleString('en-CA')}/mo
My income: $${income.toLocaleString('en-CA')}/year
My monthly savings capacity: $${capacity.toLocaleString('en-CA')}/mo
Province: ${province}
Other goals on my timeline: ${allGoals.filter(g => g.id !== goal.id).map(g => `${g.name} (${g.targetYear})`).join(', ')}${notesContext}`;

  try {
    const stream = await getClient().chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      stream: true,
      temperature: 0.6,
      max_tokens: 350,
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
    console.error('[prepare-advisor-brief] error:', err);
    return new Response('AI streaming failed', { status: 500 });
  }
}
