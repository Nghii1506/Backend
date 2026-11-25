import { DatabaseSync } from 'node:sqlite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const sqlite = new DatabaseSync(path.join(__dirname, 'todo.db'))
sqlite.exec('PRAGMA foreign_keys = ON')

sqlite.exec(`
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  due_date TEXT NOT NULL,
  priority TEXT CHECK(priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  status TEXT CHECK(status IN ('todo', 'in_progress', 'done')) DEFAULT 'todo',
  category TEXT DEFAULT 'Cá nhân',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
`)

function expandNamedParams(args) {
  return args.map(arg => {
    if (!arg || typeof arg !== 'object' || Array.isArray(arg)) return arg
    const expanded = { ...arg }
    for (const [key, value] of Object.entries(arg)) {
      expanded[`@${key}`] = value
      expanded[`:${key}`] = value
      expanded[`$${key}`] = value
    }
    return expanded
  })
}

function normalizeStatement(statement) {
  return {
    all(...args) {
      const normalized = expandNamedParams(args)
      return normalized.length ? statement.all(...normalized) : statement.all()
    },
    get(...args) {
      const normalized = expandNamedParams(args)
      return normalized.length ? statement.get(...normalized) : statement.get()
    },
    run(...args) {
      const normalized = expandNamedParams(args)
      const result = normalized.length ? statement.run(...normalized) : statement.run()
      return {
        changes: Number(result.changes),
        lastInsertRowid: Number(result.lastInsertRowid)
      }
    }
  }
}

const db = {
  exec(sql) {
    sqlite.exec(sql)
  },
  pragma(sql) {
    sqlite.exec(`PRAGMA ${sql}`)
  },
  prepare(sql) {
    return normalizeStatement(sqlite.prepare(sql))
  },
  close() {
    sqlite.close()
  }
}

export function todayISO(offset = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function getMockTasks() {
  const titles = [
    ['Hoàn thành bài tập React', 'Làm các bài luyện tập về hooks và state', 'Học tập', 'high'],
    ['Chuẩn bị cuộc họp dự án', 'Tổng hợp tiến độ và slide báo cáo', 'Công việc', 'high'],
    ['Đi bộ 30 phút', 'Duy trì sức khoẻ buổi tối', 'Cá nhân', 'low'],
    ['Đọc tài liệu Tailwind', 'Nghiên cứu layout và responsive', 'Học tập', 'medium'],
    ['Gửi email khách hàng', 'Cập nhật timeline dự án', 'Công việc', 'medium'],
    ['Mua đồ tạp hoá', 'Chuẩn bị thực phẩm cho cuối tuần', 'Cá nhân', 'low'],
    ['Luyện từ vựng tiếng Anh', 'Ôn 20 từ vựng chủ đề công nghệ', 'Học tập', 'medium'],
    ['Backup dữ liệu', 'Sao lưu tài liệu làm việc quan trọng', 'Cá nhân', 'high'],
    ['Kiểm tra bug đăng nhập', 'Test các luồng xác thực', 'Công việc', 'high'],
    ['Rửa xe cuối tuần', 'Vệ sinh nội và ngoại thất', 'Cá nhân', 'low']
  ]
  return titles.map(([title, description, category, priority], i) => ({
    title,
    description,
    category,
    priority,
    due_date: todayISO(i < 3 ? 0 : i - 3),
    status: i % 3 === 0 ? 'done' : i % 3 === 1 ? 'in_progress' : 'todo'
  }))
}

export function seedTasks(extra = false) {
  const count = db.prepare('SELECT COUNT(*) AS count FROM tasks').get().count
  if (extra || count === 0) {
    const insert = db.prepare(`INSERT INTO tasks (title,description,due_date,priority,status,category) VALUES (?, ?, ?, ?, ?, ?)`)
    sqlite.exec('BEGIN')
    try {
      for (const row of getMockTasks()) {
        insert.run(row.title, row.description, row.due_date, row.priority, row.status, row.category)
      }
      sqlite.exec('COMMIT')
    } catch (error) {
      sqlite.exec('ROLLBACK')
      throw error
    }
  }
  return db.prepare('SELECT * FROM tasks ORDER BY due_date DESC, id DESC').all()
}

export default db
seedTasks()
