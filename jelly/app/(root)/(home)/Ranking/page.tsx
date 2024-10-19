'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search } from "lucide-react"
import { createClient } from '@supabase/supabase-js'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Player {
  id: string;
  name: string;
  teamId: string;
  image: string;
}

interface Team {
  id: string;
  teamName: string;
  area: string;
  prefecture: string;
}

interface Score {
  playerId: string;
  kinds: string;
  point: number;
}

interface PlayerStats {
  id: string;
  name: string;
  teamName: string;
  prefecture: string;
  area: string;
  image: string;
  totalPoints: number;
  totalAssists: number;
  totalRebounds: number;
  totalSteals: number;
  totalBlocks: number;
  gamesPlayed: number;
}

type ScoreCategory = 'points' | 'assists' | 'rebounds' | 'steals' | 'blocks';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function PlayerRanking() {
  const [searchTerm, setSearchTerm] = useState('')
  const [players, setPlayers] = useState<Player[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [scores, setScores] = useState<Score[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [selectedArea, setSelectedArea] = useState<string | null>(null)
  const [selectedPrefecture, setSelectedPrefecture] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<ScoreCategory>('points')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [playersData, teamsData, scoresData] = await Promise.all([
          supabase.from('Player').select('*'),
          supabase.from('Team').select('*'),
          supabase.from('Score').select('*')
        ]);

        if (playersData.error) throw playersData.error;
        if (teamsData.error) throw teamsData.error;
        if (scoresData.error) throw scoresData.error;

        setPlayers(playersData.data || []);
        setTeams(teamsData.data || []);
        setScores(scoresData.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('データの取得中にエラーが発生しました。');
      }
    };

    fetchData();
  }, []);

  const playerStats: PlayerStats[] = useMemo(() => {
    return players.map(player => {
      const team = teams.find(t => t.id === player.teamId);
      const playerScores = scores.filter(s => s.playerId === player.id);
      
      const totalPoints = playerScores
        .filter(s => ['point_2P', 'point_3P', 'point_1P'].includes(s.kinds))
        .reduce((sum, s) => sum + s.point, 0);
      
      const totalAssists = playerScores
        .filter(s => s.kinds === 'assist')
        .reduce((sum, s) => sum + s.point, 0);
      
      const totalRebounds = playerScores
        .filter(s => s.kinds === 'rebound')
        .reduce((sum, s) => sum + s.point, 0);
      
      const totalSteals = playerScores
        .filter(s => s.kinds === 'steal')
        .reduce((sum, s) => sum + s.point, 0);
      
      const totalBlocks = playerScores
        .filter(s => s.kinds === 'block')
        .reduce((sum, s) => sum + s.point, 0);
      
      const gamesPlayed = playerScores
        .filter(s => ['participation', 'starter'].includes(s.kinds))
        .reduce((sum, s) => sum + s.point, 0);

      return {
        id: player.id,
        name: player.name,
        teamName: team?.teamName || '',
        prefecture: team?.prefecture || '',
        area: team?.area || '',
        image: player.image || '',
        totalPoints,
        totalAssists,
        totalRebounds,
        totalSteals,
        totalBlocks,
        gamesPlayed
      };
    });
  }, [players, teams, scores]);

  const filteredAndSortedPlayers = useMemo(() => {
    return playerStats
      .filter(player => {
        const matchesSearch = 
          (typeof player.id === 'string' && player.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (typeof player.name === 'string' && player.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (typeof player.teamName === 'string' && player.teamName.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesTeam = !selectedTeam || selectedTeam === 'all' || player.teamName === teams.find(t => t.id === selectedTeam)?.teamName;
        const matchesArea = !selectedArea || selectedArea === 'all' || player.area === selectedArea;
        const matchesPrefecture = !selectedPrefecture || selectedPrefecture === 'all' || player.prefecture === selectedPrefecture;

        return matchesSearch && matchesTeam && matchesArea && matchesPrefecture;
      })
      .sort((a, b) => {
        const getAverageValue = (player: PlayerStats) => {
          const totalValue = player[`total${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}` as keyof PlayerStats] as number;
          return player.gamesPlayed > 0 ? totalValue / player.gamesPlayed : 0;
        };

        const aAverage = getAverageValue(a);
        const bAverage = getAverageValue(b);

        return bAverage - aAverage; // Sort in descending order
      });
  }, [playerStats, searchTerm, selectedTeam, selectedArea, selectedPrefecture, selectedCategory, teams]);

  const uniqueAreas = Array.from(new Set(teams.map(team => team.area)))
  const uniquePrefectures = Array.from(new Set(teams.map(team => team.prefecture)))

  return (
    <div className="min-h-screen text-white p-8 contentInner">
      <h1 className="text-3xl font-bold mb-8">選手ランキング</h1>
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
        <Select onValueChange={(value) => setSelectedCategory(value as ScoreCategory)}>
          <SelectTrigger className="w-full font-normal text-base">
            <SelectValue placeholder="ランキング種別" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="points">得点</SelectItem>
            <SelectItem value="assists">アシスト</SelectItem>
            <SelectItem value="rebounds">リバウンド</SelectItem>
            <SelectItem value="steals">スティール</SelectItem>
            <SelectItem value="blocks">ブロック</SelectItem>
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
        {filteredAndSortedPlayers.slice(0, 30).map((player, index) => {
          const totalValue = player[`total${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}` as keyof PlayerStats] as number;
          const averageValue = player.gamesPlayed > 0 ? totalValue / player.gamesPlayed : 0;

          return (
            <Card key={player.id} className="bg-gray-700">
              <Link href={`/Player/${player.id}`}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <Image
                        src={player.image ? `/images/player/${player.image}` : '/placeholder.svg'}
                        alt={player.name}
                        width={120}
                        height={120}
                        className="rounded-full object-cover mr-3"
                      />
                      <div>
                        <p className="text-white text-3xl font-semibold">Rank: {index + 1}</p>
                        <div className='mt-4'>
                          <h2 className="text-4xl font-semibold mt-1 text-white">{player.name}</h2>
                          <p className="text-gray-300 mt-1">{player.teamName}｜{player.prefecture}｜{player.area}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-right mt-4">
                        <div>
                          <p className="text-5xl font-bold text-white mb-1">
                            {averageValue.toFixed(1)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-300">出場試合数: {player.gamesPlayed}</p>
                        </div>
                      </div>
                      <div>   
                        <p className="text-gray-300 mt-2">
                          PT:<span className='text-3xl'> {player.totalPoints.toFixed(0)} </span> - 
                          AS:<span className='text-3xl'> {player.totalAssists.toFixed(0)} </span> -  
                          RB:<span className='text-3xl'> {player.totalRebounds.toFixed(0)}</span> - 
                          ST:<span className='text-3xl'> {player.totalSteals.toFixed(0)} </span> - 
                          BK:<span className='text-3xl'> {player.totalBlocks.toFixed(0)}</span>
                        </p>
                      </div>
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