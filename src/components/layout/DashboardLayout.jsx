import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

export default function DashboardLayout() {
  return (
    <div className="min-h-screen app-shell">
      <Sidebar />
      <div className="pl-[16.5rem]">
        <Header />
        <main className="mx-auto max-w-[1600px] px-5 py-6 lg:px-8 lg:py-7">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
