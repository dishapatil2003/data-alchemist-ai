// app/api/convert-rule/route.ts
import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { query, data } = await req.json();

    if (!query || !data) {
      return NextResponse.json({ error: 'Missing query or data.' }, { status: 400 });
    }

    const prompt = `
You are a helpful assistant for exploring structured data.
Given:
Clients: ${JSON.stringify(data.clients).slice(0, 2000)}
Workers: ${JSON.stringify(data.workers).slice(0, 2000)}
Tasks: ${JSON.stringify(data.tasks).slice(0, 2000)}

User query: "${query}"

Respond with explanation and relevant info.
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // change to 'gpt-4' only if you have access
      messages: [{ role: 'user', content: prompt }],
    });

    return NextResponse.json({ result: response.choices[0].message?.content });
  } catch (error: any) {
    console.error('❌ Server error in /api/convert-rule:', error);
    return NextResponse.json(
      { error: error.message || 'Something went wrong.' },
      { status: 500 }
    );
  }
}
