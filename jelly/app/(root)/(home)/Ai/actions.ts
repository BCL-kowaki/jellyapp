'use server'

import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai';

// Supabaseクライアントの初期化
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// OpenAI設定
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function chatWithAI(message: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: message }],
    });

    const aiResponse = completion.choices[0].message.content;

    if (typeof aiResponse !== 'string') {
      throw new Error('Invalid response from OpenAI API');
    }

    // Supabaseにチャット履歴を保存
    await supabase
      .from('Chat')
      .insert([{ user_message: message, ai_response: aiResponse }])

    return aiResponse
  } catch (error: unknown) {
    console.error('OpenAI API error:', error)
    if (typeof error === 'object' && error !== null && 'response' in error &&
        typeof error.response === 'object' && error.response !== null &&
        'status' in error.response && error.response.status === 429) {
      return "申し訳ありませんが、現在APIの利用制限に達しています。しばらくしてからもう一度お試しください。"
    } else if (error instanceof Error) {
      throw new Error(`OpenAI API error: ${error.message}`)
    } else {
      throw new Error('Unknown error occurred')
    }
  }
}