import BottomNavBar from '@/components/shared/BottomNavBar'
import DashboardComments from '@/components/shared/DashboardComments'
import DashboardPosts from '@/components/shared/DashboardPosts'
import DashboardProfile from '@/components/shared/DashboardProfile'
import DashboardSidebar from '@/components/shared/DashboardSidebar'
import DashboardUsers from '@/components/shared/DashboardUsers'
import MainDashboard from '@/components/shared/MainDashboard'
import DashboardPartners from '@/components/shared/DashboardPartners' 

import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

const Dashboard = () => {
  const location = useLocation()
  const [tab, setTab] = useState("")

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    const tabFromUrl = urlParams.get("tab")
    if (tabFromUrl) {
      setTab(tabFromUrl)
    }
  }, [location.search])

  return (
    <div className='min-h-screen flex flex-col md:flex-row w-full bg-slate-50'>
      
      {/* Sidebar (Desktop) */}
      <div className='hidden md:block w-64 flex-shrink-0 min-h-screen border-r border-gray-200 bg-white sticky top-0 self-start'>
        <DashboardSidebar />
      </div>

      {/* Bottom Nav (Mobile) */}
      <div className="md:hidden">
          <BottomNavBar />
      </div>

      {/* Main Content Area */}
      <div className='flex-1 w-full p-4 md:p-8 min-h-screen'>
        <div className="max-w-7xl mx-auto"> {/* Diperlebar ke 7xl agar tabel tidak sempit */}
            
            {/* [PERBAIKAN]: tab harus "dash" sesuai dengan Link di Sidebar */}
            {tab === "dash" && <MainDashboard />}
            
            {tab === "profile" && <DashboardProfile />}
            {tab === "posts" && <DashboardPosts />}
            {tab === "users" && <DashboardUsers />}
            {tab === "comments" && <DashboardComments />}
            {tab === "partners" && <DashboardPartners />}
        </div>
      </div>
    </div>
  )
}

export default Dashboard