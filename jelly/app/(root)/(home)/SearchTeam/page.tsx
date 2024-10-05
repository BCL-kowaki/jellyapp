'use client'
import axios from 'axios'
import { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search } from "lucide-react"

interface Team {
  id: string;
  teamName: string;
}

export default function SearchTeam() {
  const [searchTerm, setSearchTerm] = useState('')
  const [teams, setTeams] = useState<Team[]>([])
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([])

  useEffect(() => {
    // Fetch teams from API
    const fetchTeams = async () => {
      try {
        const response = await axios.get('http://localhost:8888/api/auth/team') // Replace with your actual API endpoint
        setTeams(response.data)
      } catch (error) {
        console.error(error)
      }
    }

    fetchTeams()
  }, [])

  useEffect(() => {
    const filtered = teams.filter(team => 
      team.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.id.includes(searchTerm)
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
      <div className="space-y-4">
        {filteredTeams.map(team => (
          <Card key={team.id}>
            <CardContent className="p-4">
              <p className="text-gray-400">TeamId : {team.id}</p>
              <h2 className="text-xl font-semibold mt-1 text-white">{team.teamName}</h2>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}