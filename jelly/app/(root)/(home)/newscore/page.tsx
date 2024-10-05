import React from 'react'
import { format } from 'date-fns'
import styles from "./style.module.scss";
import Controller from './Controller/page';

const NewScore = () => {
  const today = format(new Date(), 'yyyy/MM/dd')
  return (
  <section className='flex size-full flex-col gap-10 text-white'>
    <section className='flex size-full flex-col text-white'>
      <div className={styles.mainContent}>
        <div className={styles.mainContent__inner}>
        <h1 className="text-3xl font-bold mb-8">{today}</h1>
          <Controller />
        </div>
      </div>
    </section>
  </section>
  )
}

export default NewScore