'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link';
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search } from "lucide-react"
import { createClient } from '@supabase/supabase-js'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Player {
  id: string;
  name: string;
  teamId: string;
}

interface Team {
  id: string;
  teamName: string;
  area: string;
  prefecture: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function SearchPlayer() {
  const [searchTerm, setSearchTerm] = useState('')
  const [players, setPlayers] = useState<Player[]>([])
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [selectedArea, setSelectedArea] = useState<string | null>(null)
  const [selectedPrefecture, setSelectedPrefecture] = useState<string | null>(null)

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const { data, error } = await supabase
          .from('Player')
          .select('*')

        if (error) throw error

        setPlayers(data || [])
      } catch (error) {
        console.error('Error fetching players:', error)
        setError('選手データの取得中にエラーが発生しました。')
      }
    }

    fetchPlayers()
  }, [])

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const { data, error } = await supabase
          .from('Team')
          .select('*')

        if (error) throw error

        setTeams(data || [])
      } catch (error) {
        console.error('Error fetching teams:', error)
        setError('チームデータの取得中にエラーが発生しました。')
      }
    }

    fetchTeams()
  }, [])

  useEffect(() => {
    const filtered = players.filter(player => {
      const team = teams.find(team => team.id === player.teamId)
      const matchesSearch = 
        player.id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team?.teamName.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesTeam = !selectedTeam || selectedTeam === 'all' || team?.id === selectedTeam
      const matchesArea = !selectedArea || selectedArea === 'all' || team?.area === selectedArea
      const matchesPrefecture = !selectedPrefecture || selectedPrefecture === 'all' || team?.prefecture === selectedPrefecture

      return matchesSearch && matchesTeam && matchesArea && matchesPrefecture
    })
    setFilteredPlayers(filtered)
  }, [searchTerm, players, teams, selectedTeam, selectedArea, selectedPrefecture])

  const uniqueAreas = Array.from(new Set(teams.map(team => team.area)))
  const uniquePrefectures = Array.from(new Set(teams.map(team => team.prefecture)))

  return (
    <div className="min-h-screen text-white p-8 contentInner">
      <h1 className="text-3xl font-bold mb-8">選手検索</h1>
      <div className="flex space-x-4 mb-4">
        <Select onValueChange={setSelectedArea}>
          <SelectTrigger className="w-full font-normal text-base">
            <SelectValue placeholder="エリアで絞り込み" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全てのエリア</SelectItem>
            {uniqueAreas.map(area => (
              <SelectItem key={area} value={area}>{area}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select onValueChange={setSelectedPrefecture}>
          <SelectTrigger className="w-full font-normal text-base">
            <SelectValue placeholder="都道府県で絞り込み" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全ての都道府県</SelectItem>
            {uniquePrefectures.map(prefecture => (
              <SelectItem key={prefecture} value={prefecture}>{prefecture}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select onValueChange={setSelectedTeam}>
          <SelectTrigger className="w-full font-normal text-base">
            <SelectValue placeholder="チームで絞り込み" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全てのチーム</SelectItem>
            {teams.map(team => (
              <SelectItem key={team.id} value={team.id}>{team.teamName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="relative mb-6">
        <Input
          type="text"
          placeholder="選手名、選手Id、チーム名で検索してください"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-white pl-10 pr-4 py-2 rounded-lg pt-6 pb-6 text-base"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>
      {error && (
        <div className="text-red-500 mb-4">{error}</div>
      )}
      <div className="space-y-4">
        {filteredPlayers.map(player => {
          const team = teams.find(team => team.id === player.teamId)

          return (
            <Card key={player.id} className="bg-gray-700">
            <Link href={`/Player/${player.id}`}>
              <CardContent className="p-4">
                <p className="text-gray-300">PlayerId : {player.id}</p>
                <div className='flex justify-between'>
                  <div className='flex-1 w-80 flex justify-start'>
                    <h2 className="flex-1 w-5 text-3xl font-semibold mt-1 text-white">{player.name}</h2>
                  </div>
                  <div className="flex-1 w-5 text-right text-gray-300 mt-5">
                <p >{team?.teamName}｜{team?.prefecture}｜{team?.area} </p>
                </div>
                </div>
              </CardContent>
            </Link>
            </Card>
          )
        })}
      </div>
    </div>
  )
}