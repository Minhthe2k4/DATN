# Hướng Dẫn Tính Năng Video - Backend & Frontend

## 📋 Tóm Tắt Những Gì Đã Thực Hiện

### Backend (Java Spring Boot)

#### 1. **DTOs Mới** (Cho phép truyền dữ liệu từ server về client)
- `UserVideoDto` - Thông tin video đơn giản
- `UserVideoChannelDto` - Thông tin kênh cơ bản
- `VideoChannelWithVideosDto` - Kênh cùng danh sách video

**Vị trí:** `backend/src/main/java/com/example/DATN/dto/`

#### 2. **Service Mới** - UserVideoService
Service này xử lý tất cả nghiệp vụ lấy dữ liệu video cho người dùng thường:
- `getAllChannels()` - Lấy tất cả kênh
- `getChannelWithVideos(channelId)` - Lấy kênh và video
- `getVideoById(videoId)` - Lấy video theo ID
- `getVideosByTopic(topicId)` - Lấy video theo chủ đề

**Vị trí:** `backend/src/main/java/com/example/DATN/service/UserVideoService.java`

#### 3. **Controller Mới** - UserVideoController
Các API public mà frontend có thể gọi (không cần admin):
```
GET /api/videos/channels - Lấy tất cả kênh
GET /api/videos/channels/{channelId} - Chi tiết kênh + video
GET /api/videos - Lấy tất cả video
GET /api/videos/{videoId} - Lấy video theo ID
GET /api/videos/topic/{topicId} - Video theo chủ đề
```

**Vị trí:** `backend/src/main/java/com/example/DATN/controller/UserVideoController.java`

#### 4. **Repository Update**
Cập nhật `VideoRepository` để thêm phương thức:
- `findByChannel(YouTubeChannel)` - Tìm video theo kênh
- `findByTopicId(Long)` - Tìm video theo topic

#### 5. **Sample Data**
Thêm dữ liệu mẫu vào database:
- **5 kênh YouTube sample** (English Addict, BBC Learning English, v.v.)
- **8 video sample** liên kết với các kênh

**Vị trí:** `database/database.sql`

---

### Frontend (React)

#### 1. **API Service** - videoApi.js
File này chứa tất cả hàm gọi API từ frontend:
```javascript
fetchAllVideoChannels()
fetchChannelWithVideos(channelId)
fetchAllVideos()
fetchVideoById(videoId)
fetchVideosByTopic(topicId)
```

**Vị trí:** `frontend/src/user/utils/videoApi.js`

#### 2. **Video.jsx - Cập Nhật**
- Thay thế dữ liệu hardcoded bằng API call
- Thêm `useEffect` để tải channels
- Thêm trạng thái loading
- Fallback về dữ liệu mặc định nếu API lỗi

**Vị trí:** `frontend/src/user/pages/video/Video.jsx`

#### 3. **VideoChannel.jsx - Cập Nhật**
- Tải dữ liệu kênh và danh sách video từ API
- Hiển thị loading state
- Xử lý lỗi gracefully
- Vẫn giữ fallback dữ liệu cũ

**Vị trị:** `frontend/src/user/pages/video/VideoChannel.jsx`

---

## 🚀 Hướng Dẫn Sử Dụng

### 1. Chuẩn Bị Database

Chạy SQL script để thêm dữ liệu mẫu (nếu chưa có):
```sql
-- Chạy file database/database.sql hoặc update bằng cách:
-- 1. Mở MySQL client
-- 2. use vocab_learning;
-- 3. Chạy các INSERT statements từ database.sql
```

### 2. Khởi Động Backend

```bash
cd backend

# Nếu lần đầu:
mvn spring-boot:run

# Hoặc:
./mvnw spring-boot:run (trên Windows: ./mvnw.cmd spring-boot:run)
```

**Kiểm tra:** Server sẽ chạy trên `http://localhost:8080`

### 3. Khởi Động Frontend

```bash
cd frontend

# Cài dependencies (nếu chưa có):
npm install

# Chạy dev server:
npm run dev
```

**Kiểm tra:** Frontend sẽ chạy trên `http://localhost:5173` (hoặc port khác)

---

## 🧪 Cách Test Tính Năng

### Test 1: Kiểm Tra API Trực Tiếp

```bash
# Mở terminal hoặc Postman

# 1. Lấy tất cả kênh
curl http://localhost:8080/api/videos/channels

# 2. Lấy chi tiết kênh (ID = 1)
curl http://localhost:8080/api/videos/channels/1

# 3. Lấy tất cả video
curl http://localhost:8080/api/videos

# 4. Lấy video theo ID
curl http://localhost:8080/api/videos/1

# 5. Lấy video theo topic
curl http://localhost:8080/api/videos/topic/3
```

### Test 2: Kiểm Tra Frontend

1. **Trang Video của User**
   - Vào `http://localhost:5173/video`
   - Xem có hiển thị 5 kênh video không
   - Thống kê "5 kênh" và số video phải chính xác

2. **Chi Tiết Kênh**
   - Click vào một kênh (vd: English Addict)
   - URL sẽ thành `/video/englishaddict`
   - Sẽ hiển thị danh sách video của kênh đó

3. **Xem Chi Tiết Video**
   - Click vào một video
   - Sẽ vào trang chi tiết video

---

## 📊 Data Flow Sơ Đồ

```
Frontend (React)
    ↓
    User clicks /video page
    ↓ 
    fetchAllVideoChannels() ← API Service (videoApi.js)
    ↓
    GET /api/videos/channels ← Network Request
    ↓
Backend (Spring Boot)
    ↓
    UserVideoController.getAllChannels()
    ↓
    UserVideoService.getAllChannels()
    ↓ 
    VideoRepository.findAll()
    ↓
    Database (MySQL)
    ↓
    Returns JSON with channel data
    ↓
Frontend receives data
    ↓
    Transform & display on UI
```

---

## 📝 Code Structure (Dễ Hiểu)

### Backend Service Example:
```java
@Service
public class UserVideoService {
    
    // Đơn giản: gọi repo, lấy data, convert thành DTO
    public List<UserVideoChannelDto> getAllChannels() {
        List<YouTubeChannel> channels = youTubeChannelRepository.findAll();
        return channels.stream()
                .map(this::toChannelDto)
                .toList();
    }
    
    // Chuyển entity thành DTO dễ dàng
    private UserVideoChannelDto toChannelDto(YouTubeChannel channel) {
        return new UserVideoChannelDto(
                channel.id,
                channel.name,
                channel.url,
                // ... thêm các field khác
        );
    }
}
```

### Frontend Service Example:
```javascript
// Đơn giản: fetch từ API, xử lý lỗi
export const fetchAllVideoChannels = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/videos/channels`);
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};
```

### Frontend Component Example:
```javascript
export function Video() {
    const [channels, setChannels] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    
    useEffect(() => {
        // Khi component mount, gọi API
        fetchAllVideoChannels()
            .then(data => setChannels(data))
            .catch(err => console.error(err))
            .finally(() => setIsLoading(false))
    }, [])
    
    if (isLoading) return <p>Đang tải...</p>
    
    return (
        <div>
            {channels.map(channel => (
                // Hiển thị channel
            ))}
        </div>
    )
}
```

---

## 🔧 Các Nâng Cấp Có Thể Thêm Sau

1. **Pagination** - Thêm phân trang cho danh sách video
2. **Search** - Tìm kiếm video theo từ khóa
3. **Filter** - Lọc video theo độ khó (difficulty)
4. **Like/Save** - Lưu video yêu thích
5. **Watch History** - Lưu lịch sử xem
6. **Comments** - Bình luận video
7. **Transcript Sync** - Phụ đề đồng bộ khi xem

---

## ❓ Troubleshooting

### Vấn đề: Frontend không kết nối Backend
**Giải pháp:**
1. Kiểm tra backend đang chạy trên port 8080
2. Kiểm tra `.env` file có `VITE_API_BASE_URL` đúng không
3. Kiểm tra CORS settings trong backend (nếu cần)

### Vấn đề: Data không hiển thị
**Giải pháp:**
1. Check browser console có lỗi không
2. Kiểm tra database có dữ liệu không
3. Kiểm tra API endpoint bằng curl/Postman

### Vấn đề: Loading mãi không xong
**Giải pháp:**
1. Kiểm tra API response time
2. Kiểm tra network tab trong DevTools
3. Kiểm tra browser console có lỗi không

---

## 📚 File Được Tạo/Cập Nhật

**Backend:**
- ✅ `UserVideoDto.java` (Mới)
- ✅ `UserVideoChannelDto.java` (Mới)
- ✅ `VideoChannelWithVideosDto.java` (Mới)
- ✅ `UserVideoService.java` (Mới)
- ✅ `UserVideoController.java` (Mới)
- ✅ `VideoRepository.java` (Cập nhật - thêm phương thức)

**Frontend:**
- ✅ `videoApi.js` (Mới)
- ✅ `Video.jsx` (Cập nhật)
- ✅ `VideoChannel.jsx` (Cập nhật)

**Database:**
- ✅ `database.sql` (Cập nhật - thêm sample data)

---

## 💡 Tips

- Dùng React DevTools để debug state
- Dùng Network tab trong DevTools để xem API requests
- Dùng MySQL Workbench hoặc DBeaver để xem database
- Dùng Postman để test API trực tiếp

---

**Chúc bạn thành công! 🎉**
