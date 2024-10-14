'use client'

import { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createPlayer, getTeams } from './actions'

interface FormData {
  name: string;
  category: string;
  number: string;
  position: string;
  height: string;
  teamId: string;
  teamName: string;
}

interface Team {
  id: string;
  teamName: string;
}

export default function NewPlayer() {
  const router = useRouter()
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    category: 'U-12',
    number: '',
    position: 'PG',
    height: '',
    teamId: '',
    teamName: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [teams, setTeams] = useState<Team[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (formData.teamName) {
      const delayDebounceFn = setTimeout(() => {
        fetchTeams(formData.teamName)
      }, 300)

      return () => clearTimeout(delayDebounceFn)
    }
  }, [formData.teamName])

  const fetchTeams = async (search: string) => {
    try {
      const result = await getTeams(search)
      if (result.success && result.data) {
        setTeams(result.data)
      } else {
        console.error('チーム検索エラー:', result.error)
        setError(result.error || 'チームの検索中にエラーが発生しました')
      }
    } catch (error) {
      console.error('チーム検索エラー:', error)
      setError('チームの検索中にエラーが発生しました')
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleTeamSelect = (team: Team) => {
    setFormData(prev => ({ ...prev, teamId: team.id, teamName: team.teamName }))
    setTeams([])
  }

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
  
    try {
      const form = new FormData()
      form.append('name', formData.name)
      form.append('category', formData.category)
      form.append('number', formData.number)
      form.append('position', formData.position)
      form.append('height', formData.height)
      form.append('teamId', formData.teamId)
      if (imagePreview) {
        const response = await fetch(imagePreview)
        const blob = await response.blob()
        form.append('image', blob, 'image.jpg')
      }
      
      const result = await createPlayer(form)
      if (result.success) {
        router.push('/SearchPlayer')
      } else {
        setError(result.error || 'プレイヤーの作成に失敗しました')
      }
    } catch (error) {
      console.error('送信エラー:', error)
      setError('送信中にエラーが発生しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen text-white p-8">
      <h1 className="text-3xl font-bold mb-8">新規選手登録</h1>
      {error && <div className="bg-red-500 text-white p-3 rounded mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
        <div className="space-y-2">
          <Label htmlFor="name">氏名</Label>
          <Input 
            id="name" 
            name="name" 
            value={formData.name} 
            onChange={handleInputChange} 
            className="w-full bg-zinc-700 text-white" 
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">カテゴリ</Label>
          <Select onValueChange={handleSelectChange('category')} value={formData.category}>
            <SelectTrigger className="w-full bg-zinc-700 text-white">
              <SelectValue placeholder="カテゴリを選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="U-12">U-12</SelectItem>
              <SelectItem value="U-15">U-15</SelectItem>
              <SelectItem value="U-18">U-18</SelectItem>
              <SelectItem value="U-22">U-22</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="number">背番号</Label>
          <Input 
            id="number" 
            name="number" 
            type="number" 
            value={formData.number} 
            onChange={handleInputChange} 
            className="w-full bg-zinc-700 text-white" 
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="position">ポジション</Label>
          <Select onValueChange={handleSelectChange('position')} value={formData.position}>
            <SelectTrigger className="w-full bg-zinc-700 text-white">
              <SelectValue placeholder="ポジションを選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PG">PG</SelectItem>
              <SelectItem value="SG">SG</SelectItem>
              <SelectItem value="SF">SF</SelectItem>
              <SelectItem value="PF">PF</SelectItem>
              <SelectItem value="C">C</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="height">身長</Label>
          <Input 
            id="height" 
            name="height" 
            type="number" 
            value={formData.height} 
            onChange={handleInputChange} 
            className="w-full bg-zinc-700 text-white" 
            placeholder="cm"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="teamName">チーム名</Label>
          <div className="relative">
            <Input 
              id="teamName" 
              name="teamName" 
              value={formData.teamName} 
              onChange={handleInputChange} 
              className="w-full bg-zinc-700 text-white" 
              placeholder="チーム名を入力"
              required
            />
            {teams.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-zinc-800 rounded-md shadow-lg">
                {teams.map((team) => (
                  <div
                    key={team.id}
                    className="px-4 py-2 cursor-pointer hover:bg-zinc-700"
                    onClick={() => handleTeamSelect(team)}
                  >
                    {team.teamName}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="image">プロフィール画像をアップロードしてください</Label>
          <div className="flex items-center justify-center w-full">
            <label htmlFor="image" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-600">
              {imagePreview ? (
                <Image src={imagePreview} alt="Preview" width={200} height={200} className="w-auto h-auto max-w-full max-h-full" />
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-8 h-8 mb-4 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                  </svg>
                  <p className="mb-2 text-sm text-gray-400"><span className="font-semibold">クリックしてアップロード</span></p>
                  <p className="text-xs text-gray-400">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                </div>
              )}
              <input id="image" name="image" type="file" className="hidden" onChange={handleImageUpload} accept="images/palyer/*" />
            </label>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" 
          disabled={isSubmitting}
        >
          {isSubmitting ? '登録中...' : '登録'}
        </Button>
      </form>
    </div>
  )
}