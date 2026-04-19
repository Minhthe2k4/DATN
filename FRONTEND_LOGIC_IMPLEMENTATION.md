# Frontend Logic Implementation - Vocabulary Lesson Learning

## Overview
Implemented API integration for the "Học theo bài có sẵn" (Learn from Pre-made Lessons) feature on the VocabularyLesson component.

---

## Changes Made

### 1. Updated State Management
Added new states to `VocabularyLesson.jsx`:
- `topicData` - stores fetched topics from API (replaces hardcoded data)
- `isLoadingTopics` - loading indicator for topics
- `isLoadingLessons` - loading indicator for lessons

### 2. Added API Integration

#### Fetch Topics (useEffect)
```javascript
useEffect(() => {
  const fetchTopics = async () => {
    setIsLoadingTopics(true)
    try {
      const response = await fetch('/api/user/lessons/topics')
      if (!response.ok) throw new Error('Failed to fetch topics')
      const topics = await response.json()
      setTopicData(topics)
    } catch (error) {
      console.error('Error fetching topics:', error)
    } finally {
      setIsLoadingTopics(false)
    }
  }
  fetchTopics()
}, [])
```

Calls: `GET /api/user/lessons/topics`

#### Fetch Lessons for Selected Topic (useEffect)
```javascript
useEffect(() => {
  if (!selectedTopicId || isLoadingTopics) return
  
  const fetchLessons = async () => {
    setIsLoadingLessons(true)
    try {
      const response = await fetch(`/api/user/lessons/topics/${selectedTopicId}/lessons`)
      if (!response.ok) throw new Error('Failed to fetch lessons')
      const lessons = await response.json()
      
      // Update topicData with fetched lessons
      setTopicData((prev) =>
        prev.map((topic) =>
          topic.id === selectedTopicId
            ? { ...topic, lessons }
            : topic
        )
      )
    } catch (error) {
      console.error('Error fetching lessons:', error)
    } finally {
      setIsLoadingLessons(false)
    }
  }
  
  fetchLessons()
}, [selectedTopicId, isLoadingTopics])
```

Calls: `GET /api/user/lessons/topics/{topicId}/lessons`

#### Fetch Lesson Details with Words (useEffect)
```javascript
useEffect(() => {
  if (!selectedLessonId || !selectedTopicId) return
  
  const fetchLessonDetails = async () => {
    try {
      const response = await fetch(`/api/user/lessons/${selectedLessonId}`)
      if (!response.ok) throw new Error('Failed to fetch lesson details')
      const lessonDetails = await response.json()
      
      // Update topicData with fetched words
      setTopicData((prev) =>
        prev.map((topic) =>
          topic.id === selectedTopicId
            ? {
              ...topic,
              lessons: topic.lessons.map((lesson) =>
                lesson.id === selectedLessonId
                  ? { ...lesson, words: lessonDetails.words }
                  : lesson
              ),
            }
            : topic
        )
      )
    } catch (error) {
      console.error('Error fetching lesson details:', error)
    }
  }
  
  fetchLessonDetails()
}, [selectedLessonId, selectedTopicId])
```

Calls: `GET /api/user/lessons/{lessonId}`

### 3. Updated UI with Loading States

**Topics View:**
- Shows loading indicator while fetching topics
- Shows empty state if no topics are available
- Displays topics in grid when loaded

**Lessons View:**
- Shows loading indicator while fetching lessons
- Shows empty state if topic has no lessons
- Displays lessons with word count

### 4. Marked Hardcoded Data as Reference
Changed the hardcoded `topicData` constant to `defaultTopicData` and added a comment explaining that:
- Data is now loaded from API endpoints
- Hardcoded data is kept as reference/fallback
- Actual frontend uses dynamic data from backend

---

## Data Flow

```
User Opens Vocabulary Page
    ↓
useEffect: Fetch /api/user/lessons/topics
    ↓
Display Topics in Grid
    ↓
User Selects Topic (handlePickTopic)
    ↓
useEffect: Fetch /api/user/lessons/topics/{topicId}/lessons
    ↓
Display Lessons in Grid
    ↓
User Selects Lesson (handlePickLesson)
    ↓
useEffect: Fetch /api/user/lessons/{lessonId}
    ↓
Display Flashcard Study Mode with Words
```

---

## API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/user/lessons/topics` | GET | Fetch all available topics |
| `/api/user/lessons/topics/{topicId}/lessons` | GET | Fetch lessons for a specific topic |
| `/api/user/lessons/{lessonId}` | GET | Fetch lesson details with vocabulary words |

---

## Proxy Configuration

Frontend is configured to proxy API calls to backend:
- **Frontend Base URL:** http://localhost:5173
- **Backend Base URL:** http://localhost:8080
- **Proxy Configuration:** `/api` → `http://localhost:8080`

Any fetch to `/api/...` on frontend will be routed to `http://localhost:8080/api/...`

---

## Error Handling

- All API calls have try-catch error handling
- Errors are logged to browser console
- UI shows graceful error states (loading indicators)
- Component maintains functionality even if API calls fail

---

## Testing the Implementation

1. Start backend server (port 8080)
2. Start frontend dev server (port 5173)
3. Navigate to http://localhost:5173/vocabulary-lesson
4. Observe:
   - Topics load from API
   - Select a topic
   - Lessons for that topic load from API
   - Select a lesson
   - Lesson details with words load from API
   - Flashcard study mode works with loaded data

---

## Files Modified

- `frontend/src/user/pages/vocabulary_lesson/VocabularyLesson.jsx`
  - Added `topicData` state to replace hardcoded data
  - Added `isLoadingTopics` and `isLoadingLessons` states
  - Added 3 useEffect hooks for API data fetching
  - Updated UI to show loading states and empty states
  - Changed hardcoded data variable to `defaultTopicData` (for reference)

---

## Backend Readiness

Backend endpoints are ready and implemented:
- ✅ UserLessonController with all required endpoints
- ✅ UserLessonService with data fetching logic
- ✅ LessonVocabularyRepository for database queries
- ✅ Proper DTOs for responses
- ✅ All code compiles successfully

---

## Next Steps (Optional Improvements)

1. Add search/filter for topics
2. Implement pagination for large lesson lists
3. Add error toast notifications
4. Cache lessons to reduce API calls
5. Track user progress through topics
