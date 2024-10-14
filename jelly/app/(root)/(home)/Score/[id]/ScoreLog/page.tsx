"use client"

import React, { useEffect, useState } from 'react'
import { useParams } from "next/navigation"
import { createClient } from '@supabase/supabase-js'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, ClipboardList } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing environment variables for Supabase')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

type ScoreLog = {
  id: number
  gameId: number
  teamId: number
  playerId: number
  kinds: string
  point: number
  createdAt: string
  quarter: string
}

type Player = {
  id: number
  name: string
}

type Team = {
  id: number
  teamName: string
}

const ScoreLog = () => {
  const [logs, setLogs] = useState<ScoreLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [teamNames, setTeamNames] = useState<{ [key: number]: string }>({})
  const [playerNames, setPlayerNames] = useState<{ [key: number]: string }>({})
  const [editingLog, setEditingLog] = useState<ScoreLog | null>(null)
  const params = useParams()
  const id = params?.id as string | undefined

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError('ID is missing')
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)
      try {
        // Fetch game data and score logs
        const { data: gameData, error: gameError } = await supabase
          .from("Game")
          .select(`
            id, 
            teamAId, 
            teamBId,
            Score (*)
          `)
          .eq("id", id)
          .single()

        if (gameError) throw gameError
        if (!gameData) throw new Error('Game data not found')

        const typedScoreData = gameData.Score as ScoreLog[]
        setLogs(typedScoreData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))

        // Fetch team data
        const { data: teamData, error: teamError } = await supabase
          .from("Team")
          .select("id, teamName")
          .in("id", [gameData.teamAId, gameData.teamBId])

        if (teamError) throw teamError

        const teamNamesMap = (teamData as Team[]).reduce((acc, team) => {
          if (team.id !== undefined && team.teamName) {
            acc[team.id] = team.teamName
          }
          return acc
        }, {} as { [key: number]: string })
        setTeamNames(teamNamesMap)

        // Fetch player data
        if (typedScoreData && typedScoreData.length > 0) {
          const playerIds = Array.from(new Set(typedScoreData.map(score => score.playerId).filter((id): id is number => id !== null && id !== undefined)))
          if (playerIds.length > 0) {
            const { data: playerData, error: playerError } = await supabase
              .from("Player")
              .select("id, name")
              .in("id", playerIds)

            if (playerError) throw playerError

            if (playerData) {
              const playerNamesMap = (playerData as Player[]).reduce((acc, player) => {
                if (player.id !== undefined && player.name) {
                  acc[player.id] = player.name
                }
                return acc
              }, {} as { [key: number]: string })
              setPlayerNames(playerNamesMap)
            }
          }
        }

      } catch (error) {
        console.error('Error fetching data:', error)
        setError(`データの取得中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id])

  const formatKinds = (kind: string) => {
    const kindMap: { [key: string]: string } = {
      'point_2P': '2P',
      'rebound': 'リバウンド',
      'point_3P': '3P',
      'assist': 'アシスト',
      'point_1P': '1P｜FT',
      'turnover': 'ターンオーバー',
      'timeout': 'タイムアウト',
      'foul': 'ファール',
      'starter': 'スタメン',
      'participation': '交代'
    }
    return kindMap[kind] || kind
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}/${month}/${day} ${hours}:${minutes}`
  }

  const formatQuarter = (quarter: string) => {
    const quarterMap: { [key: string]: string } = {
      'starter': '登録',
      'first': '1Q',
      'second': '2Q',
      'third': '3Q',
      'fourth': '4Q'
    }
    return quarterMap[quarter] || quarter
  }

  const handleEdit = (log: ScoreLog) => {
    setEditingLog(log)
  }

  const handleSaveEdit = async () => {
    if (!editingLog) return

    try {
      const { error } = await supabase
        .from('Score')
        .update({
          teamId: editingLog.teamId,
          playerId: editingLog.playerId,
          kinds: editingLog.kinds,
          point: editingLog.point,
          quarter: editingLog.quarter
        })
        .eq('id', editingLog.id)

      if (error) throw error

      setLogs(logs.map(log => log.id === editingLog.id ? editingLog : log).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
      setEditingLog(null)
    } catch (error) {
      console.error('Error updating log:', error)
      setError(`ログの更新中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const handleDelete = async (logId: number) => {
    try {
      const { error } = await supabase
        .from('Score')
        .delete()
        .eq('id', logId)

      if (error) throw error

      setLogs(logs.filter(log => log.id !== logId))
    } catch (error) {
      console.error('Error deleting log:', error)
      setError(`ログの削除中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  if (isLoading) return <div>データを読み込んでいます...</div>
  if (error) return <div>エラー: {error}</div>
  if (logs.length === 0) return <div>データがありません。</div>

  return (
    <div>
      <div className="flex items-center mb-4">
        <ClipboardList className="h-6 w-6 text-primary mr-2" />
        <h2 className="text-2xl font-bold">スコアログ</h2>
      </div>
      <Table>
        <TableHeader className='text-center'>
          <TableRow>
            <TableHead>時間</TableHead>
            <TableHead>Q</TableHead>
            <TableHead>チーム</TableHead>
            <TableHead>プレイヤー</TableHead>
            <TableHead>種類</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className='text-center'>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>{formatDate(log.createdAt)}</TableCell>
              <TableCell>{formatQuarter(log.quarter)}</TableCell>
              <TableCell>{teamNames[log.teamId] || log.teamId}</TableCell>
              <TableCell>{playerNames[log.playerId] || log.playerId}</TableCell>
              <TableCell>{formatKinds(log.kinds)}</TableCell>
              <TableCell>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(log)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>スコアログの編集</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="quarter" className="text-right">
                          クォーター
                        </Label>
                        <select
                          id="quarter"
                          value={editingLog?.quarter || ''}
                          onChange={(e) => setEditingLog(prev => prev ? {...prev, quarter: e.target.value} : null)}
                          className="col-span-3"
                        >
                          <option value="first">1Q</option>
                          <option value="second">2Q</option>
                          <option value="third">3Q</option>
                          <option value="fourth">4Q</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="team" className="text-right">
                          チーム
                        </Label>
                        <Input
                          id="team"
                          value={teamNames[editingLog?.teamId || 0] || ''}
                          onChange={(e) => {
                            const teamId = Object.entries(teamNames).find(([, name]) => name === e.target.value)?.[0]
                            const newTeamId = teamId ? parseInt(teamId) : undefined
                            setEditingLog(prev => prev && newTeamId ? {...prev, teamId: newTeamId} : prev)
                          }}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="player" className="text-right">
                          プレイヤー
                        </Label>
                        <Input
                          id="player"
                          value={playerNames[editingLog?.playerId || 0] || ''}
                          onChange={(e) => {
                            const playerId = Object.entries(playerNames).find(([, name]) => name === e.target.value)?.[0]
                            const newPlayerId = playerId ? parseInt(playerId) : undefined
                            setEditingLog(prev => prev && newPlayerId ? {...prev, playerId: newPlayerId} : prev)
                          }}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="kinds" className="text-right">
                          種類
                        </Label>
                        <Input
                          id="kinds"
                          value={editingLog?.kinds || ''}
                          onChange={(e) => setEditingLog(prev => prev ? {...prev, kinds: e.target.value} : null)}
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <Button onClick={handleSaveEdit}>保存</Button>
                  </DialogContent>
                </Dialog>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(log.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default ScoreLog