import React from 'react'
import styles from "./style.module.scss";
import Controller from './Controller/page';

const newscore = () => {
  return (
  <section className='flex size-full flex-col gap-10 text-white'>
    <section className='flex size-full flex-col text-white'>
      <div className={styles.mainContent}>
        <div className={styles.mainContent__inner}>
          <Controller />
        </div>
      </div>
    </section>
  </section>
  )
}

export default newscore