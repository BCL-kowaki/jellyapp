"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createClient } from '@supabase/supabase-js'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig = {
  teamA: {
    label: "チームA",
    color: "hsl(var(--chart-1))",
  },
  teamB: {
    label: "チームB",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
)

const TeamFoul = () => {
  const [chartData, setChartData] = useState<{ quarter: string; teamA: number; teamB: number; }[]>([]);
  const [teamNames, setTeamNames] = useState({ teamA: "", teamB: "" })
  const { id } = useParams()

  useEffect(() => {
    const fetchData = async () => {
      // Gameテーブルからデータを取得
      const { data: gameData, error: gameError } = await supabase
        .from("Game")
        .select("id, teamAId, teamBId")
        .eq("id", id)
        .single()

      if (gameError) {
        console.error("Error fetching game data:", gameError)
        return
      }

      // Teamテーブルからチーム名を取得
      const { data: teamData, error: teamError } = await supabase
        .from("Team")
        .select("id, teamName")
        .in("id", [gameData.teamAId, gameData.teamBId])

      if (teamError) {
        console.error("Error fetching team data:", teamError)
        return
      }

      const teamNames = {
        teamA: teamData.find(team => team.id === gameData.teamAId)?.teamName || "チームA",
        teamB: teamData.find(team => team.id === gameData.teamBId)?.teamName || "チームB",
      }
      setTeamNames(teamNames)

      // Scoreテーブルからファールデータを取得
      const { data: scoreData, error: scoreError } = await supabase
        .from("Score")
        .select("quarter, kinds, point, teamId")
        .eq("gameId", id)
        .eq("kinds", "foul")

      if (scoreError) {
        console.error("Error fetching score data:", scoreError)
        return
      }

      // チャートデータの作成
      const quarters = ["first", "second", "third", "fourth"]
      const chartData = quarters.map(quarter => {
        const quarterData = scoreData.filter(score => score.quarter === quarter)
        return {
          quarter,
          teamA: Math.min(quarterData.filter(score => score.teamId === gameData.teamAId).reduce((sum, score) => sum + score.point, 0), 5),
          teamB: Math.min(quarterData.filter(score => score.teamId === gameData.teamBId).reduce((sum, score) => sum + score.point, 0), 5),
        }
      })

      setChartData(chartData)
    }

    fetchData()
  }, [id])

  return (
    <Card>
      <CardHeader>
        <CardTitle>チームファール</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
          <CartesianGrid vertical={false} horizontal={true} />
            <XAxis
              dataKey="quarter"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value: "first" | "second" | "third" | "fourth") => {
                const quarterMap = { first: "第1Q", second: "第2Q", third: "第3Q", fourth: "第4Q" }
                return quarterMap[value] || value
              }}
            />
            <YAxis              
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              ticks={[0, 1, 2, 3, 4, 5]}
              domain={[0, 5]} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="teamA" name={teamNames.teamA} fill="var(--color-teamA)" radius={4} />
            <Bar dataKey="teamB" name={teamNames.teamB} fill="var(--color-teamB)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default TeamFoul