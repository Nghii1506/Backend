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

CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_status ON tasks(status);

INSERT INTO tasks (title, description, due_date, priority, status, category) VALUES
('Hoàn thành bài tập React', 'Luyện hooks và state', date('now'), 'high', 'in_progress', 'Học tập'),
('Chuẩn bị cuộc họp dự án', 'Tổng hợp tiến độ', date('now'), 'high', 'todo', 'Công việc'),
('Đi bộ 30 phút', 'Duy trì sức khoẻ', date('now'), 'low', 'done', 'Cá nhân'),
('Đọc tài liệu Tailwind', 'Nghiên cứu responsive', date('now','-1 day'), 'medium', 'done', 'Học tập'),
('Gửi email khách hàng', 'Cập nhật timeline', date('now','-2 day'), 'medium', 'done', 'Công việc'),
('Mua đồ tạp hoá', 'Thực phẩm cuối tuần', date('now','-3 day'), 'low', 'done', 'Cá nhân'),
('Luyện từ vựng tiếng Anh', 'Ôn 20 từ chủ đề công nghệ', date('now','-4 day'), 'medium', 'todo', 'Học tập'),
('Backup dữ liệu', 'Sao lưu tài liệu', date('now','-5 day'), 'high', 'done', 'Cá nhân'),
('Kiểm tra bug đăng nhập', 'Test luồng xác thực', date('now','-6 day'), 'high', 'todo', 'Công việc'),
('Rửa xe cuối tuần', 'Vệ sinh xe', date('now','-7 day'), 'low', 'done', 'Cá nhân');
