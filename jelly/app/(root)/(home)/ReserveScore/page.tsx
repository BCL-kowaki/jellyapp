'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import { CalendarIcon, CheckIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface Team {
  id: string;
  name: string;
}

export default function ReserveScore() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [teamA, setTeamA] = useState<Team | null>(null)
  const [teamB, setTeamB] = useState<Team | null>(null)
  const [teams, setTeams] = useState<Team[]>([])

  useEffect(() => {
    // Simulating fetching teams from an API
    const fetchTeams = async () => {
      // Replace this with actual API call
      const mockTeams: Team[] = [
        { id: '1', name: 'Team Alpha' },
        { id: '2', name: 'Team Beta' },
        { id: '3', name: 'Team Gamma' },
        { id: '4', name: 'Team Delta' },
      ]
      setTeams(mockTeams)
    }

    fetchTeams()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log({ date, teamA, teamB })
    // Handle form submission
  }

  return (
    <div className="min-h-screen text-white p-8">
      <h1 className="text-3xl font-bold mb-8">新規試合予約</h1>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
        <div className="space-y-2">
          <Label htmlFor="date">日付</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal bg-zinc-700 text-white",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>日付を選択</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 " align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="teamA">チームA</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className={cn(
                  "w-full justify-between bg-zinc-700 text-white",
                  !teamA && "text-muted-foreground"
                )}
              >
                {teamA ? teamA.name : "チームAを選択"}
                <CheckIcon className={cn("ml-2 h-4 w-4 shrink-0 opacity-50", teamA ? "opacity-100" : "opacity-0")} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="チームを検索..." className="h-9" />
                <CommandEmpty>チームが見つかりません。</CommandEmpty>
                <CommandGroup>
                  {teams.map((team) => (
                    <CommandItem
                      key={team.id}
                      onSelect={() => {
                        setTeamA(team)
                      }}
                    >
                      {team.name}
                      <CheckIcon
                        className={cn(
                          "ml-auto h-4 w-4",
                          teamA?.id === team.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="teamB">チームB</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className={cn(
                  "w-full justify-between bg-zinc-700 text-white",
                  !teamB && "text-muted-foreground"
                )}
              >
                {teamB ? teamB.name : "チームBを選択"}
                <CheckIcon className={cn("ml-2 h-4 w-4 shrink-0 opacity-50", teamB ? "opacity-100" : "opacity-0")} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="チームを検索..." className="h-9" />
                <CommandEmpty>チームが見つかりません。</CommandEmpty>
                <CommandGroup>
                  {teams.map((team) => (
                    <CommandItem
                      key={team.id}
                      onSelect={() => {
                        setTeamB(team)
                      }}
                    >
                      {team.name}
                      <CheckIcon
                        className={cn(
                          "ml-auto h-4 w-4",
                          teamB?.id === team.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
          予約
        </Button>
      </form>
    </div>
  )
}