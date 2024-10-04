import React from "react";
import styles from "./style.module.scss";

const PlayerPulldown = () => {
  return (
  <>

          <div className={styles.pulldown}>
            <select name="example">
              <option>2024</option>
              <option>2023</option>
              <option>2022</option>
            </select>
            <select name="example">
              <option>公式試合</option>
              <option>非公式試合</option>
              <option>両方</option>
            </select>
          </div>

    </>
  );
};

export default PlayerPulldown;