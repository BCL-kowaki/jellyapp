import * as React from "react"
import styles from "./style.module.scss";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Counter from "./Counter/page"

export const description =
  "A product edit page. The product edit page has a form to edit the product details, stock, product category, product status, and product images. The product edit page has a sidebar navigation and a main content area. The main content area has a form to edit the product details, stock, product category, product status, and product images. The sidebar navigation has links to product details, stock, product category, product status, and product images."

export function SelectDate() {
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
              <SelectItem value="得点｜2P">得点｜2P</SelectItem>
              <SelectItem value="得点｜3P">得点｜3P</SelectItem>
              <SelectItem value="得点｜FT">得点｜FT</SelectItem>
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