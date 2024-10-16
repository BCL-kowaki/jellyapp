"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

interface Game {
  id: string;
  teamAId: string;
  teamBId: string;
  date: string;
}

interface Team {
  id: string;
  teamName: string;
}

interface Result {
  gameId: string;
  winTeam: string;
  loseTeam: string;
}

interface Score {
  gameId: string;
  teamId: string;
  kinds: string;
  point: number;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function SearchScore() {
  const [searchTerm, setSearchTerm] = useState("");
  const [games, setGames] = useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [scores, setScores] = useState<Score[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gamesResponse, teamsResponse, resultsResponse, scoresResponse] = await Promise.all([
          supabase.from("Game").select("*"),
          supabase.from("Team").select("*"),
          supabase.from("Results").select("*"),
          supabase.from("Score").select("*")
        ]);

        if (gamesResponse.error) throw gamesResponse.error;
        if (teamsResponse.error) throw teamsResponse.error;
        if (resultsResponse.error) throw resultsResponse.error;
        if (scoresResponse.error) throw scoresResponse.error;

        setGames(gamesResponse.data || []);
        setTeams(teamsResponse.data || []);
        setResults(resultsResponse.data || []);
        setScores(scoresResponse.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("データの取得中にエラーが発生しました。");
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const filtered = games.filter(
      (game) =>
        game.id.toString().includes(searchTerm) ||
        game.teamAId
          .toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        game.teamBId
          .toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        teams
          .find((team) => team.id === game.teamAId)
          ?.teamName.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        teams
          .find((team) => team.id === game.teamBId)
          ?.teamName.toLowerCase()
          .includes(searchTerm.toLowerCase())
    );
    setFilteredGames(filtered);
  }, [searchTerm, games, teams]);

  const getResultSymbol = (gameId: string, teamId: string) => {
    const result = results.find(r => r.gameId === gameId);
    if (!result) return "";
    if (result.winTeam === teamId) return "⚪︎";
    if (result.loseTeam === teamId) return "⚫︎";
    return "";
  };

  const calculateTotalScore = (gameId: string, teamId: string) => {
    return scores
      .filter(s => s.gameId === gameId && s.teamId === teamId && ['point_2P', 'point_3P', 'point_1P'].includes(s.kinds))
      .reduce((total, score) => total + score.point, 0);
  };

  return (
    <div className="min-h-screen text-white p-8 contentInner">
      <h1 className="text-3xl font-bold mb-8">試合検索</h1>
      <div className="relative mb-6">
        <Input
          type="text"
          placeholder="試合ID、チーム名で検索してください"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-white pl-10 pr-4 py-2 rounded-lg"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="space-y-4">
        {filteredGames.map((game) => {
          const teamA = teams.find((team) => team.id === game.teamAId);
          const teamB = teams.find((team) => team.id === game.teamBId);
          const scoreA = calculateTotalScore(game.id, game.teamAId);
          const scoreB = calculateTotalScore(game.id, game.teamBId);

          return (
            <Card key={game.id} className="bg-gray-700">
              <Link href={`/Score/${game.id}`}>
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <p className="text-gray-300">GameId : {game.id}</p>
                    <h2 className="text-3xl text-white font-semibold mt-1">
                      <span className="text-3xl">{teamA?.teamName}</span> {getResultSymbol(game.id, game.teamAId)} {scoreA} - {scoreB} {getResultSymbol(game.id, game.teamBId)} <span className="text-3xl">{teamB?.teamName}</span>
                    </h2>
                  </div>
                  <p className="text-xl text-gray-300 mt-9">
                    {new Date(game.date).toLocaleDateString("ja-JP", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })}
                  </p>
                </CardContent>
              </Link>
            </Card>
          );
        })}
      </div>
    </div>
  );
}