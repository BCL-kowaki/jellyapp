import { createClient } from '@supabase/supabase-js'
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import styles from "./style.module.scss";
import Image from "next/image";

// 環境変数のチェックとSupabaseクライアントの作成
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing environment variables for Supabase')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
function isValidPlayerData(data: any): data is SupabasePlayerData {
  return (
    data &&
    typeof data.images === 'string' &&
    typeof data.name === 'string' &&
    typeof data.no === 'string' &&
    typeof data.position === 'string' &&
    typeof data.category === 'string' &&
    typeof data.height === 'string' &&
    data.Team &&
    typeof data.Team.teamName === 'string'
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

// サーバーサイドでデータを取得
export async function getServerSideProps({ params }: { params: { id: string } }) {
  const playerData = await getPlayerData(params.id)

  return {
    props: { playerData }
  }
}

const PlayerSmy: React.FC<{ playerData: PlayerData | null }> = ({ playerData }) => {
  if (!playerData) return <div>Player not found</div>

  return (
    <section className={styles.playerContent}>
      <section className={styles.playerContent__inner}>
        <div className={styles.playerContent__inner__img}>
        <Image
            src={`/images/${playerData.images}`}
            alt="playerImage"
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
            <div className={styles.playerContent__inner__smy__data__flex__oosition}>
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
};

export default PlayerSmy;