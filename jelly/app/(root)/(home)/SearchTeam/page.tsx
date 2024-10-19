'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link';
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search } from "lucide-react"
import { createClient } from '@supabase/supabase-js'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Team {
  id: string;
  area: string;
  prefecture: string;
  teamName: string;
}

// Supabaseクライアントの初期化
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const ALL_AREAS = 'all_areas'
const ALL_PREFECTURES = 'all_prefectures'

export default function SearchTeam() {
  const [searchTerm, setSearchTerm] = useState('')
  const [teams, setTeams] = useState<Team[]>([])
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([])
  const [error, setError] = useState<string | null>(null)
  const [areas, setAreas] = useState<string[]>([])
  const [prefectures, setPrefectures] = useState<string[]>([])
  const [selectedArea, setSelectedArea] = useState<string>(ALL_AREAS)
  const [selectedPrefecture, setSelectedPrefecture] = useState<string>(ALL_PREFECTURES)

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const { data, error } = await supabase
          .from('Team')
          .select('id, area, prefecture, teamName')

        if (error) throw error

        setTeams(data || [])

        // エリアと都道府県の一覧を取得
        const uniqueAreas = Array.from(new Set(data?.map(team => team.area) || []))
        const uniquePrefectures = Array.from(new Set(data?.map(team => team.prefecture) || []))
        setAreas(uniqueAreas)
        setPrefectures(uniquePrefectures)
      } catch (error) {
        console.error('Error fetching teams:', error)
        setError('チームの取得中にエラーが発生しました。')
      }
    }

    fetchTeams()
  }, [])

  useEffect(() => {
    const filtered = teams.filter(team => 
      (team.teamName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (String(team.id).toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    ).filter(team =>
      (selectedArea === ALL_AREAS || team.area === selectedArea) &&
      (selectedPrefecture === ALL_PREFECTURES || team.prefecture === selectedPrefecture)
    )
    setFilteredTeams(filtered)
  }, [searchTerm, teams, selectedArea, selectedPrefecture])

  return (
    <div className="min-h-screen text-white p-8 contentInner">
      <h1 className="text-3xl font-bold mb-8">チーム検索</h1>
      <div className="flex flex-col space-y-4 mb-6">
        <div className="flex space-x-4">
          <Select onValueChange={setSelectedArea} value={selectedArea}>
            <SelectTrigger className="w-full font-normal text-base">
              <SelectValue placeholder="エリアを選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_AREAS}>全てのエリア</SelectItem>
              {areas.map(area => (
                <SelectItem key={area} value={area}>{area}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select onValueChange={setSelectedPrefecture} value={selectedPrefecture}>
            <SelectTrigger className="w-full font-normal text-base">
              <SelectValue placeholder="都道府県を選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_PREFECTURES}>全ての都道府県</SelectItem>
              {prefectures.map(prefecture => (
                <SelectItem key={prefecture} value={prefecture}>{prefecture}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="relative">
          <Input
            type="text"
            placeholder="チーム名かチームIdを入力してください"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-white pl-10 pr-4 py-2 rounded-lg pt-6 pb-6 font-normal text-base"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>
      {error && (
        <div className="text-red-500 mb-4">{error}</div>
      )}
      <div className="space-y-4">
        {filteredTeams.map(team => (
          <Card key={team.id}>
            <Link href={`/Team/${team.id}`}>
              <CardContent className="p-4">
                <div className='flex justify-between'>
                  <div><p className="text-gray-400">TeamId : {team.id}</p>
                <h2 className="text-3xl font-semibold mt-1 text-white">{team.teamName}</h2></div>
                <div className='text-white font-bold text-lg mt-10'>
                  <div>{team.prefecture}｜{team.area}</div>
                </div>
                </div>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  )
}