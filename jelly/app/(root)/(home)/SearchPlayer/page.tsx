'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link';
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search } from "lucide-react"
import { createClient } from '@supabase/supabase-js'

interface Player {
  id: string;
  name: string;
  teamId: string;
}

interface Team {
  id: string;
  teamName: string;
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
    const filtered = players.filter(player => 
      player.id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teams.find(team => team.id === player.teamId)?.teamName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredPlayers(filtered)
  }, [searchTerm, players, teams])

  return (
    <div className="min-h-screen text-white p-8 contentInner">
      <h1 className="text-3xl font-bold mb-8">選手検索</h1>
      <div className="relative mb-6">
        <Input
          type="text"
          placeholder="選手名、選手Id、チーム名で検索してください"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-white pl-10 pr-4 py-2 rounded-lg"
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
                  <p className="flex-1 w-5 text-right text-gray-300 mt-4">所属：{team?.teamName}</p>
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