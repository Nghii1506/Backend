const KEY = 'personal-todo-fallback'
const today = () => new Date().toISOString().slice(0, 10)
const read = () => JSON.parse(localStorage.getItem(KEY) || '[]')
const write = tasks => localStorage.setItem(KEY, JSON.stringify(tasks))

async function api(path, options) {
  const res = await fetch(`/api${path}`, { headers: { 'Content-Type': 'application/json' }, ...options })
  if (!res.ok) throw new Error('API error')
  return res.status === 204 ? null : res.json()
}

export async function getTasks(params = {}) {
  try { const q = new URLSearchParams(params).toString(); return await api(`/tasks${q ? `?${q}` : ''}`) }
  catch { return read() }
}
export async function createTask(task) {
  try { return await api('/tasks', { method: 'POST', body: JSON.stringify(task) }) }
  catch { const tasks = read(); const next = { ...task, id: Date.now(), created_at: new Date().toISOString() }; write([next, ...tasks]); return next }
}
export async function updateTask(id, task) {
  try { return await api(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(task) }) }
  catch { const tasks = read(); const next = tasks.map(t => t.id === id ? { ...t, ...task } : t); write(next); return next.find(t => t.id === id) }
}
export async function deleteTask(id) {
  try { await api(`/tasks/${id}`, { method: 'DELETE' }) }
  catch { write(read().filter(t => t.id !== id)) }
}
export async function seedTasks() {
  try { return await api('/tasks/seed', { method: 'POST' }) }
  catch {
    const demos = ['Viết báo cáo React', 'Chuẩn bị họp nhóm', 'Rèn luyện sức khoẻ', 'Đọc tài liệu', 'Mua sắm', 'Backup dữ liệu', 'Học từ vựng', 'Dọn góc làm việc', 'Hoàn thành bài tập', 'Gửi email']
    const tasks = demos.map((title, i) => ({ id: Date.now() + i, title, description: 'Dữ liệu mẫu cục bộ', due_date: today(), priority: ['low','medium','high'][i % 3], status: i % 3 === 0 ? 'done' : i % 3 === 1 ? 'in_progress' : 'todo', category: ['Học tập','Công việc','Cá nhân'][i % 3] }))
    write(tasks); return tasks
  }
}
export async function getStats() {
  try { return await api('/stats') }
  catch {
    const all = read(); const total = all.length; const done = all.filter(t => t.status === 'done').length
    return { total, done, completionRate: total ? Math.round(done / total * 100) : 0, highOpen: all.filter(t => t.priority === 'high' && t.status !== 'done').length,
      last7: Array.from({length:7}, (_,i) => { const d=new Date(); d.setDate(d.getDate()-6+i); const date=d.toISOString().slice(0,10); const ts=all.filter(t=>t.due_date===date); return {date,day:d.toLocaleDateString('vi-VN',{weekday:'short'}),completed:ts.filter(t=>t.status==='done').length,incomplete:ts.filter(t=>t.status!=='done').length}}),
      categories:['Học tập','Công việc','Cá nhân'].map(name=>({name,value:all.filter(t=>t.category===name).length})) }
  }
}
export async function isBackendAvailable() { try { await api('/tasks'); return true } catch { return false } }
