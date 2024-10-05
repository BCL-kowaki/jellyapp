"use client"

import React, { useEffect, useState } from 'react'
import axios from 'axios'

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Tabs,
} from "@/components/ui/tabs"

interface Team {
    id: string;
    teamName: string;
}

interface Player {
    id: string;
    name: string;
    teamId: string;
    No: number;
    GS: string;
    point: number;
    foul: number;
}

const TeamMember = () => {
    const [team, setTeam] = useState<Team | null>(null)
    const [players, setPlayers] = useState<Player[]>([])

    useEffect(() => {
        // Fetch team from API
        const fetchTeam = async () => {
            try {
                const response = await axios.get('http://localhost:8888/api/auth/team') // Replace with your actual API endpoint
                setTeam(response.data)
            } catch (error) {
                console.error(error)
            }
        }

        // Fetch players from API
        const fetchPlayers = async () => {
            try {
                const response = await axios.get('http://localhost:8888/api/auth/player') // Replace with your actual API endpoint
                setPlayers(response.data)
            } catch (error) {
                console.error(error)
            }
        }

        fetchTeam()
        fetchPlayers()
    }, [])

    return (
        <Tabs defaultValue="week">
            <Card x-chunk="dashboard-05-chunk-3">
                <CardHeader className="px-7">
                    <CardTitle>{team?.teamName}</CardTitle>
                    <CardDescription>
                        Team ID {team?.id}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader className="text-lg">
                            <TableRow>
                                <TableHead>名前</TableHead>
                                <TableHead className="hidden sm:table-cell">
                                    No
                                </TableHead>
                                <TableHead className="hidden sm:table-cell">
                                    GS
                                </TableHead>
                                <TableHead className="hidden md:table-cell">
                                    得点
                                </TableHead>
                                <TableHead className="text-right">
                                    ファール
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="text-white text-lg">
                            {players.filter(player => player.teamId === team?.id).map(player => (
                                <TableRow key={player.id}>
                                    <TableCell>
                                        <div className="font-medium">{player.name}</div>
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell">
                                        {player.No}
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell">
                                        {player.GS}
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        {player.point}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {player.foul}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </Tabs>
    );
}
export default TeamMember