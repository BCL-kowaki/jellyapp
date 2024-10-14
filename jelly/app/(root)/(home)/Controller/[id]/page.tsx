"use client";

import React, { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import styles from "./style.module.scss";
import { createClient } from "@supabase/supabase-js";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Supabaseクライアントの初期化
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 型定義
type GameData = {
  id: number;
  teamAId: number;
  teamBId: number;
  date: string;
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
};

export default function Controller() {
  const params = useParams();
  const gameId = params.id as string;
  const [gameDate, setGameDate] = useState<string>("");
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [teamAData, setTeamAData] = useState<TeamData | null>(null);
  const [teamBData, setTeamBData] = useState<TeamData | null>(null);
  const [processedPlayerDataA, setProcessedPlayerDataA] = useState<Player[]>(
    []
  );
  const [processedPlayerDataB, setProcessedPlayerDataB] = useState<Player[]>(
    []
  );
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [quarter, setQuarter] = useState("");
  const [category, setCategory] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [point, setPoint] = useState(1);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const fetchData = useCallback(async () => {
    try {
      // 指定されたゲームIDのデータを取得
      const { data: fetchedGameData, error: gameError } = await supabase
        .from("Game")
        .select("id, teamAId, teamBId, date")
        .eq("id", gameId)
        .single();

      if (gameError) throw gameError;
      if (!fetchedGameData) throw new Error("No game data found");

      setGameData(fetchedGameData);
      setGameDate(format(new Date(fetchedGameData.date), "yyyy/MM/dd"));

      // チームデータの取得
      const { data: teamData, error: teamError } = await supabase
        .from("Team")
        .select("id, teamName")
        .in("id", [fetchedGameData.teamAId, fetchedGameData.teamBId]);

      if (teamError) throw teamError;

      const teamA =
        teamData?.find((team) => team.id === fetchedGameData.teamAId) || null;
      const teamB =
        teamData?.find((team) => team.id === fetchedGameData.teamBId) || null;
      setTeamAData(teamA);
      setTeamBData(teamB);

      // プレイヤーデータの取得
      const fetchPlayerData = async (teamId: number) => {
        const { data: playerData, error: playerError } = await supabase
          .from("Player")
          .select("id, No, name, position")
          .eq("teamId", teamId);

        if (playerError) throw playerError;
        return playerData || [];
      };

      const playerDataA = await fetchPlayerData(fetchedGameData.teamAId);
      const playerDataB = await fetchPlayerData(fetchedGameData.teamBId);

      setProcessedPlayerDataA(playerDataA);
      setProcessedPlayerDataB(playerDataB);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [gameId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTeamChange = (teamId: string) => {
    setSelectedTeam(parseInt(teamId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !quarter ||
      !selectedTeam ||
      !category ||
      (category !== "timeout" && !playerId)
    ) {
      alert("全ての必須項目を入力してください。");
      return;
    }

    setSubmitStatus("loading");

    try {
      const { error } = await supabase.from("Score").insert([
        {
          gameId: parseInt(gameId),
          playerId: category !== "timeout" ? parseInt(playerId) : null,
          teamId: selectedTeam,
          quarter,
          kinds: category,
          point: point,
        },
      ]);

      if (error) throw error;

      setSubmitStatus("success");
      // フォームのリセット（クォーターとチームを除く）
      setCategory("");
      setPlayerId("");
      setPoint(1);

      // 親ウィンドウに更新を通知
      window.opener?.postMessage("updateScore", "*");
    } catch (error) {
      console.error("Error submitting score:", error);
      setSubmitStatus("error");
    } finally {
      setTimeout(() => setSubmitStatus("idle"), 2000);
    }
  };

  return (
    <section className="flex size-full gap-10 text-white">
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
                  {" "}
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
                          <SelectItem value="first">1クォーター</SelectItem>
                          <SelectItem value="second">2クォーター</SelectItem>
                          <SelectItem value="third">3クォーター</SelectItem>
                          <SelectItem value="fourth">4クォーター</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className={styles.separator}></div>
                    <div className="mb-4">
                      <div className="space-y-2">
                        <RadioGroup
                          onValueChange={handleTeamChange}
                          value={selectedTeam?.toString()}
                        >
                          {teamAData && (
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
                          {teamBData && (
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
                    <div className="mb-4">
                      <div className={styles.radioGroup20}>
                        <ScrollArea className="h-[220px] w-full rounded-md border p-4">
                          <RadioGroup
                            onValueChange={setPlayerId}
                            value={playerId}
                            disabled={category === "timeout"}
                          >
                            {selectedTeam === teamAData?.id &&
                              processedPlayerDataA.map((player) => (
                                <div
                                  key={player.id}
                                  className="flex items-center space-x-2 mb-2"
                                >
                                  <RadioGroupItem
                                    value={player.id.toString()}
                                    id={`player-${player.id}`}
                                    disabled={category === "timeout"}
                                  />
                                  <Label htmlFor={`player-${player.id}`}>
                                    #{player.No}｜{player.name}
                                  </Label>
                                </div>
                              ))}
                            {selectedTeam === teamBData?.id &&
                              processedPlayerDataB.map((player) => (
                                <div
                                  key={player.id}
                                  className="flex items-center space-x-2 mb-3"
                                >
                                  <RadioGroupItem
                                    value={player.id.toString()}
                                    id={`player-${player.id}`}
                                    disabled={category === "timeout"}
                                  />
                                  <Label htmlFor={`player-${player.id}`}>
                                    #{player.No}｜{player.name}
                                  </Label>
                                </div>
                              ))}
                          </RadioGroup>
                        </ScrollArea>
                      </div>
                    </div>
                    <div className={styles.separator}></div>

                    <div className="mb-4">
                      <div className={styles.radioGroup20}>
                        <RadioGroup
                          onValueChange={setCategory}
                          value={category}
                        >
                          <div className="space-y-2 flex flex-wrap justify-between">
                            <div className="flex items-center space-x-2 w-1/2">
                              <RadioGroupItem
                                value="point_2P"
                                id="category-2P"
                              />
                              <Label htmlFor="category-2P">得点_2P</Label>
                            </div>
                            <div className="flex items-center space-x-2 mb-3 w-1/2">
                              <RadioGroupItem
                                value="rebound"
                                id="category-rebound"
                              />
                              <Label htmlFor="category-rebound">
                                リバウンド
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2 mb-3 w-1/2">
                              <RadioGroupItem
                                value="point_3P"
                                id="category-3P"
                              />
                              <Label htmlFor="category-3P">得点_3P</Label>
                            </div>
                            <div className="flex items-center space-x-2 mb-3 w-1/2">
                              <RadioGroupItem
                                value="assist"
                                id="category-assist"
                              />
                              <Label htmlFor="category-assist">アシスト</Label>
                            </div>
                            <div className="flex items-center space-x-2 mb-3 w-1/2">
                              <RadioGroupItem
                                value="point_FT"
                                id="category-FT"
                              />
                              <Label htmlFor="category-FT">得点_FT</Label>
                            </div>
                            <div className="flex items-center space-x-2 mb-3 w-1/2">
                              <RadioGroupItem
                                value="turnover"
                                id="category-turnover"
                              />
                              <Label htmlFor="category-turnover">
                                ターンオーバー
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2 mb-3 w-1/2">
                              <RadioGroupItem
                                value="timeout"
                                id="category-timeout"
                              />
                              <Label htmlFor="category-timeout">
                                タイムアウト
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2 mb-3 w-1/2">
                              <RadioGroupItem value="foul" id="category-foul" />
                              <Label htmlFor="category-foul">ファール</Label>
                            </div>
                            <div className="flex items-center space-x-2 mb-3 w-1/2">
                              <RadioGroupItem value="starter" id="category-starter" />
                              <Label htmlFor="category-starter">スタメン出場</Label>
                            </div>
                            <div className="flex items-center space-x-2 mb-3 w-1/2">
                              <RadioGroupItem value="participation" id="category-participation" />
                              <Label htmlFor="category-participation">交代出場</Label>
                            </div>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                    <div className={styles.separator}></div>
                    <div>
                      <div className="flex items-center justify-around">
                        <div className="size-1/3">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 shrink-0 rounded-full text-black bg-white"
                            onClick={() =>
                              setPoint((prev) => Math.max(0, prev - 1))
                            }
                            disabled={point <= 0}
                          >
                            <Minus className="h-6 w-6" />
                          </Button>
                        </div>
                        <div className="size-1/3 flex-1 text-center">
                          <div className={styles.goal}>{point}</div>
                        </div>
                        <div className="size-1/3 text-right">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 shrink-0 rounded-full text-black bg-white"
                            onClick={() =>
                              setPoint((prev) => Math.min(prev + 1, 3))
                            }
                            disabled={point >= 3}
                          >
                            <Plus className="h-6 w-6" />
                          </Button>
                        </div>
                      </div>
                    </div>
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
          </div>
        </div>
      </section>
    </section>
  );
}
