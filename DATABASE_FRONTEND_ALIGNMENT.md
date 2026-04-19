# 📊 Bổ Sung Database - Frontend: Chi Tiết Thay Đổi

## 🔍 **So Sánh Database vs Frontend**

### **Database Fields** (videos table)
```sql
id, title, url, transcript, channel_id, topic_id, 
difficulty, duration, words_highlighted, status
```

### **Trước Cập Nhật** ❌
| Field | Backend | Frontend | Status |
|-------|---------|----------|--------|
| title | ✅ | ✅ Hiển thị | Xong |
| duration | ❌ Hardcoded "—" | ❌ Hiển thị "—" | Sai |
| difficulty | ❌ Hardcoded "Trung bình" | ❌ Không hiển thị | Sai |
| words_highlighted | ❌ Không trong DTO | ❌ Không hiển thị | Thiếu |
| transcript | ❌ Không trong DTO | ❌ Không hiển thị | Thiếu |
| status | ❌ Không trong DTO | ❌ Không filters | Thiếu |

### **Sau Cập Nhật** ✅
| Field | Backend | Frontend | Status |
|-------|---------|----------|--------|
| title | ✅ | ✅ Hiển thị | ✅ Xong |
| duration | ✅ Từ Entity | ✅ Hiển thị thực | ✅ Xong |
| difficulty | ✅ Từ Entity | ✅ Badge màu | ✅ Xong |
| words_highlighted | ✅ Trong DTO | ✅ Badge count | ✅ Xong |
| transcript | ✅ Trong DTO | ⏳ Cho VideoWatch | ✅ Có sẵn |
| status | ✅ Trong DTO | ⏳ Cho filter | ✅ Có sẵn |

---

## 🔧 **Chi Tiết Thay Đổi**

### **1. Backend: Video.java Entity** ✅
**Thêm vào:**
```java
@Column(name = "difficulty")
public String difficulty;

@Column(name = "duration")
public String duration;

@Column(name = "words_highlighted")
public Integer wordsHighlighted;

@Column(name = "status")
public String status;
```

**Lý do:** Map tất cả columns từ database table

---

### **2. Backend: UserVideoDto** ✅
**Thêm vào:**
```java
public record UserVideoDto(
    Long id,
    String title,
    String youtubeUrl,
    Long channelId,
    String channelName,
    Long topicId,
    String topicName,
    String duration,           // ← Mới
    String difficulty,         // ← Mới
    String transcript,         // ← Mới
    Integer wordsHighlighted,  // ← Mới
    String status             // ← Mới
)
```

**Lý do:** Frontend cần các fields này để hiển thị

---

### **3. Backend: UserVideoService.toVideoDto()** ✅
**Sửa từ:**
```java
return new UserVideoDto(
    video.id,
    video.title,
    video.url,
    video.channel?.id,
    video.channel?.name,
    video.topic?.id,
    video.topic?.name,
    "—",              // ❌ Hardcoded
    "Trung bình"      // ❌ Hardcoded
);
```

**Sửa thành:**
```java
return new UserVideoDto(
    video.id,
    video.title,
    video.url,
    video.channel?.id,
    video.channel?.name,
    video.topic?.id,
    video.topic?.name,
    defaultString(video.duration, "—"),              // ✅ Từ entity
    defaultString(video.difficulty, "Trung bình"),  // ✅ Từ entity
    defaultString(video.transcript, ""),             // ✅ Mới
    video.wordsHighlighted != null ? 
        video.wordsHighlighted : 0,                  // ✅ Mới
    defaultString(video.status, "Hoạt động")        // ✅ Mới
);
```

**Lý do:** Dùng giá trị thực từ DB thay vì hardcode

---

### **4. Frontend: VideoChannel.jsx** ✅

#### **4a. Thêm difficulty + word count vào transformedChannel**
```javascript
videoList: data.videos.map(video => ({
    id: video.id,
    title: video.title,
    duration: video.duration || '—',
    difficulty: video.difficulty || 'Trung bình',  // ← Mới
    wordsHighlighted: video.wordsHighlighted || 0, // ← Mới
}))
```

#### **4b. Thêm helper function getDifficultyColor()**
```javascript
const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
        case 'cơ bản':
        case 'a1':
        case 'a2':
            return '#22c55e'  // Xanh lá
        case 'trung bình':
        case 'b1':
        case 'b2':
            return '#f59e0b'  // Vàng cam
        case 'nâng cao':
        case 'c1':
        case 'c2':
            return '#ef4444'  // Đỏ
        default:
            return '#6b7280'  // Xám
    }
}
```

**Lý do:** Hiển thị màu khác nhau tùy độ khó

#### **4c. Thêm Difficulty Badge + Word Count Badge vào video card**
```jsx
<div className="channel-video-card__media-wrap">
    <img src={item.thumbnail} alt={item.title} />
    <span className="channel-video-card__duration">{item.duration}</span>
    
    {/* Difficulty badge - top right */}
    <div style={{
        position: 'absolute',
        top: '8px',
        right: '8px',
        backgroundColor: getDifficultyColor(item.difficulty),
        color: 'white',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: '600'
    }}>
        {item.difficulty}
    </div>
    
    {/* Word count badge - bottom right */}
    {item.wordsHighlighted > 0 && (
        <div style={{
            position: 'absolute',
            bottom: '8px',
            right: '8px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white'
        }}>
            {item.wordsHighlighted} từ
        </div>
    )}
</div>
```

---

## 📺 **UI Thay Đổi**

### Trước:
```
┌─────────────────────┐
│   [Video Thumbnail] │
│   📺 12:34          │
│                     │
│ Video Title         │
│ —                   │
└─────────────────────┘
```

### Sau:
```
┌─────────────────────┐
│   [Video Thumbnail] │
│ [Trung bình]    📺  │  ← Difficulty badge (trên phải)
│         12:34       │  ← Duration (dưới trái)
│                     │
│ Video Title      15  │  ← Word count (dưới phải)
│                từ    │
│ —                   │
└─────────────────────┘
```

---

## 🗄️ **Database Data Sample**

Đã có trong `database.sql`:

| Video | Duration | Difficulty | Words | Status |
|-------|----------|-----------|-------|--------|
| Pronunciation | 12:34 | Trung bình | 15 | Hoạt động |
| BBC Learning | 08:45 | Cơ bản | 8 | Hoạt động |
| Mistakes | 15:20 | Trung bình | 12 | Hoạt động |
| Phrasal Verbs | 18:50 | Nâng cao | 20 | Hoạt động |

---

## ✅ **Checklist Cập Nhật**

- ✅ Video.java: Thêm 4 fields mới
- ✅ UserVideoDto: Thêm 5 fields mới  
- ✅ UserVideoService: Cập nhật toVideoDto()
- ✅ VideoChannel.jsx: Thêm difficulty badge
- ✅ VideoChannel.jsx: Thêm word count badge
- ✅ VideoChannel.jsx: Thêm color mapping function
- ✅ Database: Có dữ liệu sample

---

## 🚀 **Để Sử Dụng:**

1. **Rebuild Backend**
   ```bash
   cd backend
   mvn clean install
   mvnw.cmd spring-boot:run
   ```

2. **Reload Frontend** (F5 browser)

3. **Xem kết quả:**
   - Vào `/video` → click kênh
   - Sẽ thấy difficulty badge + word count trên mỗi video
   - Duration sẽ là giá trị thực (12:34 thay vì —)

---

## 🎯 **Lợi Ích**

| Trước | Sau |
|-------|-----|
| Duration: "—" | Duration: "12:34" |
| Không biết độ khó | Difficulty badge: Xanh/Cam/Đỏ |
| Không biết số từ | Word count: "15 từ" |
| Data không match DB | Data 100% từ DB |

---

## 📝 **Để Mở Rộng Sau**

Có thể thêm:
1. Filter theo difficulty
2. Sort theo word count
3. Hiển thị transcript trên VideoWatch page
4. Filter theo status (chỉ hiển thị "Hoạt động")

Tất cả fields đã sẵn sàng trong DTO! 🎉
