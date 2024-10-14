'use client'

import { useState, ChangeEvent, FormEvent } from 'react'
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
import { createTeam } from './actions'

interface FormData {
  teamName: string;
  category: string;
}

export default function NewTeam() {
  const router = useRouter()
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>({
    teamName: '',
    category: 'U-12',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }))
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

    try {
      const form = new FormData()
      form.append('teamName', formData.teamName)
      form.append('category', formData.category)
      if (imagePreview) {
        const response = await fetch(imagePreview)
        const blob = await response.blob()
        form.append('image', blob, 'image.jpg')
      }
      
      const result = await createTeam(form)
      if (result.success) {
        router.push('/SearchTeam')
      } else {
        console.error('チーム作成エラー:', result.error)
        // エラーメッセージを表示するなどの処理を行う
        alert('チームの作成に失敗しました: ' + result.error)
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
      <h1 className="text-3xl font-bold mb-8">新規チーム登録</h1>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
        <div className="space-y-2">
          <Label htmlFor="teamName">チーム名</Label>
          <Input 
            id="teamName" 
            name="teamName" 
            value={formData.teamName} 
            onChange={handleInputChange} 
            className="w-full bg-zinc-700 text-white" 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">カテゴリ</Label>
          <Select onValueChange={handleSelectChange} value={formData.category}>
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
          <Label htmlFor="image">チーム画像をアップロードしてください</Label>
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
              <input id="image" name="image" type="file" className="hidden" onChange={handleImageUpload} accept="images/team/*" />
            </label>
          </div>
        </div>

        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
          {isSubmitting ? '登録中...' : '登録'}
        </Button>
      </form>
    </div>
  )
}