import React from "react";
import styles from "./style.module.scss";
import Image from "next/image";
import { supabase } from '@/lib/supabase'  // Supabaseクライアントをインポート

// Supabaseから返されるデータの型定義
interface SupabasePlayerData {
  images: string;
  name: string;
  no: string;
  position: string;
  category: string;
  height: string;
  Team: {
    teamName: string;
  };
}

// アプリケーションで使用するPlayerDataの型定義
interface PlayerData {
  images: string;
  name: string;
  no: string;
  position: string;
  category: string;
  height: string;
  teamName: string;
}

// 型ガード関数
function isValidPlayerData(data: unknown): data is SupabasePlayerData {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const {
    images,
    name,
    no,
    position,
    category,
    height,
    Team
  } = data as Record<string, unknown>;

  return (
    typeof images === 'string' &&
    typeof name === 'string' &&
    typeof no === 'string' &&
    typeof position === 'string' &&
    typeof category === 'string' &&
    typeof height === 'string' &&
    typeof Team === 'object' && Team !== null &&
    'teamName' in Team && typeof Team.teamName === 'string'
  );
}

// 非同期関数でデータを取得
async function getPlayerData(id: string): Promise<PlayerData | null> {
  const { data, error } = await supabase
    .from('Player')
    .select(`
      images,
      name,
      no,
      position,
      category,
      height,
      Team (teamName)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching player data:', error)
    return null
  }

  if (isValidPlayerData(data)) {
    return {
      ...data,
      teamName: data.Team.teamName
    };
  }

  console.error('Invalid player data structure:', data)
  return null
}

// コンポーネントを非同期関数に変更
export default async function PlayerSmy({ params }: { params: { id: string } }) {
  const playerData = await getPlayerData(params.id)

  if (!playerData) return <div>Player not found</div>

  return (
    <section className={styles.playerContent}>
      <section className={styles.playerContent__inner}>
        <div className={styles.playerContent__inner__img}>
          <Image
            src={`/images/${playerData.images}`}
            alt={`${playerData.name}の画像`}
            width={150}
            height={150}
          />
        </div>
        <div className={styles.playerContent__inner__smy}>
          <div className={styles.playerContent__inner__smy__name}>
            {playerData.name}
          </div>

          <div className={styles.playerContent__inner__smy__data}>
            <div className={styles.playerContent__inner__smy__data__flex}>
              <div className={styles.playerContent__inner__smy__data__flex__position}>
                <p>ポジション：<span>{playerData.position}</span></p>
              </div>
              <div className={styles.playerContent__inner__smy__data__flex__category}>
                <p>所属：<span>{playerData.category}</span></p>
              </div>
              <div className={styles.playerContent__inner__smy__data__flex__height}>
                <p>身長：<span>{playerData.height}</span></p>
              </div>
            </div>

            <div className={styles.playerContent__inner__smy__data__border}></div>
            <div className={styles.playerContent__inner__smy__data__flexSmy}>
              <dl>
                <dt>【所属チーム】</dt><dd>{playerData.teamName}</dd>
              </dl> 
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}