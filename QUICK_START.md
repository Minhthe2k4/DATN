# ⚡ Hướng Dẫn Nhanh - Chạy Tính Năng Video

## ✅ Danh Sách Kiểm Tra

### 1️⃣ **Chuẩn Bị Database** (5 phút)
```sql
-- Mở MySQL Workbench hoặc terminal MySQL
-- Chạy lệnh:
use vocab_learning;

-- Sau đó, tìm và chạy các INSERT statements từ:
-- File: database/database.sql (dòng youtube_channels và videos)
```

**Hoặc** - Nếu bạn muốn chạy toàn bộ SQL:
```bash
mysql -u root -p vocab_learning < database/database.sql
```

### 2️⃣ **Build Backend** (3 phút)
```bash
cd backend

# Windows
mvnw.cmd spring-boot:run

# macOS/Linux
mvn spring-boot:run
```

✅ Bạn sẽ thấy log: `Started Application in X seconds`

### 3️⃣ **Build Frontend** (2 phút)
```bash
cd frontend

npm install  # (chỉ lần đầu nếu chưa cài)
npm run dev
```

✅ Bạn sẽ thấy: `VITE v... ready in X ms`

### 4️⃣ **Test**

1. **Mở Browser:**
   ```
   http://localhost:5173/video
   ```

2. **Xem kết quả:**
   - ✅ Nên thấy 5 kênh video
   - ✅ Nên thấy thống kê "5 kênh" và "8+ videos"
   - ✅ Click vào kênh → xem 8 video

---

## 🧪 Test API Trực Tiếp (Optional)

Mở terminal mới và chạy:

```bash
# 1. Lấy tất cả kênh
curl http://localhost:8080/api/videos/channels

# 2. Lấy chi tiết kênh (ID=1)
curl http://localhost:8080/api/videos/channels/1

# 3. Lấy tất cả video
curl http://localhost:8080/api/videos

# 4. Lấy video theo topic
curl http://localhost:8080/api/videos/topic/3
```

---

## 📂 File Quan Trọng

### Backend
- `UserVideoService.java` - Logic lấy data
- `UserVideoController.java` - API endpoints
- `VideoRepository.java` - Database queries

### Frontend  
- `videoApi.js` - Gọi API
- `Video.jsx` - Trang chọn kênh
- `VideoChannel.jsx` - Trang xem video

### Database
- `database.sql` - Sample data

---

## ❌ Nếu Có Lỗi

| Lỗi | Giải Pháp |
|---|---|
| Backend không chạy | Check port 8080 có bị chiếm không |
| Frontend không connecting | Kiểm tra `VITE_API_BASE_URL` |
| Không hiển thị video | Kiểm tra MySQL có data không: `SELECT * FROM youtube_channels;` |
| Loading mãi không xong | Mở DevTools → Network tab → xem API response |

---

## 📊 Dữ Liệu Sample

**5 Kênh:**
1. English Addict (150K subscribers)
2. BBC Learning English (320K subscribers)
3. English Speeches (180K subscribers)
4. Espresso English (250K subscribers)
5. Learn English with Emma (520K subscribers)

**8 Videos** - Bổi sung cho kênh 1-4

---

## 🎯 Next Steps (Bổ Sung Sau)

- [ ] Thêm pagination
- [ ] Thêm search video
- [ ] Thêm filter theo difficulty
- [ ] Thêm like/save video
- [ ] Thêm watch history

---

**Bây giờ bạn có thể chạy và test! 🚀**
