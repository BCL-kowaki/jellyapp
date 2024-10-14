import React from "react";
import styles from "./style.module.scss";
import PlayerPulldown from "./PlayerPulldown";
import PlayerStats from "./PlayerStats";
import PlayerGrad from "./PlayerGrad";
import PlayerMv from "./PlayerMv";

const PlayerContent = () => {
  return (
  <>
        <section className={styles.content}>
          <PlayerPulldown />
          <h1>スタッツ</h1>
          <PlayerStats />
          <h1>これまでの成績</h1>
          <PlayerGrad />
          <PlayerMv />
        </section>

    </>
  );
};

export default PlayerContent;