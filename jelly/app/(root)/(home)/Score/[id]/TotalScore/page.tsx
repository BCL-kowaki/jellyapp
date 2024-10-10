"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import styles from "./style.module.scss";
import { Card } from "@/components/ui/card";
import { createClient, RealtimeChannel } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

type TeamScore = {
  teamId: number;
  teamName: string;
  totalScore: number;
};

export default function Component() {
  const params = useParams();
  const gameId = params.id as string;

  const [teamAScore, setTeamAScore] = useState<TeamScore>({
    teamId: 0,
    teamName: "",
    totalScore: 0,
  });
  const [teamBScore, setTeamBScore] = useState<TeamScore>({
    teamId: 0,
    teamName: "",
    totalScore: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quarterScores, setQuarterScores] = useState({
    teamA: { first: 0, second: 0, third: 0, fourth: 0 },
    teamB: { first: 0, second: 0, third: 0, fourth: 0 },
  });

  useEffect(() => {
    let scoreSubscription: RealtimeChannel | null = null;

    const fetchScores = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data: gameData, error: gameError } = await supabase
          .from("Game")
          .select("id, teamAId, teamBId")
          .eq("id", gameId)
          .single();

        if (gameError) throw gameError;
        if (!gameData) throw new Error("No game data found");

        const fetchTeamScore = async (teamId: number): Promise<TeamScore> => {
          const [scoreResult, teamResult] = await Promise.all([
            supabase
              .from("Score")
              .select("point, kinds")
              .eq("teamId", teamId)
              .eq("gameId", gameId)
              .in("kinds", ["point_2P", "point_3P", "point_1P"]),
            supabase.from("Team").select("teamName").eq("id", teamId).single(),
          ]);

          if (scoreResult.error) throw scoreResult.error;
          if (teamResult.error) throw teamResult.error;
          if (!teamResult.data)
            throw new Error(`No team data found for teamId: ${teamId}`);

          const totalScore =
            scoreResult.data?.reduce(
              (sum, score) => sum + (score.point || 0),
              0
            ) || 0;

          return {
            teamId,
            teamName: teamResult.data.teamName,
            totalScore,
          };
        };

        const [teamAScoreData, teamBScoreData] = await Promise.all([
          fetchTeamScore(gameData.teamAId),
          fetchTeamScore(gameData.teamBId),
        ]);

        setTeamAScore(teamAScoreData);
        setTeamBScore(teamBScoreData);

        // Set up real-time subscription
        scoreSubscription = supabase
          .channel("game_scores")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "Score",
              filter: `gameId=eq.${gameId}`,
            },
            async (payload) => {
              const { teamId } = payload.new as { teamId: number };
              if (teamId === gameData.teamAId) {
                const newScore = await fetchTeamScore(gameData.teamAId);
                setTeamAScore(newScore);
              } else if (teamId === gameData.teamBId) {
                const newScore = await fetchTeamScore(gameData.teamBId);
                setTeamBScore(newScore);
              }
            }
          )
          .subscribe();
      } catch (error) {
        console.error("Error in fetchScores:", error);
        setError("Failed to fetch scores. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (gameId) {
      fetchScores();
    }

    // Cleanup function
    return () => {
      if (scoreSubscription) scoreSubscription.unsubscribe();
    };
  }, [gameId]);

  useEffect(() => {
    const fetchQuarterScores = async (teamId: number, isTeamA: boolean) => {
      const quarters = ["first", "second", "third", "fourth"];
      const scores = await Promise.all(
        quarters.map(async (quarter) => {
          const { data, error } = await supabase
            .from("Score")
            .select("point")
            .eq("teamId", teamId)
            .eq("gameId", gameId)
            .in("kinds", ["point_2P", "point_3P", "point_1P"])
            .eq("quarter", quarter);

          if (error) throw error;
          return data.reduce((sum, score) => sum + (score.point || 0), 0);
        })
      );

      setQuarterScores((prev) => ({
        ...prev,
        [isTeamA ? "teamA" : "teamB"]: {
          first: scores[0],
          second: scores[1],
          third: scores[2],
          fourth: scores[3],
        },
      }));
    };

    if (teamAScore.teamId && teamBScore.teamId) {
      fetchQuarterScores(teamAScore.teamId, true);
      fetchQuarterScores(teamBScore.teamId, false);
    }
  }, [teamAScore.teamId, teamBScore.teamId, gameId]);

  if (isLoading) {
    return (
      <Card>
        <div className={styles.scoreCardInner}>
          <h3 className={styles.scoreTitle}>スコア</h3>
          <div className={styles.scoreFlex}>
            <div>Loading...</div>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className={styles.scoreCardInner}>
          <h3 className={styles.scoreTitle}>スコア</h3>
          <div className={styles.scoreFlex}>
            <div>{error}</div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className={styles.scoreCardInner}>
        <h3 className={styles.scoreTitle}>スコア</h3>

        <div className="flex justify-around">
          <div className={styles.scoreFlex}>
            <div>
              <div className={styles.scoreToral}>{teamAScore.totalScore}</div>
              <div className={styles.teamName}>{teamAScore.teamName}</div>
            </div>
            <div className={styles.scoreBorder}>-</div>
            <div>
              <div className={styles.scoreToral}>{teamBScore.totalScore}</div>
              <div className={styles.teamName}>{teamBScore.teamName}</div>
            </div>
          </div>
          <div className={styles.quarterTable}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Team</th>
                  <th>1Q</th>
                  <th>2Q</th>
                  <th>3Q</th>
                  <th>4Q</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{teamAScore.teamName}</td>
                  <td>{quarterScores.teamA.first}</td>
                  <td>{quarterScores.teamA.second}</td>
                  <td>{quarterScores.teamA.third}</td>
                  <td>{quarterScores.teamA.fourth}</td>
                </tr>
                <tr>
                  <td>{teamBScore.teamName}</td>
                  <td>{quarterScores.teamB.first}</td>
                  <td>{quarterScores.teamB.second}</td>
                  <td>{quarterScores.teamB.third}</td>
                  <td>{quarterScores.teamB.fourth}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Card>
  );
}