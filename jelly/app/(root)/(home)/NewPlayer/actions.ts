'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseKey)

export async function createPlayer(formData: FormData) {
  const name = formData.get('name') as string
  const category = formData.get('category') as string
  const number = parseInt(formData.get('number') as string)
  const position = formData.get('position') as string
  const height = parseInt(formData.get('height') as string)
  const teamId = parseInt(formData.get('teamId') as string)
  const image = formData.get('image') as File

  let imageBase64 = ''
  if (image instanceof File) {
    const imageBuffer = await image.arrayBuffer()
    imageBase64 = Buffer.from(imageBuffer).toString('base64')
  }

  try {
    const { data, error } = await supabase
      .from('Player')
      .insert({
        name,
        category,
        No: number,
        position,
        height,
        teamId,
        image: imageBase64
      })
      .select()

    if (error) {
      console.error('Supabaseエラー:', error)
      return { success: false, error: 'データベース操作エラー: ' + error.message }
    }

    if (!data || data.length === 0) {
      return { success: false, error: 'プレイヤーの作成に失敗しました: データが返されませんでした' }
    }

    console.log('プレイヤーを保存:', data[0])

    // キャッシュの再検証
    revalidatePath('/SearchPlayer')

    return { success: true, playerId: data[0].id }
  } catch (error) {
    console.error('データベース挿入エラー:', error)
    return { success: false, error: error instanceof Error ? error.message : '不明なエラー' }
  }
}

export async function getTeams(search: string) {
    try {
      const { data, error } = await supabase
        .from('Team')
        .select('id, teamName')
        .ilike('teamName', `%${search}%`)
        .limit(5)
  
      if (error) {
        console.error('チーム検索エラー:', error)
        return { success: false, error: 'チーム検索エラー: ' + error.message }
      }
  
      return { success: true, data }
    } catch (error) {
      console.error('チーム検索エラー:', error)
      return { success: false, error: error instanceof Error ? error.message : '不明なエラー' }
    }
  }