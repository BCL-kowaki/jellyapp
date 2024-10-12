'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseKey)

export async function createGame(formData: FormData) {
  const teamAId = formData.get('teamAId') as string
  const teamBId = formData.get('teamBId') as string
  const date = formData.get('date') as string

  try {
    const { data, error } = await supabase
      .from('Game')
      .insert({
        teamAId: teamAId,
        teamBId: teamBId,
        date: new Date(date).toISOString()
      })
      .select()

    if (error) {
      console.error('Supabaseエラー:', error)
      return { success: false, error: 'データベース操作エラー: ' + error.message }
    }

    if (!data || data.length === 0) {
      return { success: false, error: '試合の登録に失敗しました: データが返されませんでした' }
    }

    console.log('試合を保存:', data[0])

    // キャッシュの再検証
    revalidatePath('/Game')

    return { success: true, gameId: data[0].id }
  } catch (error) {
    console.error('データベース挿入エラー:', error)
    return { success: false, error: error instanceof Error ? error.message : '不明なエラー' }
  }
}