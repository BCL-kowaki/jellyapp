import React from 'react'
import { format } from 'date-fns'
import styles from "./style.module.scss"
import { createClient, PostgrestError } from '@supabase/supabase-js'

// Supabaseクライアントの初期化
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 型定義
type GameData = {
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

const Score = async () => {
  const today = format(new Date(), 'yyyy/MM/dd')

  // GameテーブルからteamAIdとteamBIdを取得
  const { data: gameData, error: gameError } = await supabase
    .from('Game')
    .select('teamAId, teamBId')
    .limit(1) as { data: GameData[] | null, error: Error | null };

  if (gameError) {
    console.error('Error fetching game data:', gameError)
    return <div>Error loading game data: {gameError.message}</div>
  }

  if (!gameData || gameData.length === 0) {
    return <div>No game data found</div>
  }

  const game = gameData[0]

  // TeamテーブルからteamA名とteamB名を取得
  const { data: teamData, error: teamError } = await supabase
    .from('Team')
    .select('id, teamName')
    .in('id', [game.teamAId, game.teamBId]) as { data: TeamData[] | null, error: Error | null };

  if (teamError) {
    console.error('Error fetching team data:', teamError)
    return <div>Error loading team data</div>
  }

  const teamAData = teamData?.find(team => team.id === game.teamAId)
  const teamBData = teamData?.find(team => team.id === game.teamBId)

  // Playerテーブルからプレイヤーデータを取得
  console.log('Fetching players for teamId:', game.teamAId);
  const { data: playerDataA, error: playerErrorA } = await supabase
    .from('Player')
    .select('id, No, name, position')
    .eq('teamId', game.teamAId) as { data: Player[] | null, error: PostgrestError | null };

    console.log('Fetching players for teamId:', game.teamBId);
    const { data: playerDataB, error: playerErrorB } = await supabase
      .from('Player')
      .select('id, No, name, position')
      .eq('teamId', game.teamBId) as { data: Player[] | null, error: PostgrestError | null };

  if (playerErrorA || playerErrorB) {
    console.error('Error fetching player data:', playerErrorA, playerErrorB);
    return <div>Error loading player data: {playerErrorA?.message || playerErrorB?.message}</div>;
  }

  // Scoreテーブルからスコアデータを取得
  const { data: scoreData, error: scoreError } = await supabase
  .from('Score')
  .select('playerId, kinds, point')
  .in('playerId', [...(playerDataA?.map(p => p.id) || []), ...(playerDataB?.map(p => p.id) || [])]) as { data: ScoreData[] | null, error: PostgrestError | null };

    
  if (scoreError) {
    console.error('Error fetching score data:', scoreError)
    return <div>Error loading score data</div>
  }

  // プレイヤーデータとスコアデータを結合
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

  const processedPlayerDataA = processPlayerData(playerDataA || [])
  const processedPlayerDataB = processPlayerData(playerDataB || [])

  const renderTeamTable = (teamName: string, teamId: number, playerData: Player[]) => (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">{teamName}｜TeamID: {teamId}</h2>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2">PlayerId</th>
            <th className="border border-gray-300 px-4 py-2">名前</th>
            <th className="border border-gray-300 px-4 py-2">背番号</th>
            <th className="border border-gray-300 px-4 py-2">ポジション</th>
            <th className="border border-gray-300 px-4 py-2">ポイント</th>
            <th className="border border-gray-300 px-4 py-2">ファール</th>
          </tr>
        </thead>
        <tbody>
          {playerData.map(player => (
            <tr key={player.id}>
              <td className="border border-gray-300 px-4 py-2">{player.id}</td>
              <td className="border border-gray-300 px-4 py-2">{player.name}</td>
              <td className="border border-gray-300 px-4 py-2">{player.No}</td>
              <td className="border border-gray-300 px-4 py-2">{player.position}</td>
              <td className="border border-gray-300 px-4 py-2">{player.points}</td>
              <td className="border border-gray-300 px-4 py-2">{player.fouls}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <section className="flex flex-col gap-10 p-8 bg-gray-800 text-white min-h-screen">
      <div className={styles.mainContent}>
        <div className={styles.mainContent__inner}>
          <h1 className="text-4xl font-bold mb-8">{today}</h1>
          {teamAData && renderTeamTable(teamAData.teamName, game.teamAId, processedPlayerDataA)}
          {teamBData && renderTeamTable(teamBData.teamName, game.teamBId, processedPlayerDataB)}
        </div>
      </div>
    </section>
  )
}

export default Score