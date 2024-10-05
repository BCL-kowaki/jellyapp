import React from 'react'
// import Meeting from '../meeting/[id]/page';
import HomeMenu from '@/components/HomeMenu';

const Home = () => {
  const now = new Date();

  const time = now.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tokyo' });
  const date = (new Intl.DateTimeFormat('ja-JP', { dateStyle: 'full' })).format(now);
  
  return (
    <section className='flex flex-col gap-10 px-10 pt-7 text-white menuContent'>
      <div className='h-[300px] w-full rounded-[20px] bg-hero bg-cover'>
        <div className='flex h-full flex-col justify-between max-md:px-5 max-md:py-8 lg:p-11'>
          <h2 className='max-w-[270px] rounded py-2 text-center text-base font-noemal'>
            {/* Upcoming Game at: 12:30 PM */}
          </h2>
          <div className='flex flex-col gap-2'>
            <h2 className='text-4xl font-extrabold lg:text-7xl'>{time}</h2>
            <p className='text-lg font-medium text-sky-1 lg:text-2xl'>{date}</p>
          </div>
        </div>
      </div>

      <HomeMenu />
    </section>
  )
}

export default Home