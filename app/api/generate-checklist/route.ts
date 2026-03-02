import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { buildSystemContext, SARAH_SYSTEM_CONTEXT, CURRENT_YEAR } from '@/lib/mock-data';
import { Goal, ChecklistItem } from '@/lib/types';
import { StoredProfile } from '@/lib/profile-storage';

function getClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OPENAI_API_KEY not configured' }, { status: 500 });
  }

  let goal: Goal;
  let profile: StoredProfile | undefined;

  try {
    const body = await req.json();
    goal = body.goal;
    profile = body.profile;
    if (!goal) throw new Error('No goal provided');
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const context = profile ? buildSystemContext(profile) : SARAH_SYSTEM_CONTEXT;
  const firstName = profile?.fullName?.split(' ')[0] ?? 'Sarah';
  const yearsAway = goal.targetYear - CURRENT_YEAR;

  const systemPrompt = `${context}

You are a practical financial advisor. Generate an action checklist for a specific goal.
Return JSON with this exact shape:
{
  "checklist": [
    { "id": "unique-id", "horizon": "this_month" | "next_quarter" | "this_year" | "target_year", "text": "action item", "done": false }
  ]
}
Generate 2-3 items per horizon (this_month, next_quarter, this_year, target_year).
Items should be concrete, specific, and achievable. Each item should build toward the goal.
Use short imperative sentences (e.g., "Open a dedicated TFSA account", "Research mortgage pre-approval requirements").`;

  const userMessage = `Generate an action checklist for ${firstName}'s goal:
Goal: ${goal.name}
Type: ${goal.type}
Target year: ${goal.targetYear} (${yearsAway} years away)
Estimated cost: $${goal.estimatedCost.toLocaleString('en-CA')}
Monthly needed: $${goal.monthlyContributionNeeded.toLocaleString('en-CA')}/mo
${goal.location ? `Location: ${goal.location}` : ''}`;

  try {
    const completion = await getClient().chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.4,
      max_tokens: 800,
    });

    const raw = completion.choices[0]?.message?.content ?? '{}';
    const parsed = JSON.parse(raw) as { checklist: ChecklistItem[] };

    // Ensure IDs are unique
    const checklist = (parsed.checklist ?? []).map((item, i) => ({
      ...item,
      id: item.id || `item-${goal.id}-${i}-${Date.now()}`,
      done: false,
    }));

    return NextResponse.json({ checklist });
  } catch (err) {
    console.error('[generate-checklist] error:', err);
    return NextResponse.json({ error: 'Failed to generate checklist' }, { status: 500 });
  }
}
