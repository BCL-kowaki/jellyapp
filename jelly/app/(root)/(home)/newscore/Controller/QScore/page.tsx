"use client"

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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
const chartData = [
  { team: "January", first: 17, second: 12, third: 24, fourth: 11 },
  { team: "February", first: 13, second: 14, third: 11, fourth: 16 },
]
const chartConfig = {
  first: {
    label: "first",
    color: "hsl(var(--chart-1))",
  },
  second: {
    label: "second",
    color: "hsl(var(--chart-2))",
  },
  third: {
    label: "third",
    color: "hsl(var(--chart-3))",
  },
  fourth: {
    label: "fourth",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig

const QScore = () => {
  return (
    <Card>
    <CardHeader>
      <CardTitle>Score</CardTitle>
    </CardHeader>
    <CardContent>
      <ChartContainer config={chartConfig}>
        <BarChart accessibilityLayer data={chartData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="team"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => value.slice(0, 3)}
          />
          <ChartTooltip content={<ChartTooltipContent hideLabel />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar
            dataKey="first"
            stackId="a"
            fill="var(--color-first)"
            radius={[0, 0, 4, 4]}
          />
          <Bar
            dataKey="second"
            stackId="a"
            fill="var(--color-second)"
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="third"
            stackId="a"
            fill="var(--color-third)"
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="fourth"
            stackId="a"
            fill="var(--color-fourth)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ChartContainer>
    </CardContent>
  </Card>
  )
}

export default QScore