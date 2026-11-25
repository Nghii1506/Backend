import http from 'node:http'
import { URL } from 'node:url'
import db, { todayISO, seedTasks } from './db.js'

const validPriority = ['low', 'medium', 'high']
const validStatus = ['todo', 'in_progress', 'done']

function send(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
  })
  res.end(data === undefined ? '' : JSON.stringify(data))
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', chunk => {
      body += chunk
      if (body.length > 1_000_000) {
        reject(new Error('Request quá lớn'))
        req.destroy()
      }
    })
    req.on('end', () => {
      if (!body) return resolve({})
      try { resolve(JSON.parse(body)) } catch { reject(new Error('JSON không hợp lệ')) }
    })
  })
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost:5000')
  const path = url.pathname

  if (req.method === 'OPTIONS') {
    return send(res, 204)
  }

  try {
    if (req.method === 'GET' && path === '/api/tasks') {
      const clauses = []
      const params = {}
      if (url.searchParams.get('date') === 'today') {
        clauses.push('due_date = @today')
        params.today = todayISO()
      }
      if (url.searchParams.get('search')) {
        clauses.push('(title LIKE @search OR description LIKE @search)')
        params.search = `%${url.searchParams.get('search')}%`
      }
      if (url.searchParams.get('status')) {
        clauses.push('status = @status')
        params.status = url.searchParams.get('status')
      }
      if (url.searchParams.get('priority')) {
        clauses.push('priority = @priority')
        params.priority = url.searchParams.get('priority')
      }
      const date = url.searchParams.get('date')
      if (date && date !== 'today') {
        clauses.push('due_date = @date')
        params.date = date
      }
      const sql = `SELECT * FROM tasks${clauses.length ? ` WHERE ${clauses.join(' AND ')}` : ''} ORDER BY CASE WHEN status='done' THEN 1 ELSE 0 END, CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END, due_date DESC, id DESC`
      const stmt = db.prepare(sql)
      return send(res, 200, Object.keys(params).length ? stmt.all(params) : stmt.all())
    }

    if (req.method === 'POST' && path === '/api/tasks') {
      const body = await readJson(req)
      const title = typeof body.title === 'string' ? body.title.trim() : ''
      const description = body.description ?? ''
      const due_date = body.due_date ?? todayISO()
      const priority = body.priority ?? 'medium'
      const status = body.status ?? 'todo'
      const category = body.category ?? 'Cá nhân'
      if (!title) return send(res, 400, { error: 'Tiêu đề là bắt buộc' })
      if (!/^\d{4}-\d{2}-\d{2}$/.test(due_date)) return send(res, 400, { error: 'due_date phải có định dạng YYYY-MM-DD' })
      if (!validPriority.includes(priority) || !validStatus.includes(status)) return send(res, 400, { error: 'priority hoặc status không hợp lệ' })
      const result = db.prepare(`INSERT INTO tasks(title,description,due_date,priority,status,category) VALUES (?,?,?,?,?,?)`).run(title, description, due_date, priority, status, category)
      return send(res, 201, db.prepare('SELECT * FROM tasks WHERE id=?').get(result.lastInsertRowid))
    }

    const taskMatch = path.match(/^\/api\/tasks\/([^/]+)$/)
    if (taskMatch) {
      const id = Number(taskMatch[1])
      if (!Number.isInteger(id)) return send(res, 400, { error: 'ID không hợp lệ' })

      if (req.method === 'PUT') {
        const body = await readJson(req)
        const current = db.prepare('SELECT * FROM tasks WHERE id=?').get(id)
        if (!current) return send(res, 404, { error: 'Không tìm thấy công việc' })
        const next = {
          title: body.title ?? current.title,
          description: body.description ?? current.description,
          due_date: body.due_date ?? current.due_date,
          priority: body.priority ?? current.priority,
          status: body.status ?? current.status,
          category: body.category ?? current.category
        }
        if (typeof next.title !== 'string' || !next.title.trim()) return send(res, 400, { error: 'Tiêu đề là bắt buộc' })
        if (!validPriority.includes(next.priority) || !validStatus.includes(next.status)) return send(res, 400, { error: 'priority hoặc status không hợp lệ' })
        if (!/^\d{4}-\d{2}-\d{2}$/.test(next.due_date)) return send(res, 400, { error: 'due_date phải có định dạng YYYY-MM-DD' })
        db.prepare(`UPDATE tasks SET title=?,description=?,due_date=?,priority=?,status=?,category=? WHERE id=?`).run(next.title.trim(), next.description, next.due_date, next.priority, next.status, next.category, id)
        return send(res, 200, db.prepare('SELECT * FROM tasks WHERE id=?').get(id))
      }

      if (req.method === 'DELETE') {
        const result = db.prepare('DELETE FROM tasks WHERE id=?').run(id)
        if (!result.changes) return send(res, 404, { error: 'Không tìm thấy công việc' })
        return send(res, 204)
      }
    }

    if (req.method === 'POST' && path === '/api/tasks/seed') {
      return send(res, 200, seedTasks(true))
    }

    if (req.method === 'GET' && path === '/api/stats') {
      const all = db.prepare('SELECT * FROM tasks').all()
      const total = all.length
      const done = all.filter(task => task.status === 'done').length
      const completionRate = total ? Math.round(done / total * 100) : 0
      const highOpen = all.filter(task => task.priority === 'high' && task.status !== 'done').length
      const last7 = Array.from({ length: 7 }, (_, i) => {
        const date = todayISO(i - 6)
        const tasks = all.filter(task => task.due_date === date)
        return {
          date,
          day: new Date(`${date}T00:00:00`).toLocaleDateString('vi-VN', { weekday: 'short' }),
          completed: tasks.filter(task => task.status === 'done').length,
          incomplete: tasks.filter(task => task.status !== 'done').length
        }
      })
      const categories = ['Học tập', 'Công việc', 'Cá nhân'].map(name => ({
        name,
        value: all.filter(task => task.category === name).length
      }))
      const priorities = ['low', 'medium', 'high'].map(name => ({
        name,
        value: all.filter(task => task.priority === name).length
      }))
      return send(res, 200, { total, done, completionRate, highOpen, last7, categories, priorities })
    }

    return send(res, 404, { error: 'API không tồn tại' })
  } catch (error) {
    console.error(error)
    return send(res, error.message === 'JSON không hợp lệ' ? 400 : 500, { error: error.message || 'Lỗi máy chủ' })
  }
})

server.listen(5000, '0.0.0.0', () => {
  console.log('Server chạy tại http://localhost:5000')
})
