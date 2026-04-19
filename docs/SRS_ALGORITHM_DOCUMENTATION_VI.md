# Tài liệu Thuật toán Lặp lại Ngắt quãng (SRS) tích cực Độ lưu loát (RT-SRS)

Tài liệu này mô tả chi tiết thuật toán **Spaced Repetition System (SRS)** được tích hợp yếu tố **Response Time (Tốc độ phản hồi)** để tính toán **"Thời điểm vàng"** (Next Review) trong hệ thống học từ vựng.

---

## 1. Cơ sở khoa học
Hệ thống sử dụng mô hình **Half-Life Regression (HLR)**, một phương pháp học máy được phát triển bởi các nhà khoa học dữ liệu tại Duolingo (Settles & Meeder, 2016). 

Khác với các thuật toán truyền thống (như Pimsleur hay SuperMemo-2) vốn chỉ dựa trên việc Đúng/Sai, mô hình này coi trí nhớ là một hàm suy giảm theo thời gian và cố gắng dự đoán **"Half-life" (h)** - tức là khoảng thời gian cần thiết để xác suất bạn nhớ được một từ giảm xuống còn 50%.

---

## 2. Công thức cốt lõi (HLR Model)

Hệ thống dự đoán xác suất nhớ ($P$) qua công thức:
$$P = 2^{-\Delta t / h}$$
Trong đó:
- $\Delta t$: Thời gian đã trôi qua kể từ lần ôn tập cuối.
- $h$: Half-life (độ bền của trí nhớ).

Để tính toán $h$, chúng ta sử dụng một hàm hồi quy tuyến tính $z$:
$$h = 2^z$$
$$z = \beta_0 + \beta_1 \cdot \text{streak} - \beta_2 \cdot \text{base\_diff} - \beta_3 \cdot \text{complexity} - \beta_4 \cdot \text{RT}_{\text{norm}}$$

---

## 3. Các biến số trong thuật toán (AI Features)

### A. Chuỗi trả lời đúng (Streak - $h$)
- Đây là biến số quan trọng nhất. Nếu bạn trả lời đúng liên tiếp nhiều lần, hệ thống sẽ tự động tăng khoảng cách ôn tập theo hàm mũ.

### B. Độ khó cơ bản (Base Difficulty - $d$)
- Được ánh xạ từ cấp độ CEFR của từ vựng (A1, A2, B1, B2, C1, C2).
- Từ vựng cấp độ C2 mặc định sẽ có độ khó cao hơn và cần tần suất ôn tập ban đầu dày hơn.

### C. Độ khó thích ứng (Complexity - $c$)
Sử dụng phương pháp **Bayesian Smoothing** để cập nhật độ khó dựa trên lịch sử lỗi:
$$c = \frac{\text{Base\_Diff} \cdot K + \text{Total\_Errors}}{K + \text{Total\_Attempts}}$$
- Điều này giúp hệ thống "hiểu" được những từ nào cá nhân bạn hay bị sai để tăng cường tần suất.

### D. Yếu tố Độ lưu loát (Response Time - $\beta_4$) - **NÂNG CẤP ĐẶC BIỆT**
Hệ thống đo lường thời gian bạn phản hồi ($T$) bằng mili giây.
- **Normalized RT ($T_{\text{norm}}$)**: $T / 15000$ (giới hạn 15 giây).
- **Logic**: 
    - Nếu bạn trả lời đúng trong < 3 giây: Hệ thống cộng thêm "điểm thưởng" vào $z$, kéo dài thời gian gặp lại từ này vì bạn đã đạt mức **Fluency** (Phản xạ).
    - Nếu bạn mất > 10 giây mới nhớ ra: Hệ thống coi đây là **Struggling Recall**, sẽ giảm khoảng cách ôn tập để bạn sớm gặp lại từ này.

---

## 4. Quy trình tính toán "Thời điểm vàng"

1. **Ghi nhận**: Người dùng hoàn thành bài kiểm tra, hệ thống nhận được bộ 3: `isCorrect`, `responseTimeMs`, và `vocabId`.
2. **Cập nhật**:
    - Update tổng số lần làm, số lần sai.
    - Tính lại độ khó thích ứng (Complexity).
    - Tính toán giá trị $z$ theo các trọng số $\beta$.
3. **Lập lịch (Scheduling)**:
    - Tính toán số ngày cần chờ: $\text{delayDays} = \text{z\_score} / \beta_2$.
    - Giới hạn tối thiểu là 0.1 ngày (2.4 giờ) và tối đa là 30 ngày (để tránh việc người dùng quên hoàn toàn).
4. **Xác nhận**: Thời gian ôn tập tiếp theo sẽ được lưu vào thuộc tính `next_review`.

---

## 5. Giá trị đối với Đồ án Tốt nghiệp
- **Tính toán học**: Chứng minh được việc áp dụng các mô hình toán học (Logistic Regression, Bayesian Inference) vào phần mềm.
- **Tính thực tiễn**: Thuật toán không cố định mà tự thích ứng (Adaptive Learning) theo năng lực của từng người học.
- **Sự khác biệt**: Việc tích hợp **Response Time** là một bước tiến so với các ứng dụng SRS thông thường, biến phần mềm thành một hệ thống **Học tập thích ứng (Adaptive Learning System)** thực thụ.
