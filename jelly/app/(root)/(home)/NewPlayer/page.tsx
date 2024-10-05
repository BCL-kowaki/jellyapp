'use client'

import { useState, ChangeEvent, FormEvent } from 'react'
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

interface FormData {
  name: string;
  category: string;
  team: string;
  number: string;
  position: string;
  height: string;
}

export default function NewPlayer() {
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    category: 'U-12',
    team: '',
    number: '',
    position: 'PG',
    height: '',
  })

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
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

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log(formData)
    console.log('Image:', imagePreview)
  }

  return (
    <div className="min-h-screen text-white p-8">
      <h1 className="text-3xl font-bold mb-8">新規選手登録</h1>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
        <div className="space-y-2">
          <Label htmlFor="name">氏名</Label>
          <Input id="name" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-zinc-700 text-white" />
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
          <Label htmlFor="team">チーム</Label>
          <Input id="team" name="team" value={formData.team} onChange={handleInputChange} className="w-full bg-zinc-700 text-white" placeholder="チーム名で検索" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="number">背番号</Label>
          <Input id="number" name="number" type="number" value={formData.number} onChange={handleInputChange} className="w-full bg-zinc-700 text-white" />
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
          <Input id="height" name="height" type="number" value={formData.height} onChange={handleInputChange} className="w-full bg-zinc-700 text-white" placeholder="cm" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="image">プロフィール画像をアップしてください</Label>
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
              <input id="image" name="image" type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
            </label>
          </div>
        </div>

        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
          送信
        </Button>
      </form>
    </div>
  );
}
