"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

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
    label: "teamA",
    color: "hsl(var(--chart-1))",
  },
  teamB: {
    label: "teamB",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig  

// export const description = "A multiple bar chart"
const chartData = [
  { month: "first", teamA: 2, teamB: 5 },
  { month: "second", teamA: 3, teamB: 4 },
  { month: "third", teamA: 5, teamB: 5 },
  { month: "fourth", teamA: 5, teamB: 5 },
]

const TeamFoul = () => {
    return (
<Card>
      <CardHeader>
        <CardTitle>チームファール</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 10)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="teamA" fill="var(--color-teamA)" radius={4} />
            <Bar dataKey="teamB" fill="var(--color-teamB)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
    );
  }
  
  export default TeamFoul