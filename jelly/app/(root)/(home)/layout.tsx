'use client'

import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import React, { ReactNode, useState } from 'react'

const HomeLayout = ({ children }: { children: ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <main className='relative'>
      <Navbar />
      <div className='flex'>
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <section 
      className={`
        flex min-h-screen flex-1 flex-col pt-20 max-md:pb-14 
        transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'ml-[264px] w-[calc(100%-264px)]' : 'ml-[78px] w-[calc(100%-78px)]'}
      `}
    >
      <div className="w-full">
        {children}
      </div>    
    </section>
      </div>
    </main>
  )
}

export default HomeLayout