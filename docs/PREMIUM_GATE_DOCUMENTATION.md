# Feature Locking System Với Premium Gate

Hệ thống này cho phép khóa/mở tính năng dựa trên trạng thái Premium của người dùng.

## 📦 Components

### 1. **usePremiumStatus Hook**
```javascript
import { usePremiumStatus, isPremiumValid } from '@/hooks/usePremiumStatus'

function MyComponent({ userId }) {
  const premiumStatus = usePremiumStatus(userId)
  
  if (premiumStatus.loading) return <div>Đang tải...</div>
  if (premiumStatus.error) return <div>Lỗi: {premiumStatus.error}</div>
  
  const isValid = isPremiumValid(premiumStatus)
  console.log('Premium hợp lệ:', isValid)
  console.log('Hết hạn:', premiumStatus.premiumUntil)
  
  return <div>Premium: {isValid ? '✅ Đang hoạt động' : '❌ Không có'}</div>
}
```

### 2. **PremiumGate Component** 
Wrapper để khóa/mở tính năng:

```javascript
import { PremiumGate } from '@/components/PremiumGate'

function MyFeature({ userId }) {
  const premiumStatus = usePremiumStatus(userId)
  const isPremium = isPremiumValid(premiumStatus)
  
  return (
    <PremiumGate 
      isPremium={isPremium}
      featureName="Advanced Analytics"
      showBlur={true}
      onUpgradeClick={() => window.location.href = '/premium-plans'}
    >
      {/* Content bị khóa */}
      <div className="premium-feature">
        <h3>Advanced Analytics Dashboard</h3>
        <p>Chi tiết phân tích khoá học của bạn...</p>
        <AnalyticsChart data={analyticsData} />
      </div>
    </PremiumGate>
  )
}
```

## 🔒 Features

### Blur Mode (Default)
- Nội dung bị mờ/blur
- Overlay với lock icon
- Button upgrade rõ ràng

### No Blur Mode
```javascript
<PremiumGate 
  isPremium={isPremium}
  showBlur={false}
  featureName="Advanced Reports"
>
  {/* Nội dung vẫn nhìn thấy nhưng có overlay lock */}
  <ReportComponent />
</PremiumGate>
```

### Custom Upgrade Handler
```javascript
<PremiumGate 
  isPremium={isPremium}
  onUpgradeClick={() => {
    // Custom logic: coupon, redirect, modal, v.v.
    openPremiumModal()
    trackEvent('premium_upgrade_clicked')
  }}
>
  <LockedFeature />
</PremiumGate>
```

## 📡 Backend Endpoint

### GET /api/users/{userId}/premium-status

**Response (Premium)**
```json
{
  "isPremium": true,
  "status": "active",
  "premiumUntil": "2026-12-31T23:59:59Z",
  "planId": 1,
  "planName": "Premium 1 Năm"
}
```

**Response (Free User)**
```json
{
  "isPremium": false,
  "status": "free",
  "premiumUntil": null
}
```

## 🎨 Styling

Custom CSS trong `PremiumGate.css`:
- Blur overlay với gradient
- Animated lock icon
- Smooth transitions
- Responsive design

## 💡 Use Cases

### 1. Lock Dashboard Features
```javascript
<PremiumGate isPremium={isPremium} featureName="Bảng điều khiển nâng cao">
  <AdvancedDashboard />
</PremiumGate>
```

### 2. Lock Reports
```javascript
<PremiumGate isPremium={isPremium} featureName="Báo cáo chi tiết">
  <DetailedReports />
</PremiumGate>
```

### 3. Lock Export Features
```javascript
<PremiumGate isPremium={isPremium} featureName="Xuất dữ liệu">
  <ExportButton onClick={handleExport} />
</PremiumGate>
```

### 4. Multiple Premium Gates
```javascript
function StudentDashboard({ userId }) {
  const premiumStatus = usePremiumStatus(userId)
  const isPremium = isPremiumValid(premiumStatus)
  
  return (
    <>
      <div className="row">
        <div className="col-lg-6">
          {/* Free feature - no gate */}
          <FreeProgressChart />
        </div>
        <div className="col-lg-6">
          {/* Premium feature - gated */}
          <PremiumGate isPremium={isPremium} featureName="Advanced Analytics">
            <AdvancedAnalyticsChart />
          </PremiumGate>
        </div>
      </div>
      
      <div className="row mt-4">
        <div className="col-12">
          {/* Premium feature - gated */}
          <PremiumGate isPremium={isPremium} featureName="Performance Reports">
            <PerformanceReports />
          </PremiumGate>
        </div>
      </div>
    </>
  )
}
```

## 🚀 Implementation Steps

1. ✅ Create `usePremiumStatus` hook - queries backend for status
2. ✅ Create `PremiumGate` component - renders gate UI
3. ✅ Add backend endpoint `GET /api/users/{userId}/premium-status`
4. ✅ Add `getPremiumStatus()` in UserHomepageService
5. ⏭️  Wrap features in `PremiumGate` in your components
6. ⏭️  Add premium plan selection page
7. ⏭️  Integrate payment gateway

## Build & Test

```bash
cd e:\DATN-main\backend
.\mvnw.cmd compile  # Backend should compile

cd e:\DATN-main\frontend
npm run build       # Frontend should build
```

Both should build successfully! ✅
