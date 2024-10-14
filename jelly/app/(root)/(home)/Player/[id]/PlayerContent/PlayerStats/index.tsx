import React from 'react'
import styles from './style.module.scss'

const PlayerStats = () => {
    return (
<section className={styles.statsContainer}>
      <table className={styles.statsTable}>
        <tbody>
          <tr>
            <td>
              <div className={styles.statsBox}>
                <div className={styles.statsBox__label1}>GP</div>
                <div className={styles.statsBox__value}><span>71</span>回</div>
                <div className={styles.statsBox__label2}>出場回数</div>
              </div>
            </td>
            <td>
              <div className={styles.statsBox}>
              <div className={styles.statsBox__label1}>GS</div>
                <div className={styles.statsBox__value}><span>71</span>回</div>
                <div className={styles.statsBox__label2}>スタメン回数</div>
              </div>
            </td>
            <td>
              <div className={styles.statsBox}>
              <div className={styles.statsBox__label1}>MIN</div>
                <div className={styles.statsBox__value}><span>15.0</span>分</div>
                <div className={styles.statsBox__label2}>平均出場時間</div>
              </div>
            </td>
            <td>
              <div className={styles.statsBox}>
              <div className={styles.statsBox__label1}>PF</div>
                <div className={styles.statsBox__value}><span>3.2</span>回</div>
                <div className={styles.statsBox__label2}>平均ファウル</div>
              </div>
            </td>
            <td>
              <div className={styles.statsBox}>
              <div className={styles.statsBox__label1}>PTS</div>
                <div className={styles.statsBox__value}><span>13.2</span>点</div>
                <div className={styles.statsBox__label2}>平均点数</div>
              </div>
            </td>
            <td>
              <div className={styles.statsBox}>
              <div className={styles.statsBox__label1}>FG%</div>
                <div className={styles.statsBox__value}><span>21.2</span>%</div>
                <div className={styles.statsBox__label2}>フィールドゴール%</div>
              </div>
            </td>
            <td>
              <div className={styles.statsBox}>
              <div className={styles.statsBox__label1}>3P%</div>
                <div className={styles.statsBox__value}><span>12.6</span>%</div>
                <div className={styles.statsBox__label2}>3ポイント%</div>
              </div>
            </td>
            <td>
              <div className={styles.statsBox}>
              <div className={styles.statsBox__label1}>FT%</div>
                <div className={styles.statsBox__value}><span>56.4</span>%</div>
                <div className={styles.statsBox__label2}>フリースロー%</div>
              </div>
            </td>
          </tr>
          {/* Add more rows here following the same pattern */}
        </tbody>
      </table>
    </section>
    );
  };

export default PlayerStats;