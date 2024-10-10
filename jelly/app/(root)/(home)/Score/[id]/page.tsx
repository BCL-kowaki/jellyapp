'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import styles from "./style.module.scss"
import { createClient, PostgrestError } from '@supabase/supabase-js'
import { useParams } from 'next/navigation'
import {Card, CardDescription, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Minus, Plus } from "lucide-react"
import TotalScore from './TotalScore/page'
import TeamFoul from './TeamFoul/page'
import TeamTimeout from './TeamTimeout/page'

// Supabaseクライアントの初期化
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 型定義
type GameData = {
  id: number;
  teamAId: number;
  teamBId: number;
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
};

type ScoreData = {
  playerId: number;
  kinds: string;
  point: number;
};

export default function Score() {
  const params = useParams();
  const gameId = params.id as string;
  const today = format(new Date(), 'yyyy/MM/dd')
  const [gameData, setGameData] = useState<GameData | null>(null)
  const [teamAData, setTeamAData] = useState<TeamData | null>(null)
  const [teamBData, setTeamBData] = useState<TeamData | null>(null)
  const [processedPlayerDataA, setProcessedPlayerDataA] = useState<Player[]>([])
  const [processedPlayerDataB, setProcessedPlayerDataB] = useState<Player[]>([])
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  
  // Form state
  const [quarter, setQuarter] = useState('')
  const [category, setCategory] = useState('')
  const [playerId, setPlayerId] = useState('')
  const [point, setPoint] = useState(0)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const fetchData = useCallback(async () => {
    try {
      // Fetch only the specific game data for the given [id]
      const { data: fetchedGameData, error: gameError } = await supabase
        .from('Game')
        .select('id, teamAId, teamBId')
        .eq('id', gameId)
        .single() as { data: GameData | null, error: PostgrestError | null };

      if (gameError) throw gameError;
      if (!fetchedGameData) throw new Error('No game data found');

      setGameData(fetchedGameData);

      // Fetch team data for both teams
      const { data: teamData, error: teamError } = await supabase
        .from('Team')
        .select('id, teamName')
        .in('id', [fetchedGameData.teamAId, fetchedGameData.teamBId]) as { data: TeamData[] | null, error: PostgrestError | null };

      if (teamError) throw teamError;

      const teamA = teamData?.find(team => team.id === fetchedGameData.teamAId) || null;
      const teamB = teamData?.find(team => team.id === fetchedGameData.teamBId) || null;
      setTeamAData(teamA);
      setTeamBData(teamB);

      // Fetch player data for both teams
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

      // Fetch score data for all players in this game
      const { data: scoreData, error: scoreError } = await supabase
        .from('Score')
        .select('playerId, kinds, point')
        .eq('gameId', gameId) as { data: ScoreData[] | null, error: PostgrestError | null };

      if (scoreError) throw scoreError;

      // Process player data with scores
      const processPlayerData = (playerData: Player[]): Player[] => {
        return playerData.map(player => {
          const playerScores = scoreData?.filter(score => score.playerId === player.id) || []
          const points = playerScores
            .filter(score => ['point_2P', 'point_3P', 'point_1P'].includes(score.kinds))
            .reduce((sum, score) => sum + (typeof score.point === 'number' ? score.point : 0), 0)
          const fouls = playerScores
            .filter(score => score.kinds === 'foul')
            .reduce((sum, score) => sum + (typeof score.point === 'number' ? score.point : 0), 0)
          return { ...player, points, fouls }
        })
      }

      setProcessedPlayerDataA(processPlayerData(playerDataA));
      setProcessedPlayerDataB(processPlayerData(playerDataB));

    } catch (error) {
      console.error('Error fetching data:', error);
      // Add error handling here (e.g., setting an error state)
    }
  }, [gameId]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshTrigger]);

  const handleTeamChange = (value: string) => {
    setSelectedTeam(parseInt(value));
    setPlayerId(''); // Reset player selection when team changes
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('loading');

    try {
      const { error } = await supabase
        .from('Score')
        .insert([
          {
            gameId: parseInt(gameId),
            playerId: parseInt(playerId),
            teamId: selectedTeam,
            quarter,
            kinds: category,
            point,
          },
        ]);

      if (error) throw error;

      setSubmitStatus('success');
      // Reset form
      setQuarter('');
      setCategory('');
      setPlayerId('');
      setPoint(0);
      
      // Trigger a refresh of the data
      setRefreshTrigger(prev => prev + 1);

      // Force a re-render of child components
      setGameData(prevData => ({ ...prevData! }));
    } catch (error) {
      console.error('Error submitting score:', error);
      setSubmitStatus('error');
    } finally {
      // Reset submit status after a short delay
      setTimeout(() => setSubmitStatus('idle'), 2000);
    }
  };

  const renderTeamTable = (teamName: string, teamId: number, playerData: Player[]) => (
    <Card x-chunk="dashboard-05-chunk-3" className='size-full'>      
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
                <TableHead className="hidden w-6/12 sm:table-cell text-center">NAME</TableHead>
                <TableHead className="hidden w-1/12 sm:table-cell text-center">POS</TableHead>
                <TableHead className="hidden w-3/12 sm:table-cell text-center">PTS</TableHead>
                <TableHead className="hidden w-1/12 sm:table-cell text-center">PF</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-ms text-white">
              {playerData.map(player => (
                <TableRow key={player.id}>
                  <TableCell className="hidden w-1/12 sm:table-cell text-center">#{player.No}</TableCell>
                  <TableCell className="hidden w-6/12 sm:table-cell text-center">{player.name}</TableCell>
                  <TableCell className="hidden w-1/12 sm:table-cell text-center">{player.position}</TableCell>
                  <TableCell className="hidden w-3/12 sm:table-cell text-center">{player.points}</TableCell>
                  <TableCell className="hidden w-1/12 sm:table-cell text-center">{player.fouls}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </div>
    </Card>
  )

  return (
    <>
      <section className="flex size-full gap-10 text-white">
        <section className="flex size-full flex-col text-white">
          <div className={styles.mainContent}>
            <div className={styles.mainContent__inner}>
              <div className='flex justify-between'>
                <h1 className="text-3xl font-bold mb-8">{today}</h1>
                <h2 className="text-xl font-bold mb-6 mt-4">Game ID: {gameId}</h2>
              </div>
              {gameData && (
                <div className="mb-4">
                  <p>Team A ID: {gameData.teamAId}</p>
                  <p>Team B ID: {gameData.teamBId}</p>
                </div>
              )}
              <div className="mb-5">
                <Card x-chunk="dashboard-07-chunk-2">
                  <section className="flex flex-col gap-10 p-8 text-white">
                    <form className="mt-4 mb-2" onSubmit={handleSubmit}>
                      <div className="flex justify-between gap-10">
                        <div className="flex justify-between size-2/3">
                          <div className={styles.flexWHalf}>
                            <div className="mb-4">
                              <Select
                                value={quarter}
                                onValueChange={setQuarter}
                              >
                                <SelectTrigger
                                  id="quarter"
                                  aria-label="Select quarter"
                                >
                                  <SelectValue placeholder="クォーター" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="first">1クォーター</SelectItem>
                                  <SelectItem value="second">2クォーター</SelectItem>
                                  <SelectItem value="third">3クォーター</SelectItem>
                                  <SelectItem value="fourth">4クォーター</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="mb-4">
                              <Select onValueChange={handleTeamChange}>
                                <SelectTrigger
                                  id="team"
                                  aria-label="Select team"
                                >
                                  <SelectValue placeholder="チーム" />
                                </SelectTrigger>
                                <SelectContent>
                                  {teamAData && (
                                    <SelectItem value={teamAData.id.toString()}>
                                      {teamAData.teamName}
                                    </SelectItem>
                                  )}
                                  {teamBData && (
                                    <SelectItem value={teamBData.id.toString()}>
                                      {teamBData.teamName}
                                    </SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className={styles.flexWHalf}>
                            <div className="mb-4">
                              <Select
                                value={category}
                                onValueChange={setCategory}
                              >
                                <SelectTrigger
                                  id="category"
                                  aria-label="Select category"
                                >
                                  <SelectValue placeholder="カテゴリー" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="point_2P">得点_2P</SelectItem>
                                  <SelectItem value="point_3P">得点_3P</SelectItem>
                                  <SelectItem value="point_FT">得点_FT</SelectItem>
                                  <SelectItem value="foul">ファール</SelectItem>
                                  <SelectItem value="timeout">タイムアウト</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="mb-4">
                              <Select
                                value={playerId}
                                onValueChange={setPlayerId}
                              >
                                <SelectTrigger
                                  id="player"
                                  aria-label="Select player"
                                >
                                  <SelectValue placeholder="選手" />
                                </SelectTrigger>
                                <SelectContent>
                                  {selectedTeam === teamAData?.id &&
                                    processedPlayerDataA.map((player) => (
                                      <SelectItem
                                        key={player.id}
                                        value={player.id.toString()}
                                      >
                                        {player.name}
                                      </SelectItem>
                                    ))}
                                  {selectedTeam === teamBData?.id &&
                                    processedPlayerDataB.map((player) => (
                                      <SelectItem
                                        key={player.id}
                                        value={player.id.toString()}
                                      >
                                        {player.name}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                        <div className="size-1/3">
                          <div className="flex items-center">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 shrink-0 rounded-full text-black bg-white"
                              onClick={() => setPoint((prev) => Math.max(0, prev - 1))}
                              disabled={point <= 0}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <div className="flex-1 text-center">
                              <div className={styles.goal}>{point}</div>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 shrink-0  rounded-full text-black bg-white"
                              onClick={() => setPoint((prev) => Math.min(prev + 1, 3))}
                              disabled={point >= 3}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <Button
                        type="submit"
                        variant="outline"
                        className="mt-4 bg-black size-full pt-4 pb-4 text-xl"
                        disabled={submitStatus === "loading"}
                      >
                        {submitStatus === "loading" ? "Submitting..." : "Submit"}
                      </Button>
                    </form>
                  </section>
                </Card>
              </div>
              <section className="flex text-white gap-5 mb-5">
                <div className="size-full">
                  <TotalScore key={refreshTrigger} />
                </div>
              </section>
              <section className="flex text-white gap-5 mb-5">
                <div className="size-1/2">
                  <TeamFoul key={refreshTrigger} />
                </div>
                <div className="size-1/2">
                  <TeamTimeout key={refreshTrigger} />
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
    </>
  );
}