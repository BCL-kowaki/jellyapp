import React from "react";
import styles from "./style.module.scss";
import Image from "next/image";

const TeamSmy = () => {
  return (
    <section className={styles.topContent}>
      <section className={styles.topContent__inner}>
        <div className={styles.topContent__inner__img}>
          <Image
            src="/images/teamIcon.png"
            alt="teamIcon"
            width={150}
            height={150}
        />
        </div>
        <div className={styles.topContent__inner__smy}>
          <div className={styles.topContent__inner__smy__team}>
            福岡大附属大濠高校
          </div>

          <div className={styles.topContent__inner__smy__data}>
            <div className={styles.topContent__inner__smy__data__flex}>
            <div className={styles.topContent__inner__smy__data__flex__wl}>
              <p><span>14</span>勝<span>2</span>敗</p>
            </div>
            <div className={styles.topContent__inner__smy__data__flex__category}>
              <p><span>U-18</span>｜<span>2024</span></p>
            </div>
            </div>

          <div className={styles.topContent__inner__smy__data__border}></div>
          <div className={styles.topContent__inner__smy__data__flexSmy}>
            <dl><dt>得点</dt><dd>72.3</dd></dl>  
            <dl><dt>失点</dt><dd>51.8</dd></dl> 
            <dl><dt>FG%</dt><dd>40.1</dd></dl>  
            <dl><dt>3P%</dt><dd>21.2</dd></dl>
            <dl><dt>FT%</dt><dd>60.2</dd></dl>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
};

export default TeamSmy;