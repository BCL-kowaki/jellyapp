'use server'

import { revalidatePath } from 'next/cache'
import fs from 'fs/promises'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseKey)

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'images', 'team')

async function ensureDirectoryExists() {
  try {
    await fs.access(UPLOAD_DIR)
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true })
  }
}

async function getNextImageNumber() {
  const files = await fs.readdir(UPLOAD_DIR)
  const imageFiles = files.filter(file => file.startsWith('team-image'))
  const numbers = imageFiles.map(file => {
    const match = file.match(/team-image(\d+)\./)
    return match ? parseInt(match[1]) : 0
  })
  const maxNumber = Math.max(...numbers, -1)
  return (maxNumber + 1).toString().padStart(3, '0')
}

export async function createTeam(formData: FormData) {
  try {
    await ensureDirectoryExists()

    const area = formData.get('area') as string
    const prefecture = formData.get('prefecture') as string
    const teamName = formData.get('teamName') as string
    const category = formData.get('category') as string
    const image = formData.get('image') as File

    let fileName = ''
    if (image instanceof File) {
      const fileExt = image.name.split('.').pop()
      const nextNumber = await getNextImageNumber()
      fileName = `team-image${nextNumber}.${fileExt}`
      const filePath = path.join(UPLOAD_DIR, fileName)

      const buffer = Buffer.from(await image.arrayBuffer())
      await fs.writeFile(filePath, buffer)

      console.log(`画像を保存しました: ${filePath}`)
    }

    // Supabaseにデータを保存
    const { data, error } = await supabase
      .from('Team')
      .insert({
        area: area,
        prefecture: prefecture,
        teamName: teamName,
        category: category,
        image: fileName // ファイル名のみを保存
      })
      .select()

    if (error) {
      console.error('Supabaseエラー:', error)
      throw new Error('データベース操作エラー: ' + error.message)
    }

    if (!data || data.length === 0) {
      throw new Error('チームの作成に失敗しました: データが返されませんでした')
    }

    console.log('チームを保存:', data[0])

    // キャッシュの再検証
    revalidatePath('/Team')

    return { success: true, teamId: data[0].id }
  } catch (error) {
    console.error('チーム作成エラー:', error)
    return { success: false, error: error instanceof Error ? error.message : '不明なエラー' }
  }
}