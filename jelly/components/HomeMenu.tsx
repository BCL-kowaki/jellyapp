"use client"

import { useState } from 'react';
import Link from 'next/link';
// import { Home } from "lucide-react"
import HomeCard from "./HomeCard"
// import Image from "next/image"
import { useRouter } from 'next/navigation';
import GameModel from './GameModel';
// import { create } from 'domain';

const HomeMenu = () => {
  const router = useRouter();
  const [meetingState, setMeetingState] = useState<'isScheduleMeeting' | 'isJoiningMeeting' | 'isInstantMeeting' | undefined >(undefined);

  // const createMeeting = () => {
  //   router.push('/meeting/123');
  // }

  return (
    <section className='grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4'>
      <Link href="/newscore">
      <HomeCard 
      img="/icons/add-meeting.svg"
      title="新規試合"
      description="新しい試合を開始する"
      handleClick={() => setMeetingState('isJoiningMeeting')}
      className="bg-orange-1"
      />
      </Link>

      <HomeCard 
      img="/icons/schedule.svg"
      title="試合予定"
      description="今後の試合を計画する"
      handleClick={() => setMeetingState('isScheduleMeeting')}
      className="bg-blue-1"
      />

      <HomeCard 
      img="/icons/recordings.svg"
      title="チーム登録"
      description="新しいチームを登録する"
      handleClick={() => setMeetingState('isJoiningMeeting')}
      className="bg-purple-1"
      />

      <HomeCard 
      img="/icons/join-meeting.svg"
      title="プレイヤー登録"
      description="新しいプレイヤーを登録する"
      handleClick={() => setMeetingState('isJoiningMeeting')}
      className="bg-yellow-1"
      />

      {/* <GameModel 
      isOpen={meetingState === 'isInstantMeeting'}
      onClose={() => setMeetingState(undefined)}
      title="すぐに会議を始める"
      className="text-center"
      buttonText="Start Meeting"
      handleClick={createMeeting}
    /> */}

    </section>  
  )
}

export default HomeMenu