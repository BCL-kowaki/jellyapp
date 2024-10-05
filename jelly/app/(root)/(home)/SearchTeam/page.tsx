'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link';
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search } from "lucide-react"
import { createClient } from '@supabase/supabase-js'

interface Team {
  id: string;
  teamName: string;
}

// Supabaseクライアントの初期化
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function SearchTeam() {
  const [searchTerm, setSearchTerm] = useState('')
  const [teams, setTeams] = useState<Team[]>([])
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const { data, error } = await supabase
          .from('Team')
          .select('id, teamName')

        if (error) throw error

        setTeams(data || [])
      } catch (error) {
        console.error('Error fetching teams:', error)
        setError('チームの取得中にエラーが発生しました。')
      }
    }

    fetchTeams()
  }, [])

  useEffect(() => {
    const filtered = teams.filter(team => 
      team.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.id.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredTeams(filtered)
  }, [searchTerm, teams])

  return (
    <div className="min-h-screen text-white p-8 contentInner">
      <h1 className="text-3xl font-bold mb-8">チーム検索</h1>
      <div className="relative mb-6">
        <Input
          type="text"
          placeholder="チーム名かチームIdを入力してください"
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

        {filteredTeams.map(team => (
          <Card key={team.id}>
          <Link href="/Team">
            <CardContent className="p-4">
              <p className="text-gray-400">TeamId : {team.id}</p>
              <h2 className="text-xl font-semibold mt-1 text-white">{team.teamName}</h2>
            </CardContent>

      </Link>
          </Card>
        ))}
      </div>
    </div>
  )
}