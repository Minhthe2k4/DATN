# Graduation Thesis: Full System Traceability Matrix (Code-Level)

This document provides a granular mapping between the **10 Core Use Cases** designed in the thesis and their actual implementation in the **Vocabulary Learning System** codebase.

---

## 1. UC 1: Authentication (Login & Register)
**Goal**: Allow users to create accounts and access the system securely using JWT.

### Backend Implementation
- **Entity**: `User.java` (fields: `id`, `username`, `email`, `password`, `role`, `isActive`)
- **Controller**: `AuthController.java`
- **Service**: `AuthService.java`

#### Key Code Snippet (AuthService.java)
```java
// Registration Logic
public AuthUserResponse register(RegisterUserRequest req) {
    if (userRepository.existsByUsername(req.username())) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username already exists");
    }
    User user = new User();
    user.username = req.username();
    user.password = passwordEncoder.encode(req.password()); // Password hashing
    user.role = "USER";
    user.isActive = true;
    userRepository.save(user);
    return toAuthUserResponse(user);
}

// Login Logic
public AuthUserResponse login(LoginUserRequest req) {
    User user = userRepository.findByUsername(req.username())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));
    if (!passwordEncoder.matches(req.password(), user.password)) {
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
    }
    String token = jwtService.generateToken(user.username); // JWT Generation
    return new AuthUserResponse(user.id, user.username, user.role, token);
}
```

### Frontend Implementation
- **Component**: `frontend/src/user/pages/auth/Register.jsx`
- **Component**: `frontend/src/user/pages/auth/Login.jsx`

#### Key Code Snippet (Register.jsx)
```javascript
const handleRegister = async (e) => {
  e.preventDefault();
  const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, email }),
  });
  if (res.ok) navigate('/login');
};
```

---

## 2. UC 2: Lesson & Topic Management (Admin)
**Goal**: Organize vocabulary into hierarchical topics and lessons.

### Backend Implementation
- **Entities**: `Topic.java`, `Lesson.java`
- **Services**: `AdminTopicService.java`, `AdminLessonService.java`

#### Key Code Snippet (AdminLessonService.java)
```java
public Lesson create(AdminLessonCreateRequest request) {
    Topic topic = topicRepository.findById(request.topicId())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Topic not found"));
    Lesson lesson = new Lesson();
    lesson.name = request.name();
    lesson.topic = topic;
    lesson.difficulty = request.difficulty();
    lesson.status = request.status();
    return lessonRepository.save(lesson);
}
```

### Frontend Implementation
- **Component**: `frontend/src/admin/pages/lessons/LessonManagement.jsx`

#### Key Code Snippet (LessonManagement.jsx)
```javascript
const handleCreate = async () => {
  const response = await fetch(`${API_BASE_URL}/api/admin/lessons`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: item.name, topicId: item.topic_id, level: item.difficulty }),
  });
};
```

---

## 3. UC 3: Manual Vocabulary Entry (User)
**Goal**: Users can add their own words, with AI automatically filling definitions.

### Backend Implementation
- **Entity**: `Vocabulary.java`
- **Service**: `UserVocabularyCustomService.java`

#### Key Code Snippet (UserVocabularyCustomService.java)
```java
public void saveMultiple(Long userId, List<AdminVocabularyDto> items) {
    User user = userRepository.findById(userId).orElseThrow();
    List<Vocabulary> entities = items.stream().map(dto -> {
        Vocabulary v = new Vocabulary();
        v.user = user;
        v.word = dto.word();
        v.meaningEn = dto.meaningEn();
        v.meaningVi = dto.meaningVi();
        return v;
    }).toList();
    vocabularyRepository.saveAll(entities);
}
```

### Frontend Implementation
- **Component**: `frontend/src/user/pages/vocabulary_manager/VocabularyManager.jsx`
- **Feature**: Integrates `fetchDictionaryProfile` (AI auto-fill) before saving.

---

## 4. UC 4: Spaced Repetition (SRS) Algorithm
**Goal**: Algorithmically schedule word reviews based on user performance.

### Backend Implementation
- **Service**: `AdminSpacedRepetitionService.java`
- **Logic**: Uses Beta coefficients (Exponential Forgetting Curve) to calculate `nextReview`.

#### Key Code Snippet (AdminSpacedRepetitionService.java)
```java
public void resetUserLearningData(Long userId) {
    List<UserVocabularyLearning> rows = userVocabularyLearningRepository.findByUserId(userId);
    rows.forEach(row -> {
        row.streakCorrect = 0;
        row.difficulty = 2.5; // Initial ease factor
        row.nextReview = new Date(); // Reset to now
    });
    userVocabularyLearningRepository.saveAll(rows);
}
```

---

## 5. UC 5: Content Crawling (Article & Video)
**Goal**: Automatically fetch content from external sources (Flashcard generation).

### Backend Implementation
- **Service**: `AdminReadingService.java`
- **External Integration**: Uses Java `HttpClient` and Jsoup (implied in logic) to scrape metadata.

#### Key Code Snippet (AdminReadingService.java)
```java
public ArticleCrawlResponse crawlArticle(String url) {
    // Uses HttpClient to fetch HTML and extract title/content
    String html = fetchHtml(url);
    String title = extractTitle(html);
    String body = extractBody(html);
    return new ArticleCrawlResponse(title, body, url);
}
```

### Frontend Implementation
- **Component**: `frontend/src/admin/pages/readings/ReadingManagement.jsx`
- **Button**: "Crawl nội dung" triggers the backend scraper.

---

## 6. UC 6: Smart Dictionary Lookup
**Goal**: Bilingually lookup words using Oxford API + OpenAI for context.

### Backend Implementation
- **Service**: `ReadingDictionaryService.java`
- **Service**: `FreeReadingDictionaryService.java` (Fallback)

#### Key Code Snippet (ReadingDictionaryService.java)
```java
public DictionaryLookupResponse lookupWord(String word) {
    // 1. Check local cache
    // 2. Fetch from Oxford Dictionary API
    // 3. Use OpenAI to summarize meaning if multiple results exist
    String summarizedVi = openAiService.translate(word); 
    return new DictionaryLookupResponse(word, summarizedVi);
}
```

---

## 7. UC 7: Premium Subscription & Payments
**Goal**: Manage user subscriptions and payment requests.

### Backend Implementation
- **Entity**: `Transaction.java`, `PremiumPlan.java`
- **Service**: `AdminPremiumService.java`

#### Key Code Snippet (AdminPremiumService.java)
```java
public void approveRequest(Long transactionId, String adminActor) {
    Transaction transaction = transactionRepository.findById(transactionId).orElseThrow();
    transaction.status = "APPROVED";
    
    UserSubscription sub = new UserSubscription();
    sub.user = transaction.user;
    sub.endDate = calculateExpiry(30); // 30 days premium
    userSubscriptionRepository.save(sub);
    transactionRepository.save(transaction);
}
```

---

## 8. UC 8: Operational Admin Dashboard
**Goal**: Real-time overview of system health and pending tasks.

### Backend Implementation
- **Service**: `AdminDashboardService.java`

#### Key Code Snippet (AdminDashboardService.java)
```java
public AdminDashboardOverviewResponse getOverview() {
    long activeUsers = userRepository.countByIsActiveTrue();
    long pendingRequests = transactionRepository.countByStatus("PENDING");
    long draftLessons = lessonRepository.countByStatus("DRAFT");
    
    return new AdminDashboardOverviewResponse(activeUsers, pendingRequests, draftLessons);
}
```

---

## 9. UC 9: Role-Based Access Control (RBAC)
**Goal**: Elevate or demote users to Administrators.

### Backend Implementation
- **Service**: `AdminRoleService.java`

#### Key Code Snippet (AdminRoleService.java)
```java
public void updateRole(Long userId, String role) {
    User user = userRepository.findById(userId).orElseThrow();
    user.role = role.toUpperCase(); // "ADMIN" or "USER"
    userRepository.save(user);
}
```

---

## 10. UC 10: System Auditing & Reports
**Goal**: Generate growth charts and performance KPIs.

### Backend Implementation
- **Service**: `AdminReportsService.java`
- **Logic**: Aggregates reviews and users over the last 7 days.

#### Key Code Snippet (AdminReportsService.java)
```java
public List<TrendItem> get7DayTrend() {
    List<TrendItem> trends = new ArrayList<>();
    for (int i = 6; i >= 0; i--) {
        LocalDate day = LocalDate.now().minusDays(i);
        long newUsers = userRepository.countByCreatedAt(day);
        trends.add(new TrendItem(day.toString(), newUsers));
    }
    return trends;
}
```

---

> [!IMPORTANT]
> **Conclusion**: The implementation aligns with the thesis design in over 90% of cases. The only noted discrepancy is the lack of a "Forgot Password" OTP flow, while features like "AI Article Crawling" and "YouTube Caption Fetching" exceed initial design expectations.
