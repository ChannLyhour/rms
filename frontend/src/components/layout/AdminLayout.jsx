import {
  SidebarProvider,
  SidebarInset,
} from '@/components/ui/sidebar'
import AppSidebar from '../pos/AppSidebar'
import HeaderLayout from './headerLayout'

export default function AdminLayout({ children }) {
  return (
    <SidebarProvider
      style={{
        '--sidebar-width': '17.5rem',
        '--sidebar-width-icon': '60px',
      }}
      defaultOpen={
        typeof window !== 'undefined'
          ? localStorage.getItem('pos_sidebar_collapsed') !== 'true'
          : true
      }
    >
      <AppSidebar />
      <SidebarInset className="overflow-hidden flex flex-col h-screen">
        {/* Topbar with sidebar toggle */}
        <HeaderLayout />
        
        {/* Main content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 bg-[#e9e9ef] dark:bg-[#0b0d13]">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
