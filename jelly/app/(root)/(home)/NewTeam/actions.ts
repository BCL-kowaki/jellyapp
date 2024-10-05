'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseKey)

export async function createTeam(formData: FormData) {
  const teamName = formData.get('teamName') as string
  const category = formData.get('category') as string
  const image = formData.get('image') as File

  let imageBase64 = ''
  if (image instanceof File) {
    const imageBuffer = await image.arrayBuffer()
    imageBase64 = Buffer.from(imageBuffer).toString('base64')
  }

  try {
    const { data, error } = await supabase
      .from('Team')
      .insert({
        teamName: teamName,
        category: category,
        image: imageBase64
      })
      .select()

    if (error) {
      console.error('Supabaseエラー:', error)
      return { success: false, error: 'データベース操作エラー: ' + error.message }
    }

    if (!data || data.length === 0) {
      return { success: false, error: 'チームの作成に失敗しました: データが返されませんでした' }
    }

    console.log('チームを保存:', data[0])

    // キャッシュの再検証
    revalidatePath('/Team')

    return { success: true, teamId: data[0].id }
  } catch (error) {
    console.error('データベース挿入エラー:', error)
    return { success: false, error: error instanceof Error ? error.message : '不明なエラー' }
  }
}