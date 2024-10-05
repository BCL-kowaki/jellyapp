'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
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
import { CheckIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface Team {
  id: string;
  name: string;
}

export default function AddNewScore() {
  const [teamA, setTeamA] = useState<Team | null>(null)
  const [teamB, setTeamB] = useState<Team | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const router = useRouter()

  useEffect(() => {
    // Simulating fetching teams from an API
    const fetchTeams = async () => {
      // Replace this with actual API call
      const mockTeams: Team[] = [
        { id: '1', name: 'Team Alpha' },
        { id: '2', name: 'Team Beta' },
        { id: '3', name: 'Team Gamma' },
        { id: '4', name: 'Team Delta' },
        { id: '5', name: 'Team Epsilon' },
      ]
      setTeams(mockTeams)
    }

    fetchTeams()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!teamA || !teamB) {
      alert('両チームを選択してください。')
      return
    }
    
    try {
      // Here you would typically make an API call to register the match
      // For demonstration, we're just simulating an API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('Match registered:', { teamA, teamB })
      
      // Redirect to the new score page
      router.push('/newscore')
    } catch (error) {
      console.error('Error registering match:', error)
      alert('試合の登録中にエラーが発生しました。もう一度お試しください。')
    }
  }

  return (
    <div className="min-h-screen text-white p-8">
      <h1 className="text-3xl font-bold mb-8">新規試合登録</h1>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
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
            <PopoverContent className="w-full p-0 ">
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
                          "ml-auto h-4 w-4 ",
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
          登録
        </Button>
      </form>
    </div>
  )
}