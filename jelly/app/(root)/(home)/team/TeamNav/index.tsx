import React from "react";
import styles from "./style.module.scss";

const TeamNav = () => {
  return (
  <>

      <section className={styles.contentNav}>
        <nav>
          <ul>
            <li><a href="#">チーム情報</a></li>
            <li><a href="#" className={styles.mcontentNav__active}>チーム成績</a></li>
            <li><a href="#">動画</a></li>
          </ul>
        </nav>
      </section>

    </>
  );
};

export default TeamNav;