'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { createGame } from './actions'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function AddNewScore() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    teamAId: '',
    teamBId: ''
  })
  const [teamNames, setTeamNames] = useState({
    teamA: '',
    teamB: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState({
    teamA: false,
    teamB: false
  })

  const fetchTeamName = async (id: string, team: 'teamA' | 'teamB') => {
    setIsLoading(prev => ({ ...prev, [team]: true }))
    try {
      const { data, error } = await supabase
        .from('Team')
        .select('teamName')
        .eq('id', id)
        .single()

      if (error) throw error

      setTeamNames(prev => ({ ...prev, [team]: data?.teamName || 'チームが見つかりません' }))
    } catch (error) {
      console.error(`Error fetching ${team} name:`, error)
      setTeamNames(prev => ({ ...prev, [team]: 'エラーが発生しました' }))
    } finally {
      setIsLoading(prev => ({ ...prev, [team]: false }))
    }
  }

  useEffect(() => {
    if (formData.teamAId) fetchTeamName(formData.teamAId, 'teamA')
  }, [formData.teamAId])

  useEffect(() => {
    if (formData.teamBId) fetchTeamName(formData.teamBId, 'teamB')
  }, [formData.teamBId])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setTeamNames(prev => ({ ...prev, [name === 'teamAId' ? 'teamA' : 'teamB']: '' }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (!formData.teamAId || !formData.teamBId) {
      alert('両チームのIDを入力してください。')
      setIsSubmitting(false)
      return
    }

    try {
      const form = new FormData()
      form.append('teamAId', formData.teamAId)
      form.append('teamBId', formData.teamBId)

      const result = await createGame(form)
      if (result.success) {
        router.push('/SearchScore')
      } else {
        console.error('試合登録エラー:', result.error)
        alert('試合の登録に失敗しました: ' + result.error)
      }
    } catch (error) {
      console.error('送信エラー:', error)
      alert('送信中にエラーが発生しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen text-white p-8">
      <h1 className="text-3xl font-bold mb-8">新規試合登録</h1>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
        <div className="space-y-2">
          <Label htmlFor="teamAId">チームA ID</Label>
          <Input
            id="teamAId"
            name="teamAId"
            value={formData.teamAId}
            onChange={handleInputChange}
            placeholder="チームAのIDを入力"
            className="bg-zinc-700 text-white"
          />
          {isLoading.teamA ? (
            <p className="text-sm text-gray-400">読み込み中...</p>
          ) : (
            teamNames.teamA && <p className="text-2xl font-bold text-gray-400">{teamNames.teamA}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="teamBId">チームB ID</Label>
          <Input
            id="teamBId"
            name="teamBId"
            value={formData.teamBId}
            onChange={handleInputChange}
            placeholder="チームBのIDを入力"
            className="bg-zinc-700 text-white"
          />
          {isLoading.teamB ? (
            <p className="text-sm text-gray-400">読み込み中...</p>
          ) : (
            teamNames.teamB && <p className="text-2xl font-bold text-gray-400">{teamNames.teamB}</p>
          )}
        </div>

        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
          {isSubmitting ? '登録中...' : '登録'}
        </Button>
      </form>
    </div>
  )
}