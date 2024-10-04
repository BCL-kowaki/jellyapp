import * as React from "react"
import { Minus, Plus } from "lucide-react"
import styles from "./style.module.scss";
import { Button } from "@/components/ui/button"

// const data = [
//   {
//     goal: 400,
//   },
//   {
//     goal: 300,
//   },
//   {
//     goal: 200,
//   },
//   {
//     goal: 300,
//   },
//   {
//     goal: 200,
//   },
//   {
//     goal: 278,
//   },
//   {
//     goal: 189,
//   },
//   {
//     goal: 239,
//   },
//   {
//     goal: 300,
//   },
//   {
//     goal: 200,
//   },
//   {
//     goal: 278,
//   },
//   {
//     goal: 189,
//   },
//   {
//     goal: 349,
//   },
// ]

export function Counter() {
  const [goal, setGoal] = React.useState(2)

  function onClick(adjustment: number) {
    setGoal(Math.max(0, Math.min(4, goal + adjustment)))
  }

  return (
        <div className="mx-auto w-full max-w-sm">
          <div className="pb-0">
            <div className="flex items-center justify-center space-x-2 mb-5">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-full"
                onClick={() => onClick(-1)}
                disabled={goal <= 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div className="flex-1 text-center">
                <div className={styles.goal}>
                  {goal}
                </div>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-full"
                onClick={() => onClick(1)}
                disabled={goal >= 4}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
              <div className="grid grid-cols-2 gap-5 text-center">
            <Button>クリック</Button>
              <Button variant="outline">キャンセル</Button>
              </div>
        </div>
  )
}

export default Counter