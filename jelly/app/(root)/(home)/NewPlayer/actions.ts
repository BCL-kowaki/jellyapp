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

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'images', 'player')

async function ensureDirectoryExists() {
  try {
    await fs.access(UPLOAD_DIR)
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true })
  }
}

async function getNextImageNumber() {
  const files = await fs.readdir(UPLOAD_DIR)
  const imageFiles = files.filter(file => file.startsWith('player-image'))
  const numbers = imageFiles.map(file => {
    const match = file.match(/player-image(\d+)\./)
    return match ? parseInt(match[1]) : 0
  })
  const maxNumber = Math.max(...numbers, -1)
  return (maxNumber + 1).toString().padStart(3, '0')
}

export async function createPlayer(formData: FormData) {
  try {
    await ensureDirectoryExists()

    const name = formData.get('name') as string
    const category = formData.get('category') as string
    const number = parseInt(formData.get('number') as string)
    const position = formData.get('position') as string
    const height = parseInt(formData.get('height') as string)
    const teamId = parseInt(formData.get('teamId') as string)
    const image = formData.get('image') as File

    let fileName = ''
    if (image instanceof File) {
      const fileExt = image.name.split('.').pop()
      const nextNumber = await getNextImageNumber()
      fileName = `player-image${nextNumber}.${fileExt}`
      const filePath = path.join(UPLOAD_DIR, fileName)

      const buffer = Buffer.from(await image.arrayBuffer())
      await fs.writeFile(filePath, buffer)

      console.log(`画像を保存しました: ${filePath}`)
    }

    const { data, error } = await supabase
      .from('Player')
      .insert({
        name,
        category,
        No: number,
        position,
        height,
        teamId,
        image: fileName // ファイル名のみを保存
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

export async function downloadCsvTemplate() {
  const headers = ['name', 'No', 'image', 'position', 'category', 'height', 'teamId', 'birthplace', 'career']
  return headers.join(',') + '\n'
}

export async function uploadCsvPlayers(formData: FormData) {
  const file = formData.get('csv') as File
  if (!file) {
    return { success: false, error: 'ファイルがアップロードされていません' }
  }

  const content = await file.text()
  const rows = content.split('\n').map(row => row.split(','))

  // ヘッダー行をスキップ
  const players = rows.slice(1).map(row => ({
    name: row[0],
    No: parseInt(row[1]),
    image: row[2],
    position: row[3],
    category: row[4],
    height: parseInt(row[5]),
    teamId: parseInt(row[6]),
    birthplace: row[7],
    career: row[8]
  }))

  try {
    for (const player of players) {
      const { error } = await supabase
        .from('Player')
        .insert(player)

      if (error) {
        console.error('プレイヤー挿入エラー:', error)
        return { success: false, error: 'プレイヤーの挿入中にエラーが発生しました: ' + error.message }
      }
    }

    // キャッシュの再検証
    revalidatePath('/SearchPlayer')

    return { success: true }
  } catch (error) {
    console.error('プレイヤーのアップロードエラー:', error)
    return { success: false, error: error instanceof Error ? error.message : '不明なエラー' }
  }
}