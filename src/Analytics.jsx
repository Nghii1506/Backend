import { useEffect, useState } from 'react'
import { CheckCircle2, CircleAlert, ListTodo, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { getStats } from './services/taskService.js'
const COLORS=['#6366f1','#38bdf8','#fb7185']
export default function Analytics(){
 const [stats,setStats]=useState({total:0,done:0,completionRate:0,highOpen:0,last7:[],categories:[]})
 useEffect(()=>{getStats().then(setStats)},[])
 const kpis=[{label:'Tổng công việc',value:stats.total,icon:ListTodo,color:'bg-indigo-50 text-indigo-600'},{label:'Đã hoàn thành',value:stats.done,icon:CheckCircle2,color:'bg-emerald-50 text-emerald-600'},{label:'Tỷ lệ hoàn thành',value:`${stats.completionRate}%`,icon:TrendingUp,color:'bg-sky-50 text-sky-600'},{label:'Ưu tiên cao chưa xong',value:stats.highOpen,icon:CircleAlert,color:'bg-rose-50 text-rose-600'}]
 return <><div className="mb-8"><h2 className="text-2xl font-bold">Thống kê tổng quan</h2><p className="mt-1 text-sm text-slate-500">Theo dõi hiệu suất công việc của bạn</p></div>
 <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{kpis.map(k=>{const Icon=k.icon;return <div className="card p-5" key={k.label}><div className="flex items-center justify-between"><div><p className="text-sm text-slate-500">{k.label}</p><p className="mt-2 text-3xl font-bold">{k.value}</p></div><div className={`grid h-12 w-12 place-items-center rounded-xl ${k.color}`}><Icon size={22}/></div></div></div>})}</div>
 <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]"><section className="card p-5"><h3 className="mb-6 font-bold">Hoàn thành trong 7 ngày</h3><div className="h-80"><ResponsiveContainer width="100%" height="100%"><BarChart data={stats.last7}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="day"/><YAxis allowDecimals={false}/><Tooltip/><Legend/><Bar name="Hoàn thành" dataKey="completed" fill="#6366f1" radius={[6,6,0,0]}/><Bar name="Chưa hoàn thành" dataKey="incomplete" fill="#cbd5e1" radius={[6,6,0,0]}/></BarChart></ResponsiveContainer></div></section>
 <section className="card p-5"><h3 className="mb-6 font-bold">Công việc theo danh mục</h3><div className="h-80"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={stats.categories} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={3} label>{stats.categories.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}</Pie><Tooltip/><Legend/></PieChart></ResponsiveContainer></div></section></div></>
}
