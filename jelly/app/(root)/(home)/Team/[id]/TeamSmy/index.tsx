'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import styles from "./style.module.scss"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase環境変数が設定されていません')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface TeamBasicData {
  id: number;
  image: string;
  teamName: string;
  category: string;
  prefecture: string;
  area: string;
}

interface TeamData extends TeamBasicData {
  wins: number;
  losses: number;
  gamesPlayed: number;
  pointsScored: number;
  pointsConceded: number;
  assists: number;
  rebounds: number;
  turnovers: number;
}

interface ScoreItem {
  kinds: string;
  point: number;
}

interface Result {
  winTeam: number;
  loseTeam: number;
}

async function fetchPointsConceded(teamId: string): Promise<number> {
  try {
    const { data: games, error: gamesError } = await supabase
      .from('Game')
      .select('id, teamAId, teamBId')
      .or(`teamAId.eq.${teamId},teamBId.eq.${teamId}`);

    if (gamesError) throw new Error(`ゲームデータの取得に失敗しました: ${gamesError.message}`);

    if (!games || games.length === 0) return 0;

    const { data, error } = await supabase
      .from('Score')
      .select('point')
      .in('gameId', games.map(game => game.id))
      .not('teamId', 'eq', teamId)
      .in('kinds', ['point_2P', 'point_3P', 'point_1P']);

    if (error) throw new Error(`失点の取得に失敗しました: ${error.message}`);

    return data ? data.reduce((sum, score) => sum + score.point, 0) : 0;
  } catch (error) {
    console.error('失点の取得中にエラーが発生しました:', error);
    throw error;
  }
}

async function fetchTeamData(teamId: string): Promise<TeamData | null> {
  try {
    const [
      { data: teamBasicData, error: teamError },
      { data: scoreSumData, error: scoreSumError },
      { data: resultsData, error: resultsError },
      { data: gamesData, error: gamesError }
    ] = await Promise.all([
      supabase
        .from('Team')
        .select('id, image, teamName, category, prefecture, area')
        .eq('id', teamId)
        .single(),
      supabase
        .from('Score')
        .select('kinds, point')
        .eq('teamId', teamId)
        .in('kinds', ['point_2P', 'point_3P', 'point_1P', 'assist', 'rebound', 'turnover']),
      supabase
        .from('Results')
        .select('winTeam, loseTeam')
        .or(`winTeam.eq.${teamId},loseTeam.eq.${teamId}`),
      supabase
        .from('Game')
        .select('id')
        .or(`teamAId.eq.${teamId},teamBId.eq.${teamId}`)
    ]);

    if (teamError) throw new Error(`チーム基本データの取得に失敗しました: ${teamError.message}`);
    if (scoreSumError) throw new Error(`スコアの合計データの取得に失敗しました: ${scoreSumError.message}`);
    if (resultsError) throw new Error(`試合結果データの取得に失敗しました: ${resultsError.message}`);
    if (gamesError) throw new Error(`ゲームデータの取得に失敗しました: ${gamesError.message}`);

    if (!teamBasicData) throw new Error('チーム基本データが見つかりません');
    if (!scoreSumData) throw new Error('スコアデータが見つかりません');
    if (!resultsData) throw new Error('試合結果データが見つかりません');
    if (!gamesData) throw new Error('ゲームデータが見つかりません');

    const gamesPlayed = gamesData.length;
    const pointsConceded = await fetchPointsConceded(teamId);

    const scoreSummary = (scoreSumData as ScoreItem[]).reduce((acc, item) => {
      if (!acc[item.kinds]) {
        acc[item.kinds] = 0;
      }
      acc[item.kinds] += item.point;
      return acc;
    }, {} as Record<string, number>);

    const pointsScored = ['point_2P', 'point_3P', 'point_1P'].reduce((sum, kind) => sum + (scoreSummary[kind] || 0), 0);
    const assists = scoreSummary['assist'] || 0;
    const rebounds = scoreSummary['rebound'] || 0;
    const turnovers = scoreSummary['turnover'] || 0;

    const wins = (resultsData as Result[]).filter(result => result.winTeam === Number(teamId)).length;
    const losses = (resultsData as Result[]).filter(result => result.loseTeam === Number(teamId)).length;

    const fullTeamData: TeamData = {
      ...teamBasicData,
      wins,
      losses,
      gamesPlayed,
      pointsScored,
      pointsConceded,
      assists,
      rebounds,
      turnovers
    };

    console.log('Fetched team data:', fullTeamData);

    return fullTeamData;
  } catch (error) {
    console.error('チームデータの取得中にエラーが発生しました:', error);
    return null;
  }
}

export default function TeamSmy() {
  const params = useParams();
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const teamId = params.id as string;
    if (!teamId) {
      setError('チームIDが見つかりません');
      setIsLoading(false);
      return;
    }

    fetchTeamData(teamId)
      .then((data) => {
        if (data) {
          setTeamData(data);
          console.log('Set team data:', data);
        } else {
          setError('チームデータの取得に失敗しました');
        }
      })
      .catch((err) => {
        console.error('Error fetching team data:', err);
        setError(err instanceof Error ? err.message : 'チームデータの取得中に不明なエラーが発生しました');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [params.id]);

  if (typeof window === 'undefined') {
    return null;
  }

  if (isLoading) {
    return <div>読み込み中...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>エラーが発生しました</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>再試行</button>
      </div>
    );
  }

  if (!teamData) {
    return <div>チームが見つかりません</div>;
  }

  const calculateAverage = (value: number) => 
    teamData.gamesPlayed > 0 ? (value / teamData.gamesPlayed).toFixed(1) : '0.0';

  return (
    <section className={styles.topContent}>
      <section className={styles.topContent__inner}>
        <div className={`${styles.topContent__inner__img} w-[150px] h-[150px] overflow-hidden rounded-full`}>
          <Image
            src={teamData.image ? `/images/team/${teamData.image}` : '/placeholder.png'}
            alt={`${teamData.teamName}のアイコン`}
            width={150}
            height={150}
            className="object-cover w-full h-full"
          />
        </div>
        <div className={styles.topContent__inner__smy}>
          <h1 className={styles.topContent__inner__smy__team}>
            {teamData.teamName}
          </h1>

          <div className={styles.topContent__inner__smy__data}>
            <div className={styles.topContent__inner__smy__data__flex}>
              <div className={styles.topContent__inner__smy__data__flex__category}>
                <p><span>{teamData.category}</span>｜<span>{teamData.prefecture}｜{teamData.area}</span></p>
              </div>
              <div className={styles.topContent__inner__smy__data__flex__wl}>
                <p><span>{teamData.wins}</span>勝<span>{teamData.losses}</span>敗</p>
              </div>
            </div>

            <div className={styles.topContent__inner__smy__data__border}></div>
            <div className={styles.topContent__inner__smy__data__flexSmy}>
              <dl><dt>得点</dt><dd>{calculateAverage(teamData.pointsScored)}</dd></dl>  
              <dl><dt>失点</dt><dd>{calculateAverage(teamData.pointsConceded)}</dd></dl> 
              <dl><dt>アシスト</dt><dd>{calculateAverage(teamData.assists)}</dd></dl>  
              <dl><dt>リバウンド</dt><dd>{calculateAverage(teamData.rebounds)}</dd></dl>
              <dl><dt>ターンオーバー</dt><dd>{calculateAverage(teamData.turnovers)}</dd></dl>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}