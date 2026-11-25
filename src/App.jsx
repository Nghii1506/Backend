import { useEffect, useState } from 'react'
import { BarChart3, CheckSquare2, WifiOff } from 'lucide-react'
import TodayTasks from './TodayTasks.jsx'
import Analytics from './Analytics.jsx'
import { isBackendAvailable } from './services/taskService.js'

export default function App() {
  const [tab, setTab] = useState('today')
  const [fallback, setFallback] = useState(false)
  useEffect(() => { isBackendAvailable().then(ok => setFallback(!ok)) }, [])
  return <div className="min-h-screen">
    {fallback && <div className="fixed right-4 top-4 z-50 flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800 shadow-lg ring-1 ring-amber-200"><WifiOff size={16}/>Chế độ localStorage</div>}
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 text-white"><CheckSquare2 size={22}/></div><div><h1 className="font-bold text-slate-900">MyTasks</h1><p className="text-xs text-slate-500">Quản lý công việc cá nhân</p></div></div>
        <nav className="flex rounded-xl bg-slate-100 p-1">
          <button onClick={()=>setTab('today')} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${tab==='today'?'bg-white text-indigo-600 shadow-sm':'text-slate-500'}`}><CheckSquare2 size={16}/><span className="hidden sm:inline">Công việc hôm nay</span></button>
          <button onClick={()=>setTab('analytics')} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${tab==='analytics'?'bg-white text-indigo-600 shadow-sm':'text-slate-500'}`}><BarChart3 size={16}/><span className="hidden sm:inline">Thống kê</span></button>
        </nav>
      </div>
    </header>
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{tab==='today' ? <TodayTasks/> : <Analytics/>}</main>
  </div>
}
