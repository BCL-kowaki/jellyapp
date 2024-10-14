import React from "react";
import styles from "./style.module.scss";
import StatsTable from "./StatsTable";
import MembarTable from "./MembarTable";

const TeamInfo = () => {
  return (
  <>
        <section className={styles.infoContent}>
          <h1>シーズン別スタッツ</h1>
          <section className={styles.infoContent__statsTable}>
            <table>
              <tr>
                <th>シーズン</th>
                <th>GP</th>
                <th>PPG</th>
                <th>PRG</th>
                <th>APG</th>
                <th>FG</th>
                <th>FG%</th>
                <th>3P</th>
                <th>3P%</th>
                <th>FT</th>
                <th>FT%</th>
              </tr>
              <StatsTable />
              <StatsTable />
              <StatsTable />
              <StatsTable />
              <StatsTable />
            </table>
          </section>

          <h1>チームメンバー</h1>
          <section className={styles.infoContent__memberTable}>
            <table>
              <tr>
                <th>No</th>
                <th>名前</th>
                <th>学年</th>
                <th>ポジション</th>
                <th>身長</th>
                <th>出身</th>
                <th>実績</th>
              </tr>
              <MembarTable />
              <MembarTable />
              <MembarTable />
              <MembarTable />
              <MembarTable />
            </table>
          </section>
        </section>

    </>
  );
};

export default TeamInfo;