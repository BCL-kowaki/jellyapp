'use client'
import axios from 'axios';
import { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search } from "lucide-react"

interface Game {
  id: string;
  teamAId: string;
  teamBId: string;
}

interface Team {
  id: string;
  teamName: string;
}

export default function SearchScore() {
  const [searchTerm, setSearchTerm] = useState('')
  const [games, setGames] = useState<Game[]>([])
  const [filteredGames, setFilteredGames] = useState<Game[]>([])
  const [teams, setTeams] = useState<Team[]>([])

  useEffect(() => {
    // Fetch games from API
    const fetchGames = async () => {
      try {
        const response = await axios.get('http://localhost:8888/api/auth/game') // Replace with your actual API endpoint
        setGames(response.data)
      } catch (error) {
        console.error(error)
      }
    }

    fetchGames()
  }, [])

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
    const filtered = games.filter(game => 
      game.id.toString().includes(searchTerm) ||
      game.teamAId.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.teamBId.toString().toLowerCase().includes(searchTerm.toLowerCase()) 
    )
    setFilteredGames(filtered)
  }, [searchTerm, games])

  return (
    <div className="min-h-screen text-white p-8">
      <h1 className="text-3xl font-bold mb-8">試合検索</h1>
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
      <div className="space-y-4">
        {filteredGames.map(game => {
          const teamA = teams.find(team => team.id === game.teamAId)
          const teamB = teams.find(team => team.id === game.teamBId)

          return (
            <Card key={game.id} className="bg-gray-700">
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <p className="text-gray-300">GameId : {game.id}</p>
                  <h2 className="text-2xl text-white font-semibold mt-1">
                    {teamA?.teamName} vs {teamB?.teamName}
                  </h2>
                </div>
                {/* <p className="text-gray-300 mt-7">{game.date}</p> */}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}