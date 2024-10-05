'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link';
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search } from "lucide-react"
import { createClient } from '@supabase/supabase-js'

interface Game {
  id: string;
  teamAId: string;
  teamBId: string;
  date: string;
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

export default function SearchScore() {
  const [searchTerm, setSearchTerm] = useState('')
  const [games, setGames] = useState<Game[]>([])
  const [filteredGames, setFilteredGames] = useState<Game[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const { data, error } = await supabase
          .from('Game')
          .select('*')

        if (error) throw error

        setGames(data || [])
      } catch (error) {
        console.error('Error fetching games:', error)
        setError('試合データの取得中にエラーが発生しました。')
      }
    }

    fetchGames()
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
    const filtered = games.filter(game => 
      game.id.toString().includes(searchTerm) ||
      game.teamAId.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.teamBId.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      teams.find(team => team.id === game.teamAId)?.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teams.find(team => team.id === game.teamBId)?.teamName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredGames(filtered)
  }, [searchTerm, games, teams])

  return (
    <div className="min-h-screen text-white p-8 contentInner">
      <h1 className="text-3xl font-bold mb-8">試合検索</h1>
      <div className="relative mb-6">
        <Input
          type="text"
          placeholder="試合ID、チーム名で検索してください"
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
        {filteredGames.map(game => {
          const teamA = teams.find(team => team.id === game.teamAId)
          const teamB = teams.find(team => team.id === game.teamBId)

          return (

            <Card key={game.id} className="bg-gray-700">
              <Link href="/NewScore">
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <p className="text-gray-300">GameId : {game.id}</p>
                  <h2 className="text-2xl text-white font-semibold mt-1">
                    {teamA?.teamName} vs {teamB?.teamName}
                  </h2>
                </div>
                <p className="text-gray-300 mt-7">{game.date}</p>
              </CardContent>

            </Link>
            </Card>
          )
        })}
      </div>
    </div>
  )
}