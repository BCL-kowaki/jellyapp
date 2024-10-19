'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { createGame } from './actions'
import { createClient } from '@supabase/supabase-js'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon} from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ja } from 'date-fns/locale'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const areas = [
  '北海道ブロック', '東北ブロック', '関東ブロック', '北信越ブロック',
  '東海ブロック', '近畿ブロック', '中国ブロック', '四国ブロック', '九州ブロック'
]

const prefecturesByArea: { [key: string]: string[] } = {
  '北海道ブロック': ['北海道'],
  '東北ブロック': ['青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県'],
  '関東ブロック': ['茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県', '山梨県'],
  '北信越ブロック': ['新潟県', '富山県', '石川県', '福井県', '長野県'],
  '東海ブロック': ['岐阜県', '静岡県', '愛知県', '三重県'],
  '近畿ブロック': ['滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県'],
  '中国ブロック': ['鳥取県', '島根県', '岡山県', '広島県', '山口県'],
  '四国ブロック': ['徳島県', '香川県', '愛媛県', '高知県'],
  '九州ブロック': ['福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県']
}

export default function AddNewScore() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    teamAId: '',
    teamBId: '',
    date: new Date(),
    official: false,
    area: '',
    prefecture: '',
    convention: ''
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
  const [conventions, setConventions] = useState<string[]>([])

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

  useEffect(() => {
    const fetchConventions = async () => {
      if (formData.area && formData.prefecture) {
        const { data, error } = await supabase
          .from('Game')
          .select('convention')
          .eq('area', formData.area)
          .eq('prefecture', formData.prefecture)
        
        if (error) {
          console.error('Error fetching conventions:', error)
        } else {
          const uniqueConventions = Array.from(new Set(data.map(item => item.convention)))
          setConventions(uniqueConventions)
        }
      }
    }

    fetchConventions()
  }, [formData.area, formData.prefecture])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (name === 'teamAId' || name === 'teamBId') {
      setTeamNames(prev => ({ ...prev, [name === 'teamAId' ? 'teamA' : 'teamB']: '' }))
    }
  }

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({ ...prev, date }))
    }
  }

  const handleAreaChange = (value: string) => {
    setFormData(prev => ({ ...prev, area: value, prefecture: '' }))
  }

  const handlePrefectureChange = (value: string) => {
    setFormData(prev => ({ ...prev, prefecture: value }))
  }

  const handleConventionChange = (value: string) => {
    setFormData(prev => ({ ...prev, convention: value }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (!formData.teamAId || !formData.teamBId || !formData.date || !formData.area || !formData.prefecture || !formData.convention) {
      alert('全ての必須項目を入力してください。')
      setIsSubmitting(false)
      return
    }

    try {
      const form = new FormData()
      form.append('teamAId', formData.teamAId)
      form.append('teamBId', formData.teamBId)
      form.append('date', formData.date.toISOString())
      form.append('official', formData.official.toString())
      form.append('area', formData.area)
      form.append('prefecture', formData.prefecture)
      form.append('convention', formData.convention)

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
          <Label htmlFor="date">日付</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "border w-full justify-start text-left font-normal bg-zinc-700 text-white pt-6 pb-6 font-normal text-base",
                  !formData.date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.date ? format(formData.date, "yyyy/MM/dd", { locale: ja }) : <span>日付を選択</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 " align="start">
              <Calendar
                mode="single"
                selected={formData.date}
                onSelect={handleDateChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="official"
            checked={formData.official}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, official: checked as boolean }))}
          />
          <Label htmlFor="official">公式試合</Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="area">エリア</Label>
          <Select onValueChange={handleAreaChange}>
            <SelectTrigger className="w-full bg-zinc-700 text-white pt-6 pb-6 font-normal text-base">
              <SelectValue placeholder="エリアを選択" />
            </SelectTrigger>
            <SelectContent>
              {areas.map(area => (
                <SelectItem key={area} value={area}>{area}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="prefecture">都道府県</Label>
          <Select onValueChange={handlePrefectureChange} disabled={!formData.area}>
            <SelectTrigger className="w-full bg-zinc-700 text-white pt-6 pb-6 font-normal text-base">
              <SelectValue placeholder="都道府県を選択" />
            </SelectTrigger>
            <SelectContent>
              {formData.area && prefecturesByArea[formData.area].map(prefecture => (
                <SelectItem key={prefecture} value={prefecture}>{prefecture}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="convention">大会名</Label>
          <Select onValueChange={handleConventionChange}>
            <SelectTrigger className="w-full bg-zinc-700 text-white pt-6 pb-6 font-normal text-base">
              <SelectValue placeholder="大会名を選択または入力" />
            </SelectTrigger>
            <SelectContent>
              {conventions.map(convention => (
                <SelectItem key={convention} value={convention}>{convention}</SelectItem>
              ))}
              <SelectItem value="custom">新しい大会名を入力</SelectItem>
            </SelectContent>
          </Select>
          {formData.convention === 'custom' && (
            <Input
              name="convention"
              value={formData.convention}
              onChange={handleInputChange}
              placeholder="新しい大会名を入力"
              className="bg-zinc-700 text-white mt-2 pt-6 pb-6 font-normal text-base"
            />
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="teamAId">チームA ID</Label>
          <Input
            id="teamAId"
            name="teamAId"
            value={formData.teamAId}
            onChange={handleInputChange}
            placeholder="チームAのIDを入力"
            className="bg-zinc-700 text-white pt-6 pb-6 font-normal text-base"
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
            className="bg-zinc-700 text-white pt-6 pb-6 font-normal text-base"
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