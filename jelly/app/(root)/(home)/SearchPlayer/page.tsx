'use client'
import axios from 'axios'
import { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search } from "lucide-react"

interface Player {
  id: string;
  name: string;
  teamId: string;
}

interface Team {
  id: string;
  teamName: string;
}

export default function SearchPlayer() {
  const [searchTerm, setSearchTerm] = useState('')
  const [players, setPlayers] = useState<Player[]>([])
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([])
  const [teams, setTeams] = useState<Team[]>([])

  useEffect(() => {
    // Fetch players from API
    const fetchPlayers = async () => {
      try {
        const response = await axios.get('http://localhost:8888/api/auth/player') // Replace with your actual API endpoint
        setPlayers(response.data)
      } catch (error) {
        console.error(error)
      }
    }

    fetchPlayers()
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
    const filtered = players.filter(player => 
      player.id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teams.find(team => team.id === player.teamId)?.teamName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredPlayers(filtered)
  }, [searchTerm, players, teams])

  return (
    <div className="min-h-screen text-white p-8">
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
      <div className="space-y-4">
        {filteredPlayers.map(player => {
          const team = teams.find(team => team.id === player.teamId)

          return (
            <Card key={player.id} className="bg-gray-700">
              <CardContent className="p-4">
                <p className="text-gray-300">PlayerId : {player.id}</p>
                <div className='flex justify-between'>
                  <div className='flex-1 w-80 flex justify-start'>
                    <h2 className="flex-1 w-5 text-3xl font-semibold mt-1 text-white">{player.name}</h2>
                    {/* {player.nameKana && <p className="flex-1 w-5 mt-4 text-gray-300">{player.nameKana}</p>} */}
                  </div>

                  <p className="flex-1 w-5 text-right text-gray-300 mt-4">所属：{team?.teamName}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}