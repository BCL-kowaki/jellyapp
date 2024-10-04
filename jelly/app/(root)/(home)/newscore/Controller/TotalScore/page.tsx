"use client"
import React from 'react'
import styles from "./style.module.scss";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components//ui/card"

export const description = "A collection of health charts."


const TotalScore = () => {
  return (
      <Card>
        <div className={styles.scoreCardInner}>
        <h3 className={styles.scoreTitle}>スコア</h3>
        <div className={styles.scoreFlex}>
          <div>
          <div className={styles.scoreToral}>
              62
            </div>
            <div className={styles.teamName}>チームA</div>
          </div>
          <div className={styles.scoreBorder}>-</div>
          <div>
          <div className={styles.scoreToral}>
              54
            </div>
            <div className={styles.teamName}>チームB</div>
          </div>
          </div>
          </div>
      </Card>
  )
}

export default TotalScore