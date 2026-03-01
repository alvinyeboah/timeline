import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { SARAH_SYSTEM_CONTEXT, buildSystemContext, CURRENT_YEAR } from '@/lib/mock-data';
import { Goal } from '@/lib/types';
import { StoredProfile } from '@/lib/profile-storage';

function getClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

function buildPrompt(profile?: StoredProfile) {
  const context = profile ? buildSystemContext(profile) : SARAH_SYSTEM_CONTEXT;
  return `${context}

You are a financial goal parser. Parse the user's goal into a structured JSON object.

Rules:
- targetYear must be >= ${CURRENT_YEAR + 1} and <= 2055
- estimatedCost must be a realistic Canadian dollar amount for the goal
- monthlyContributionNeeded = estimatedCost / ((targetYear - ${CURRENT_YEAR}) * 12)
- type must be one of: real_estate, career, education, travel, retirement, custom
- name should be a short, clear title (max 8 words)
- location should be city or region if mentioned (e.g. "Vancouver", "Toronto"), omit if not mentioned
- Return ONLY valid JSON — no markdown, no explanation, no code blocks

JSON format:
{
  "id": "<random 8-char hex>",
  "name": "<short goal name>",
  "type": "<goal type>",
  "targetYear": <year>,
  "estimatedCost": <amount>,
  "monthlyContributionNeeded": <monthly amount>,
  "location": "<city or region, optional>",
  "rawInput": "<original user text>",
  "createdAt": "<ISO date string>"
}`;
}

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OPENAI_API_KEY not configured' }, { status: 500 });
  }

  let text: string;
  let profile: StoredProfile | undefined;
  try {
    const body = await req.json();
    text = body.text?.trim();
    profile = body.profile;
    if (!text) throw new Error('No text provided');
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  try {
    const completion = await getClient().chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: buildPrompt(profile) },
        { role: 'user', content: text },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 300,
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new Error('Empty response from AI');

    const goal = JSON.parse(raw) as Goal;

    // Ensure rawInput is set
    goal.rawInput = text;
    goal.createdAt = goal.createdAt || new Date().toISOString();

    // Validate required fields
    if (!goal.id || !goal.name || !goal.targetYear || !goal.estimatedCost) {
      throw new Error('Invalid goal structure from AI');
    }

    return NextResponse.json(goal);
  } catch (err) {
    console.error('[parse-goal] error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'AI parsing failed' },
      { status: 500 }
    );
  }
}
