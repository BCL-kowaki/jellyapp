import React from 'react'
import styles from "./style.module.scss";
import PlayerContent from './PlayerContent'
import PlayerNav from './PlayerNav'
import PlayerSmy from './PlayerSmy'

const Player = () => {
  return (
<section className='flex size-full flex-col text-white'>
    <PlayerSmy />
    <div className={styles.mainContent}>
    <div className={styles.mainContent__inner}>
    <PlayerNav />
    <PlayerContent />
    </div>
    </div>

  </section>
  )
}

export default Player