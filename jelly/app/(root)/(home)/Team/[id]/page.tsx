import React from 'react'
import styles from './style.module.scss';
import TeamSmy from './TeamSmy'
import TeamNav from './TeamNav'
import TeamContent from './TeamContent';

const Team = () => {
  return (
    <section className='flex size-full flex-col text-white'>
    <TeamSmy />
    <div className={styles.mainContent}>
    <div className={styles.mainContent__inner}>
    <TeamNav />
    <TeamContent />
    </div>
    </div>

  </section>
  )
}

export default Team