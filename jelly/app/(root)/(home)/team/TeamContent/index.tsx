import React from "react";
import styles from "./style.module.scss";
import TeamPulldown from "./TeamPulldown";
import TeamInfo from "./TeamInfo";
import TeamGrad from "./TeamGrad";
import TeamMv from "./TeamMv";

const TeamContent = () => {
  return (
  <>
        <section className={styles.content}>
          <TeamPulldown />
          <TeamInfo />
          <TeamGrad />
          <TeamMv />
        </section>

    </>
  );
};

export default TeamContent;