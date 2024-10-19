'use client'

import React, { useState, useEffect, useCallback, useRef } from "react"
import { format } from "date-fns"
import styles from "./style.module.scss"
import { createClient } from "@supabase/supabase-js"
import { useParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { QRCodeSVG } from 'qrcode.react'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

type GameData = {
  id: number
  teamAId: number
  teamBId: number
  date: string
}

type TeamData = {
  id: number
  teamName: string
}

type Player = {
  id: number
  name: string
  No: number
  position: string
}

const isMobile = () => {
  if (typeof window !== 'undefined') {
    return window.innerWidth <= 768
  }
  return false
}

export default function Controller() {
  const params = useParams()
  const gameId = params.id as string
  const [gameDate, setGameDate] = useState<string>("")
  const [gameData, setGameData] = useState<GameData | null>(null)
  const [teamAData, setTeamAData] = useState<TeamData | null>(null)
  const [teamBData, setTeamBData] = useState<TeamData | null>(null)
  const [processedPlayerDataA, setProcessedPlayerDataA] = useState<Player[]>([])
  const [processedPlayerDataB, setProcessedPlayerDataB] = useState<Player[]>([])
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null)
  const [quarter, setQuarter] = useState("starter")
  const [category, setCategory] = useState("")
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([])
  const [point, setPoint] = useState(1)
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle")

  const [showQRCode, setShowQRCode] = useState(false)
  const [currentUrl, setCurrentUrl] = useState('')
  const [showAllOptions, setShowAllOptions] = useState(true)

  // New state for Results form
  const [winTeam, setWinTeam] = useState<string>("")
  const [loseTeam, setLoseTeam] = useState<string>("")
  const [resultSubmitStatus, setResultSubmitStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle")

  const topRef = useRef<HTMLDivElement>(null)

  const fetchData = useCallback(async () => {
    try {
      const { data: fetchedGameData, error: gameError } = await supabase
        .from("Game")
        .select("id, teamAId, teamBId, date")
        .eq("id", gameId)
        .single()

      if (gameError) throw gameError
      if (!fetchedGameData) throw new Error("No game data found")

      setGameData(fetchedGameData)
      setGameDate(format(new Date(fetchedGameData.date), "yyyy/MM/dd"))

      const { data: teamData, error: teamError } = await supabase
        .from("Team")
        .select("id, teamName")
        .in("id", [fetchedGameData.teamAId, fetchedGameData.teamBId])

      if (teamError) throw teamError

      const teamA =
        teamData?.find((team) => team.id === fetchedGameData.teamAId) || null
      const teamB =
        teamData?.find((team) => team.id === fetchedGameData.teamBId) || null
      setTeamAData(teamA)
      setTeamBData(teamB)

      const fetchPlayerData = async (teamId: number) => {
        const { data: playerData, error: playerError } = await supabase
          .from("Player")
          .select("id, No, name, position")
          .eq("teamId", teamId)

        if (playerError) throw playerError
        return playerData || []
      }

      const playerDataA = await fetchPlayerData(fetchedGameData.teamAId)
      const playerDataB = await fetchPlayerData(fetchedGameData.teamBId)

      setProcessedPlayerDataA(playerDataA)
      setProcessedPlayerDataB(playerDataB)
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }, [gameId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    setCurrentUrl(window.location.href)
    setShowQRCode(!isMobile())
  }, [])

  useEffect(() => {
    if (quarter === "starter") {
      setCategory("starter")
    }
  }, [quarter])

  useEffect(() => {
    if (quarter === "starter") {
      setCategory("starter")
    } else {
      setCategory("")
    }
    setSelectedPlayers([])
    setSelectedTeam(null)
  }, [quarter])

  const handleTeamChange = (teamId: string) => {
    setSelectedTeam(prev => prev === parseInt(teamId) ? null : parseInt(teamId));
    setShowAllOptions(false);
    setSelectedPlayers([])
  }

  const handleCategoryChange = (value: string) => {
    if (quarter === "starter" && value !== "starter") {
      return; // スタメン登録時は他のカテゴリーを選択できないようにする
    }
    setCategory(prev => prev === value ? "" : value);
    setShowAllOptions(false);
    if (value === 'point_2P') {
      setPoint(2);
    } else if (value === 'point_3P') {
      setPoint(3);
    } else {
      setPoint(1);
    }
    setSelectedPlayers([]);
  }

  const handlePlayerSelection = (playerId: string) => {
    setSelectedPlayers(prev => 
      prev.includes(playerId)
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    )
  }

  const resetForm = useCallback(() => {
    setCategory("")
    setSelectedPlayers([])
    setPoint(1)
    setSelectedTeam(null)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !quarter ||
      !selectedTeam ||
      !category ||
      (category !== "timeout" && category !== "starter" && selectedPlayers.length === 0)
    ) {
      alert("全ての必須項目を入力してください。")
      return
    }

    setSubmitStatus("loading")

    try {
      const records = category === "starter" || category === "participation"
      ? selectedPlayers.map(playerId => ({
          gameId: parseInt(gameId),
          playerId: parseInt(playerId),
          teamId: selectedTeam,
          quarter,
          kinds: category,
          point: 1,
        }))
      : [{
          gameId: parseInt(gameId),
          playerId: category !== "timeout" ? parseInt(selectedPlayers[0]) : null,
          teamId: selectedTeam,
          quarter,
          kinds: category,
          point: point,
        }]

      const { error } = await supabase.from("Score").insert(records)

      if (error) throw error

      await new Promise(resolve => setTimeout(resolve, 0))
      setSubmitStatus("success")
      resetForm()
      window.opener?.postMessage("updateScore", "*")

      topRef.current?.scrollIntoView({ behavior: 'smooth' })
    } catch (error) {
      console.error("Error submitting score:", error)
      setSubmitStatus("error")
    } finally {
      setTimeout(() => {
        setSubmitStatus("idle")
      }, 2000)
    }
  }

  const closeQRCode = () => {
    setShowQRCode(false)
  }

  const handleResultSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!winTeam || !loseTeam) {
      alert("勝利チームと敗北チームの両方を選択してください。")
      return
    }

    setResultSubmitStatus("loading")

    try {
      const { error } = await supabase.from("Results").insert({
        gameId: parseInt(gameId),
        winTeam: parseInt(winTeam),
        loseTeam: parseInt(loseTeam)
      })

      if (error) throw error

      setResultSubmitStatus("success")
      // Reset form fields
      setWinTeam("")
      setLoseTeam("")
    } catch (error) {
      console.error("Error submitting result:", error)
      setResultSubmitStatus("error")
    } finally {
      setTimeout(() => {
        setResultSubmitStatus("idle")
      }, 2000)
    }
  }

  return (
    <section className="flex size-full text-white">
      <div ref={topRef}></div>
      {showQRCode && !isMobile() && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-black">このページのQRコード</h2>
              <Button variant="ghost" size="icon" onClick={closeQRCode} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </Button>
            </div>
            <div className="flex justify-center mb-4">
              <QRCodeSVG value={currentUrl} size={200} />
            </div>
            <p className="text-sm text-center text-gray-600">
              このQRコードをスキャンして、他のデバイスでこのページを開きます。
            </p>
          </div>
        </div>
      )}
      <section className="flex size-full flex-col text-white">
        <div className={styles.mainContent}>
          <div className={styles.mainContent__inner}>
            <div className="flex justify-between">
              <h1 className="text-2xl font-bold mb-2">{gameDate}</h1>
              <h2 className="text-sm font-bold mb-2 mt-2">Game ID: {gameId}</h2>
            </div>
            <div>
              {gameData && teamAData && teamBData && (
                <h3 className="text-2xl font-bold mb-6 mt-4">
                  {teamAData.teamName} - {teamBData.teamName}
                </h3>
              )}
            </div>
            <div className="mb-5">
              <Card x-chunk="dashboard-07-chunk-2">
                <section className={styles.mainContent__inner}>
                  <form className="mt-4 mb-2 pt-8 pb-8 text-white" onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <Select value={quarter} onValueChange={setQuarter}>
                        <SelectTrigger id="quarter" className="w-full">
                          <SelectValue placeholder="クォーターを選択" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="starter">スタメン登録</SelectItem>
                          <SelectItem value="first">1クォーター</SelectItem>
                          <SelectItem value="second">2クォーター</SelectItem>
                          <SelectItem value="third">3クォーター</SelectItem>
                          <SelectItem value="fourth">4クォーター</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className={styles.separator}></div>
                    <div className="mb-4">
                      <div className={styles.radioGroup20}>
                        <RadioGroup
                          onValueChange={handleCategoryChange}
                          value={category}
                        >
                          <div className="space-y-2 flex flex-wrap justify-between">
                            {(showAllOptions || !category || category === "point_2P") && (
                              <div className="flex items-center space-x-2 w-1/2">
                                <RadioGroupItem
                                  value="point_2P"
                                  id="category-2P"
                                />
                                <Label htmlFor="category-2P">得点_2P</Label>
                              </div>
                            )}
                            {(showAllOptions || !category || category === "rebound") && (
                              <div className="flex items-center space-x-2 mb-3 w-1/2">
                                <RadioGroupItem
                                  value="rebound"
                                  id="category-rebound"
                                />
                                <Label htmlFor="category-rebound">
                                  リバウンド
                                </Label>
                              </div>
                            )}
                            {(showAllOptions || !category || category === "point_3P") && (
                              <div className="flex items-center space-x-2 mb-3 w-1/2">
                                <RadioGroupItem
                                  value="point_3P"
                                  id="category-3P"
                                />
                                <Label htmlFor="category-3P">得点_3P</Label>
                              </div>
                            )}
                            {(showAllOptions || !category || category === "steal") && (
                              <div className="flex items-center space-x-2 mb-3 w-1/2">
                                <RadioGroupItem
                                  value="steal"
                                  id="category-steal"
                                />
                                <Label htmlFor="category-steal">ステール</Label>
                              </div>
                            )}
                            {(showAllOptions || !category || category === "point_FT") && (
                              <div className="flex items-center space-x-2 mb-3 w-1/2">
                                <RadioGroupItem
                                  value="point_FT"
                                  id="category-FT"
                                
                                />
                                <Label  htmlFor="category-FT">得点_FT</Label>
                              </div>
                            )}
                            {(showAllOptions || !category || category === "block") && (
                              <div className="flex items-center space-x-2 mb-3 w-1/2">
                                <RadioGroupItem
                                  value="block"
                                  id="category-block"
                                />
                                <Label htmlFor="category-block">ブロック</Label>
                              </div>
                            )}
                            {(showAllOptions || !category || category === "urnover") && (
                              <div className="flex items-center space-x-2 mb-3 w-1/2">
                                <RadioGroupItem
                                  value="turnover"
                                  id="category-turnover"
                                />
                                <Label htmlFor="category-turnover">
                                  ターンオーバー
                                </Label>
                              </div>
                            )}
                            {(showAllOptions || !category || category === "assist") && (
                              <div className="flex items-center space-x-2 mb-3 w-1/2">
                                <RadioGroupItem
                                  value="assist"
                                  id="category-assist"
                                />
                                <Label htmlFor="category-assist">アシスト</Label>
                              </div>
                            )}
                            {(showAllOptions || !category || category === "timeout") && (
                              <div className="flex items-center space-x-2 mb-3 w-1/2">
                                <RadioGroupItem
                                  value="timeout"
                                  id="category-timeout"
                                />
                                <Label htmlFor="category-timeout">
                                  タイムアウト
                                </Label>
                              </div>
                            )}
                            {(showAllOptions || !category || category === "foul") && (
                              <div className="flex items-center space-x-2 mb-3 w-1/2">
                                <RadioGroupItem value="foul" id="category-foul" />
                                <Label htmlFor="category-foul">ファール</Label>
                              </div>
                            )}
                            {(showAllOptions || !category || category === "starter") && (
                              <div className="flex items-center space-x-2 mb-3 w-1/2">
                                <RadioGroupItem value="starter" id="category-starter" />
                                <Label htmlFor="category-starter">スタメン出場</Label>
                              </div>
                            )}
                            {(showAllOptions || !category || category === "participation") && (
                              <div className="flex items-center space-x-2 mb-3 w-1/2">
                                <RadioGroupItem value="participation" id="category-participation" />
                                <Label htmlFor="category-participation">交代出場</Label>
                              </div>
                            )}
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                    <div className={styles.separator}></div>
                    <div className="mb-4">
                      <div className="space-y-2">
                        <RadioGroup
                          onValueChange={handleTeamChange}
                          value={selectedTeam?.toString() || ""}
                        >
                          {(showAllOptions || !selectedTeam || selectedTeam === teamAData?.id) && teamAData && (
                            <div className={styles.radioGroup24}>
                              <div className="flex items-center mb-2">
                                <RadioGroupItem
                                  value={teamAData.id.toString()}
                                  id={`team-${teamAData.id}`}
                                  className="mr-3"
                                />
                                <Label htmlFor={`team-${teamAData.id}`}>
                                  {teamAData.teamName}
                                </Label>
                              </div>
                            </div>
                          )}
                          {(showAllOptions || !selectedTeam || selectedTeam === teamBData?.id) && teamBData && (
                            <div className={styles.radioGroup24}>
                              <div className="flex items-center mb-2">
                                <RadioGroupItem
                                  value={teamBData.id.toString()}
                                  id={`team-${teamBData.id}`}
                                  className="mr-3"
                                />
                                <Label htmlFor={`team-${teamBData.id}`}>
                                  {teamBData.teamName}
                                </Label>
                              </div>
                            </div>
                          )}
                        </RadioGroup>
                      </div>
                    </div>
                    {category !== "timeout" && (
                      <div className="mb-4">
                        <div className={styles.radioGroup20}>
                          <ScrollArea className="h-[220px] w-full rounded-md border p-4">
                            {category === "starter" ? (
                              selectedTeam === teamAData?.id
                                ? processedPlayerDataA.map((player) => (
                                    <div key={player.id} className="flex items-center space-x-2 mb-2">
                                      <Checkbox
                                        id={`player-${player.id}`}
                                        checked={selectedPlayers.includes(player.id.toString())}
                                        onCheckedChange={() => handlePlayerSelection(player.id.toString())}
                                      />
                                      <Label htmlFor={`player-${player.id}`}>
                                        #{player.No}｜{player.name}
                                      </Label>
                                    </div>
                                  ))
                                : processedPlayerDataB.map((player) => (
                                    <div key={player.id} className="flex items-center space-x-2 mb-2">
                                      <Checkbox
                                        id={`player-${player.id}`}
                                        checked={selectedPlayers.includes(player.id.toString())}
                                        onCheckedChange={() => handlePlayerSelection(player.id.toString())}
                                      />
                                      <Label htmlFor={`player-${player.id}`}>
                                        #{player.No}｜{player.name}
                                      </Label>
                                    </div>
                                  ))
                            ) : (
                              <RadioGroup onValueChange={(value) => setSelectedPlayers([value])} value={selectedPlayers[0] || ""}>
                                {selectedTeam === teamAData?.id
                                  ? processedPlayerDataA.map((player) => (
                                      <div key={player.id} className="flex items-center space-x-2 mb-2">
                                        <RadioGroupItem value={player.id.toString()} id={`player-${player.id}`} />
                                        <Label htmlFor={`player-${player.id}`}>
                                          #{player.No}｜{player.name}
                                        </Label>
                                      </div>
                                    ))
                                  : processedPlayerDataB.map((player) => (
                                      <div key={player.id} className="flex items-center space-x-2 mb-2">
                                        <RadioGroupItem value={player.id.toString()} id={`player-${player.id}`} />
                                        <Label htmlFor={`player-${player.id}`}>
                                          #{player.No}｜{player.name}
                                        </Label>
                                      </div>
                                    ))}
                              </RadioGroup>
                            )}
                          </ScrollArea>
                        </div>
                      </div>
                    )}
                    <div className={styles.separator}></div>
                    {(!showAllOptions && (category || selectedTeam)) && (
                      <Button
                        type="button"
                        variant="secondary"
                        className="mt-4 mb-4 w-full"
                        onClick={() => {
                          setShowAllOptions(true);
                          setCategory("");
                          setSelectedTeam(null);
                        }}
                      >
                        選択をリセット
                      </Button>
                    )}
                    <Button
                      type="submit"
                      variant="outline"
                      className="mt-4 bg-black size-full pt-4 pb-4 text-xl"
                      disabled={submitStatus === "loading"}
                    >
                      {submitStatus === "loading" ? "送信中..." : "送信"}
                    </Button>
                  </form>
                </section>
              </Card>
            </div>
            <div className="mb-5">
              <Card>
                <section className={styles.mainContent__inner}>
                  <form className="mt-4 mb-2 pt-8 pb-8 text-white" onSubmit={handleResultSubmit}>
                    <h4 className="text-xl font-bold mb-4">試合結果登録</h4>
                    <div className="mb-4">
                      <Label htmlFor="winTeam">勝利チーム</Label>
                      <Select value={winTeam} onValueChange={setWinTeam}>
                        <SelectTrigger id="winTeam" className="w-full mt-1">
                          <SelectValue placeholder="勝利チームを選択" />
                        </SelectTrigger>
                        <SelectContent>
                          {teamAData && (
                            <SelectItem value={teamAData.id.toString()}>{teamAData.teamName}</SelectItem>
                          )}
                          {teamBData && (
                            <SelectItem value={teamBData.id.toString()}>{teamBData.teamName}</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="mb-4">
                      <Label htmlFor="loseTeam">敗北チーム</Label>
                      <Select value={loseTeam} onValueChange={setLoseTeam}>
                        <SelectTrigger id="loseTeam" className="w-full mt-1">
                          <SelectValue placeholder="敗北チームを選択" />
                        </SelectTrigger>
                        <SelectContent>
                          {teamAData && (
                            <SelectItem value={teamAData.id.toString()}>{teamAData.teamName}</SelectItem>
                          )}
                          {teamBData && (
                            <SelectItem value={teamBData.id.toString()}>{teamBData.teamName}</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      type="submit"
                      variant="outline"
                      className="mt-4 bg-black size-full pt-4 pb-4 text-xl"
                      disabled={resultSubmitStatus === "loading"}
                    >
                      {resultSubmitStatus === "loading" ? "送信中..." : "結果を登録"}
                    </Button>
                  </form>
                </section>
              </Card>
            </div>
          </div>
        </div>
      </section>
      {submitStatus === "success" && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg">
          スコア入力完了
        </div>
      )}
      {submitStatus === "error" && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg">
          エラーが発生しました
        </div>
      )}
      {resultSubmitStatus === "success" && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg">
          試合結果登録完了
        </div>
      )}
      {resultSubmitStatus === "error" && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg">
          結果登録中にエラーが発生しました
        </div>
      )}
    </section>
  )
}