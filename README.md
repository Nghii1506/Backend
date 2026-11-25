Xây dựng ứng dụng quản lý công việc cá nhân (Personal TODO App) bằng React, Tailwind CSS, Lucide Icons và Recharts.
Giao diện hiện đại, hỗ trợ tiếng Việt, gồm 2 trang điều hướng chính:

1. Trang "Công việc hôm nay":
- Hiển thị ngày hôm nay và thanh tiến độ hoàn thành (ví dụ: 3/6 công việc).
- Thanh công cụ gồm: Ô tìm kiếm (Search theo tiêu đề/mô tả) + Bộ lọc (Filter theo Trạng thái: Tất cả/Chưa làm/Đang làm/Hoàn thành và Mức ưu tiên: Tất cả/Cao/Trung bình/Thấp).
- Form/Modal Thêm, Sửa task và nút Xóa task (có xác nhận). Các trường dữ liệu: id, title, description, due_date (mặc định hôm nay), priority (low/medium/high), status (todo/in_progress/done), category (Học tập/Công việc/Cá nhân).
- Tích hợp nút "Nạp dữ liệu mẫu (Mock Data)" để tạo nhanh 10 task mẫu.

2. Trang "Thống kê":
- 4 thẻ KPI: Tổng task, Đã hoàn thành, Tỷ lệ hoàn thành (%) và công việc ưu tiên cao chưa xong.
- Biểu đồ cột: So sánh công việc hoàn thành và chưa hoàn thành trong 7 ngày gần nhất.
- Biểu đồ tròn: Phân bổ công việc theo danh mục.

---

# Personal TODO App

Ứng dụng quản lý công việc cá nhân chạy hoàn toàn local, hỗ trợ tiếng Việt, CRUD công việc, lọc/tìm kiếm, thống kê trực quan và chế độ dự phòng localStorage khi backend chưa được khởi động.

## Tính năng chính

- Quản lý công việc: thêm, sửa, xóa và đánh dấu nhanh hoàn thành.
- Tìm kiếm theo tiêu đề/mô tả với bộ lọc trạng thái và mức ưu tiên.
- Tự động lưu dữ liệu trong SQLite và hiển thị tiến độ công việc trong ngày.
- Nạp dữ liệu mẫu bằng API hoặc lưu localStorage khi frontend chạy riêng.
- Thống kê tổng quan bằng 4 KPI, biểu đồ cột và biểu đồ tròn Recharts.
- Giao diện responsive cho máy tính, máy tính bảng và điện thoại.

## Công nghệ sử dụng

### Frontend
- React 18
- Vite
- Tailwind CSS
- Lucide React
- Recharts

### Backend
- Node.js
- Express
- SQLite
- better-sqlite3

## Thiết kế Database

Database mặc định nằm tại `server/todo.db`. Cấu trúc cũng được mô tả trong `database/schema.sql`.

```sql
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
```

- `tasks.id`: khóa chính, tự tăng.
- `tasks.title`: tiêu đề bắt buộc.
- `tasks.description`: mô tả không bắt buộc.
- `tasks.due_date`: ngày thực hiện dạng `YYYY-MM-DD`.
- `tasks.priority`: low, medium hoặc high.
- `tasks.status`: todo, in_progress hoặc done.
- `tasks.category`: Học tập, Công việc hoặc Cá nhân.
- `tasks.created_at`: thời điểm tạo theo giờ database.

Database tự tạo bảng và tự nạp khoảng 10 công việc mẫu nếu bảng đang trống.

## API Backend

- `GET /api/tasks` - hỗ trợ `date=today`, `search`, `status`, `priority`.
- `POST /api/tasks` - tạo công việc.
- `PUT /api/tasks/:id` - cập nhật công việc hoặc trạng thái.
- `DELETE /api/tasks/:id` - xóa công việc.
- `POST /api/tasks/seed` - nạp thêm dữ liệu mẫu.
- `GET /api/stats` - lấy KPI, dữ liệu 7 ngày và phân bổ danh mục.

## Cài đặt

Yêu cầu: Node.js 18 trở lên.

```powershell
cd "C:\Users\UEH\Desktop\Backend"
npm run install:all
npm run dev
```

Sau đó mở:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

Cài đặt riêng lẻ khi cần:

```powershell
npm install --prefix server
npm install --prefix client
npm run dev --prefix server
npm run dev --prefix client
```

Build frontend:

```powershell
npm run build
```

## Fallback localStorage

Nếu backend ở cổng 5000 không thể truy cập, frontend tự chuyển sang lưu trữ trình duyệt bằng key `personal-todo-fallback` và hiển thị thông báo góc màn hình. Dữ liệu sẽ trở lại SQLite khi backend khởi động lại.

## Prompt Vibe Code đã dùng

Nguyên văn yêu cầu phát triển:

> Hãy khởi tạo và xây dựng hoàn chỉnh một dự án web quản lý công việc cá nhân (Personal TODO App) bằng React (Vite) + Tailwind CSS + Lucide React + Recharts ở frontend và Node.js + Express + SQLite (better-sqlite3) ở backend. Hãy tự động tạo cấu trúc thư mục, toàn bộ code frontend/backend, bảng tasks trong server/todo.db, dữ liệu mẫu, schema SQL, API CRUD và thống kê, giao diện tiếng Việt responsive hai tab, chế độ fallback localStorage, README và hướng dẫn chạy cài đặt local.

Prompt chi tiết gồm các yêu cầu sau:

1. Tạo cấu trúc `client/`, `server/`, `database/schema.sql` và `README.md`.
2. Tạo bảng tasks với đầy đủ `id`, `title`, `description`, `due_date`, `priority`, `status`, `category`, `created_at` và dữ liệu mẫu khi bảng trống.
3. Xây API Express cổng 5000 cho danh sách, tạo, sửa, xóa, seed và thống kê.
4. Xây giao diện React hai tab “Công việc hôm nay” và “Thống kê”, modal CRUD, filter, tìm kiếm, tiến độ, các badge và fallback localStorage.
5. Thêm Recharts cho biểu đồ cột 7 ngày và biểu đồ tròn theo danh mục.
6. Viết tài liệu tiếng Việt gồm công nghệ, database, hướng dẫn cài đặt/chạy và ghi lại toàn bộ prompt đã sử dụng.