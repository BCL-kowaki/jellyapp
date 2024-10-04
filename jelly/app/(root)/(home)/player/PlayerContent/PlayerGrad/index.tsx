import React from 'react'
import styles from './style.module.scss'
import GradTable from './GradTable';

const PlayerGrad = () => {
    return (
      <>
      <section className={styles.gradTable}>
            <table>
              <tr>
                <th>日付</th>
                <th>対戦相手</th>
                <th>対戦結果</th>
                <th>GS</th>
                <th>MIN</th>
                <th>PTS</th>
                <th>PF</th>
                <th>FG</th>
                <th>FG%</th>
                <th>3P</th>
                <th>3P%</th>
                <th>FT</th>
                <th>FT%</th>
              </tr>
              <GradTable />
              <GradTable />
              <GradTable />
              <GradTable />
              <GradTable />
            </table>
          </section>



      </>
    );
  };

export default PlayerGrad;