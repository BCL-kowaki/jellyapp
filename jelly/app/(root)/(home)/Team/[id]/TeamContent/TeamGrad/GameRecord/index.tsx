import React from 'react'
import styles from './style.module.scss'

const GameRecord = () => {
    return (

      <section className={styles.gamerecord}>
      <div className={styles.gamerecord__inner}>
        <h1>2024/05/22</h1>
        <div className={styles.gamerecord__inner__flex}>
          <dl>
            <dd><span>vs</span><a>〇〇〇〇〇〇 U-18</a></dd>
            <dd><span>◯</span><span>78</span>-<span>54</span></dd>
          </dl>
          <div>
          <a>スコアを見る</a>
          </div>
        </div>
      </div>
    </section>
    );
  };

export default GameRecord