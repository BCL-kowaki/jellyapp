import * as React from "react"
import styles from "./style.module.scss";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Counter from "./Counter/page"

function SelectDate() {
  return (

    <Card x-chunk="dashboard-07-chunk-2">
    <CardHeader>
      <CardTitle>スコア</CardTitle>
    </CardHeader>
    <CardContent className={styles.scoreFlex}>
      <div className={styles.scoreFlexGred}>
      <div className="grid gap-6 sm:grid-cols-2">
        <div className={styles.selectGrid}>
          <Select>
            <SelectTrigger
              id="subcategory"
              aria-label="Select subcategory"
            >
              <SelectValue placeholder="
            クォーター" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1クォーター">1クォーター</SelectItem>
              <SelectItem value="2クォーター">2クォーター</SelectItem>
              <SelectItem value="3クォーター">3クォーター</SelectItem>
              <SelectItem value="4クォーター">4クォーター</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className={styles.selectGrid}>
          <Select>
            <SelectTrigger
              id="subcategory"
              aria-label="Select subcategory"
            >
              <SelectValue placeholder="チーム" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="チームA">チームA</SelectItem>
              <SelectItem value="チームB">チームB</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className={styles.selectGrid}>
          <Select>
            <SelectTrigger
              id="subcategory"
              aria-label="Select subcategory"
            >
              <SelectValue placeholder="カテゴリー" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="得点_2P">得点_2P</SelectItem>
              <SelectItem value="得点_3P">得点_3P</SelectItem>
              <SelectItem value="得点_FT">得点_FT</SelectItem>
              <SelectItem value="ファール">ファール</SelectItem>
              <SelectItem value="タイムアウト">タイムアウト</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className={styles.selectGrid}>
          <Select>
            <SelectTrigger
              id="subcategory"
              aria-label="Select subcategory"
            >
              <SelectValue placeholder="選手" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="◯◯◯◯◯◯">◯◯◯◯◯◯</SelectItem>
              <SelectItem value="XXXXXX">XXXXXX</SelectItem>
              <SelectItem value="▲▲▲▲▲▲">▲▲▲▲▲▲</SelectItem>
              <SelectItem value="▼▼▼▼▼▼">▼▼▼▼▼▼</SelectItem>
              <SelectItem value="⚫︎⚫︎⚫︎⚫︎⚫︎⚫︎">⚫︎⚫︎⚫︎⚫︎⚫︎⚫︎</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      </div>
      <div className={styles.scoreFlexGred}>
        <Counter />
      </div>
    </CardContent>
  </Card>
  )
}

export default SelectDate