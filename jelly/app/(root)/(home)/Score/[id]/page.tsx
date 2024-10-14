'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import styles from "./style.module.scss"
import { createClient, PostgrestError } from '@supabase/supabase-js'
import { useParams } from 'next/navigation'
import {Card, CardDescription, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import TotalScore from './TotalScore/page'
import TeamFoul from './TeamFoul/page'
import TeamTimeout from './TeamTimeout/page'

// Supabase client initialization
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type definitions
type GameData = {
  id: number;
  teamAId: number;
  teamBId: number;
  date: string;
};

type TeamData = {
  id: number;
  teamName: string;
};

type Player = {
  id: number;
  name: string;
  No: number;
  position: string;
  points: number;
  fouls: number;
  game: string;
  assist: number;
  rebound: number;
  turnover: number;
};

type ScoreData = {
  playerId: number;
  kinds: string;
  point: number;
};

export default function Score() {
  const params = useParams();
  const gameId = params.id as string;
  const [gameDate, setGameDate] = useState<string>('')
  const [gameData, setGameData] = useState<GameData | null>(null)
  const [teamAData, setTeamAData] = useState<TeamData | null>(null)
  const [teamBData, setTeamBData] = useState<TeamData | null>(null)
  const [processedPlayerDataA, setProcessedPlayerDataA] = useState<Player[]>([])
  const [processedPlayerDataB, setProcessedPlayerDataB] = useState<Player[]>([])
  const [refreshKey, setRefreshKey] = useState(0)

  const fetchData = useCallback(async () => {
    try {
      // Fetch game data
      const { data: fetchedGameData, error: gameError } = await supabase
        .from('Game')
        .select('id, teamAId, teamBId, date')
        .eq('id', gameId)
        .single() as { data: GameData | null, error: PostgrestError | null };

      if (gameError) throw gameError;
      if (!fetchedGameData) throw new Error('No game data found');

      setGameData(fetchedGameData);
      setGameDate(format(new Date(fetchedGameData.date), 'yyyy/MM/dd'));

      // Fetch team data
      const { data: teamData, error: teamError } = await supabase
        .from('Team')
        .select('id, teamName')
        .in('id', [fetchedGameData.teamAId, fetchedGameData.teamBId]) as { data: TeamData[] | null, error: PostgrestError | null };

      if (teamError) throw teamError;

      const teamA = teamData?.find(team => team.id === fetchedGameData.teamAId) || null;
      const teamB = teamData?.find(team => team.id === fetchedGameData.teamBId) || null;
      setTeamAData(teamA);
      setTeamBData(teamB);

      // Fetch player data
      const fetchPlayerData = async (teamId: number) => {
        const { data: playerData, error: playerError } = await supabase
          .from('Player')
          .select('id, No, name, position')
          .eq('teamId', teamId) as { data: Player[] | null, error: PostgrestError | null };

        if (playerError) throw playerError;
        return playerData || [];
      };

      const playerDataA = await fetchPlayerData(fetchedGameData.teamAId);
      const playerDataB = await fetchPlayerData(fetchedGameData.teamBId);

      // Fetch score data
      const { data: scoreData, error: scoreError } = await supabase
        .from('Score')
        .select('playerId, kinds, point')
        .eq('gameId', gameId) as { data: ScoreData[] | null, error: PostgrestError | null };

      if (scoreError) throw scoreError;

      // Process player data
      const processPlayerData = (playerData: Player[]): Player[] => {
        return playerData.map(player => {
          const playerScores = scoreData?.filter(score => score.playerId === player.id) || []
          const points = playerScores
            .filter(score => ['point_2P', 'point_3P', 'point_1P'].includes(score.kinds))
            .reduce((sum, score) => sum + (typeof score.point === 'number' ? score.point : 0), 0)
          const fouls = playerScores
            .filter(score => score.kinds === 'foul')
            .reduce((sum, score) => sum + (typeof score.point === 'number' ? score.point : 0), 0)
          const game = playerScores.some(score => score.kinds === 'starter') ? 'S' : 
                       playerScores.some(score => score.kinds === 'participation') ? '⚫︎' : ''
          const assist = playerScores
            .filter(score => score.kinds === 'assist')
            .reduce((sum, score) => sum + (typeof score.point === 'number' ? score.point : 0), 0)
          const rebound = playerScores
            .filter(score => score.kinds === 'rebound')
            .reduce((sum, score) => sum + (typeof score.point === 'number' ? score.point : 0), 0)
          const turnover = playerScores
            .filter(score => score.kinds === 'turnover')
            .reduce((sum, score) => sum + (typeof score.point === 'number' ? score.point : 0), 0)
          return { ...player, points, fouls, game, assist, rebound, turnover }
        })
      }

      setProcessedPlayerDataA(processPlayerData(playerDataA));
      setProcessedPlayerDataB(processPlayerData(playerDataB));

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, [gameId]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshKey]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'updateScore') {
        setRefreshKey(prevKey => prevKey + 1);
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const handleButtonClick = () => {
    const width = 769;
    const height = 960;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    window.open(
      `/Controller/${gameId}`,
      'ControllerWindow',
      `width=${width},height=${height},left=${left},top=${top},resizable=no`
    );
  };

  const renderTeamTable = (teamName: string, teamId: number, playerData: Player[]) => (
    <Card className='size-full'>      
      <div className="mb-8">
        <CardHeader className="px-7">
          <CardTitle>
            {teamName}
          </CardTitle>
          <CardDescription>
            TeamID: {teamId}
          </CardDescription>
        </CardHeader> 
        <CardContent>
          <Table>
            <TableHeader className="text-white text-xs">
              <TableRow>
                <TableHead className="hidden w-1/12 sm:table-cell text-center">No</TableHead>
                <TableHead className="hidden w-1/12 sm:table-cell text-center">G</TableHead>
                <TableHead className="hidden w-3/12 sm:table-cell text-center">NAME</TableHead>
                <TableHead className="hidden w-1/12 sm:table-cell text-center">PS</TableHead>
                <TableHead className="hidden w-1/12 sm:table-cell text-center">PT</TableHead>
                <TableHead className="hidden w-1/12 sm:table-cell text-center">AS</TableHead>
                <TableHead className="hidden w-1/12 sm:table-cell text-center">RB</TableHead>
                <TableHead className="hidden w-1/12 sm:table-cell text-center">PF</TableHead>
                <TableHead className="hidden w-1/12 sm:table-cell text-center">TO</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-ms text-white">
              {playerData.map(player => (
                <TableRow key={player.id}>
                  <TableCell className="hidden w-1/12 sm:table-cell text-center">#{player.No}</TableCell>
                  <TableCell className="hidden w-1/12 sm:table-cell text-center">{player.game}</TableCell>
                  <TableCell className="hidden w-3/12 sm:table-cell text-center">{player.name}</TableCell>
                  <TableCell className="hidden w-1/12 sm:table-cell text-center">{player.position}</TableCell>
                  <TableCell className="hidden w-1/12 sm:table-cell text-center">{player.points}</TableCell>
                  <TableCell className="hidden w-1/12 sm:table-cell text-center">{player.assist}</TableCell>
                  <TableCell className="hidden w-1/12 sm:table-cell text-center">{player.rebound}</TableCell>
                  <TableCell className="hidden w-1/12 sm:table-cell text-center">{player.fouls}</TableCell>
                  <TableCell className="hidden w-1/12 sm:table-cell text-center">{player.turnover}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </div>
    </Card>
  )

  return (
    <section className="flex size-full gap-10 text-white">
      <section className="flex size-full flex-col text-white">
        <div className={styles.mainContent}>
          <div className={styles.mainContent__inner}>
            <h1 className="text-3xl font-bold mb-2">{gameDate}</h1>
            <div className='flex justify-between'>
              <h2 className="text-xl font-bold mb-2 mt-5">Game ID: {gameId}</h2>
              {gameData && teamAData && teamBData && (
                <h3 className="text-3xl font-bold mb-6 mt-4 ml-10"> {teamAData.teamName} - {teamBData.teamName}</h3>
              )}
              <button onClick={handleButtonClick} className="bg-blue-500 hover:bg-blue-700 text-white font-bold px-2 rounded">
                スコア入力
              </button>
            </div>
            <section className="flex text-white gap-5 mt-3 mb-5">
              <div className="size-full">
                <TotalScore key={refreshKey} />
              </div>
            </section>
            <section className="flex text-white gap-5 mb-5">
              <div className="size-1/2">
                <TeamFoul key={refreshKey} />
              </div>
              <div className="size-1/2">
                <TeamTimeout key={refreshKey} />
              </div>
            </section>
            <section className="flex text-white gap-5">
              {teamAData && renderTeamTable(teamAData.teamName, teamAData.id, processedPlayerDataA)}
              {teamBData && renderTeamTable(teamBData.teamName, teamBData.id, processedPlayerDataB)}
            </section>
          </div>
        </div>
      </section>
    </section>
  );
}