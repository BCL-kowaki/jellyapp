"use client"

import * as React from "react"
import styles from "./style.module.scss";
import Image from "next/image"
import Link from "next/link"
import { TrendingUp } from "lucide-react"
import TeamMember from "./TeamMember/page";
import TeamFoul from "./TeamFoul/page";
import TeamTimeout from "./TeamTimeout/page";
import TotalScore from "./TotalScore/page";
import QScore from "./QScore/page";
import Counter from "./SelectDate/Counter/page";
import SelectDate from "./SelectDate/page";

const Controller = () => {
  return (
  <>
  <div className="mb-5">
      <SelectDate />
</div>

  <div className="flex flex-col sm:gap-4 sm:py-4">
  <div className="grid flex-1 items-start gap-4 sm:py-0 md:gap-8 lg:grid-cols-4 xl:grid-cols-4">
    <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2" >
      <TotalScore />
    </div>
    <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2" >
      <QScore />
  </div>
</div>
</div>

<div className="flex flex-col sm:gap-4 sm:py-4">
  <div className="grid flex-1 items-start gap-4 sm:py-0 md:gap-8 lg:grid-cols-4 xl:grid-cols-4">
    <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2" >
      <TeamFoul />
    </div>
    <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2" >
      <TeamTimeout />
    </div>
  </div>
</div>
<div className="flex min-h-screen w-full flex-col">
  <div className="flex flex-col sm:gap-4 sm:py-4">
    <div className="grid flex-1 items-start gap-4 sm:py-0 md:gap-8 lg:grid-cols-4 xl:grid-cols-4">
      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2" >
        <TeamMember />
      </div>
      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
        <TeamMember />
      </div>
    </div>
  </div>
</div>
   
   
   </>
  );
}

export default Controller