import React from "react";
import styles from "./style.module.scss";
import Image from "next/image";

const PlayerSmy = () => {
  return (
    <section className={styles.playerContent}>
      <section className={styles.playerContent__inner}>
        <div className={styles.playerContent__inner__img}>
        <Image
            src="/images/playerIcon.png"
            alt="teamIcon"
            width={150}
            height={150}
        />
        </div>
        <div className={styles.playerContent__inner__smy}>
          <div className={styles.playerContent__inner__smy__name}>
            山田 太郎　<span>ヤマダ タロウ</span>
          </div>

          <div className={styles.playerContent__inner__smy__data}>
            <div className={styles.playerContent__inner__smy__data__flex}>
            <div className={styles.playerContent__inner__smy__data__flex__oosition}>
              <p>ポジション：<span>PG</span></p>
            </div>
            <div className={styles.playerContent__inner__smy__data__flex__category}>
              <p>所属：<span>U-18</span></p>
            </div>
            <div className={styles.playerContent__inner__smy__data__flex__height}>
              <p>身長：<span>188cm</span></p>
            </div>
            </div>

          <div className={styles.playerContent__inner__smy__data__border}></div>
          <div className={styles.playerContent__inner__smy__data__flexSmy}>
            <dl>
              <dt>【所属チーム】</dt><dd>福岡大附属大濠高校</dd>
            </dl> 
            </div>
          </div>
        </div>
      </section>
    </section>
  );
};

export default PlayerSmy;