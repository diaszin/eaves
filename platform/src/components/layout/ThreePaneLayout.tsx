import { Outlet } from 'react-router-dom'
import type { ReactNode } from 'react'
import { NavigationRail } from './NavigationRail'
import { SectionPanel } from './SectionPanel'

interface ThreePaneLayoutProps {
  children?: ReactNode
}

export function ThreePaneLayout({ children }: ThreePaneLayoutProps) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
      <NavigationRail />
      <SectionPanel />
      <main className="flex-1 overflow-auto bg-white">
        {children ?? <Outlet />}
      </main>
    </div>
  )
}
