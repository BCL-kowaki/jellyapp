'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import styles from "./style.module.scss"
import PlayerNav from './PlayerNav'
import PlayerContent from './PlayerContent'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface PlayerData {
  id?: string;
  image?: string | null;
  name?: string;
  No: string;
  position?: string;
  category?: string;
  height?: string;
  Team?: {
    teamName?: string;
  } | null;
}

function isPlayerData(data: any): data is PlayerData {
  return (
    typeof data === 'object' &&
    data !== null &&
    (typeof data.id === 'string' || data.id === undefined) &&
    (typeof data.image === 'string' || data.image === null || data.image === undefined) &&
    (typeof data.name === 'string' || data.name === undefined) &&
    (typeof data.No === 'string' || data.No === undefined) &&
    (typeof data.position === 'string' || data.position === undefined) &&
    (typeof data.category === 'string' || data.category === undefined) &&
    (typeof data.height === 'string' || data.height === undefined) &&
    (data.Team === undefined || data.Team === null || (typeof data.Team === 'object' && (typeof data.Team.teamName === 'string' || data.Team.teamName === undefined)))
  );
}

export default function Player() {
  const params = useParams();
  const playerId = params.id as string;
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlayerData() {
      if (!playerId) {
        setError('Player ID is missing');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('Player')
          .select(`
            id,
            image,
            name,
            No,
            position,
            category,
            height,
            Team (teamName)
          `)
          .eq('id', playerId)
          .single();

        if (error) {
          console.error('Supabase error:', error);
          throw new Error(`Failed to fetch player data: ${error.message}`);
        }

        if (!data) {
          throw new Error('No data returned from Supabase');
        }

        if (!isPlayerData(data)) {
          console.error('Invalid data structure:', data);
          console.warn('Data structure does not fully match expected PlayerData interface. Proceeding with available data.');
          setPlayerData(data as PlayerData);
        } else {
          setPlayerData(data);
        }
      } catch (error) {
        console.error('Error in fetchPlayerData:', error);
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('An unknown error occurred while fetching player data');
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchPlayerData();
  }, [playerId]);

  if (isLoading) {
    return <div>Loading...</div>;
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

  if (!playerData) {
    return <div>Player not found</div>;
  }

  return (
    <section className='flex size-full flex-col text-white'>
      <section className={styles.playerContent}>
        <section className={styles.playerContent__inner}>
          <div className={styles.playerContent__inner__img}>
            <Image
              src={playerData.image ? `/images/${playerData.image}` : '/images/default-player.png'}
              alt={`${playerData.name || 'Unknown player'}の画像`}
              width={150}
              height={150}
            />
          </div>
          <div className={styles.playerContent__inner__smy}>
            <div className={styles.playerContent__inner__smy__name}>
              {playerData.name || 'Unknown player'}
            </div>

            <div className={styles.playerContent__inner__smy__data}>
              <div className={styles.playerContent__inner__smy__data__flex}>
                <div className={styles.playerContent__inner__smy__data__flex__No}>
                  <p>背番号：<span>{playerData.No || '不明'}</span></p>
                </div>
                <div className={styles.playerContent__inner__smy__data__flex__position}>
                  <p>ポジション：<span>{playerData.position || '不明'}</span></p>
                </div>
                <div className={styles.playerContent__inner__smy__data__flex__category}>
                  <p>所属：<span>{playerData.category || '不明'}</span></p>
                </div>
                <div className={styles.playerContent__inner__smy__data__flex__height}>
                  <p>身長：<span>{playerData.height || '不明'}</span></p>
                </div>
              </div>

              <div className={styles.playerContent__inner__smy__data__border}></div>
              <div className={styles.playerContent__inner__smy__data__flexSmy}>
                <dl>
                  <dt>【所属チーム】</dt>
                  <dd>{playerData.Team?.teamName ?? '所属チームなし'}</dd>
                </dl> 
              </div>
            </div>
          </div>
        </section>
      </section>
      <div className={styles.mainContent}>
        <div className={styles.mainContent__inner}>
          <PlayerNav playerData={playerData} />
          <PlayerContent playerData={playerData} />
        </div>
      </div>
    </section>
  );
}