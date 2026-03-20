# StreakFlow Design Document

## Overview

StreakFlow is a mobile-first habit tracking web application built with React, TypeScript, Tailwind CSS, and Supabase. The system enables users to create, track, and visualize daily habits with streak counting, completion rates, and push notifications. The architecture prioritizes responsive design, accessibility, and offline-ready PWA capabilities.

### Key Design Principles

- **Mobile-First**: Optimized for 375px minimum width with progressive enhancement for larger screens
- **Minimal Friction**: One-tap check-ins with immediate visual feedback
- **Data Integrity**: Timezone-aware tracking with persistent storage in Supabase
- **Accessibility**: WCAG AA compliance throughout with semantic HTML and keyboard navigation
- **Performance**: Efficient data fetching, caching strategies, and optimized rendering

---

## System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + TS)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Dashboard   │  │   Habits     │  │    Stats     │      │
│  │    View      │  │    View      │  │    View      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                 │                 │               │
│  ┌──────────────────────────────────────────────────┐      │
│  │         State Management (Zustand)              │      │
│  │  - Habits Store                                 │      │
│  │  - Check-ins Store                              │      │
│  │  - Auth Store                                   │      │
│  │  - UI Store (theme, sorting, etc.)              │      │
│  └──────────────────────────────────────────────────┘      │
│         │                 │                 │               │
│  ┌──────────────────────────────────────────────────┐      │
│  │         API Layer (Supabase Client)             │      │
│  │  - Habits CRUD                                  │      │
│  │  - Check-ins CRUD                               │      │
│  │  - Reminders Management                         │      │
│  │  - Auth Operations                              │      │
│  └──────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
┌───────────────┐  ┌──────────────┐  ┌──────────────┐
│ Supabase Auth │  │  PostgreSQL  │  │ Push Service │
│               │  │  Database    │  │ (Web Push)   │
└───────────────┘  └──────────────┘  └──────────────┘
```

### Component Hierarchy

```
App
├── AuthLayout
│   ├── LoginPage
│   └── SignupPage
├── MainLayout
│   ├── Navigation (Bottom Nav on mobile)
│   ├── Dashboard
│   │   ├── HabitCard (multiple)
│   │   │   ├── CheckInButton
│   │   │   ├── StreakDisplay
│   │   │   └── CompletionIndicator
│   │   └── LoadingState
│   ├── HabitsView
│   │   ├── HabitForm (create/edit modal)
│   │   ├── HabitList
│   │   │   └── HabitListItem (multiple)
│   │   │       ├── EditButton
│   │   │       ├── DeleteButton
│   │   │       └── ArchiveButton
│   │   └── ArchivedHabitsSection
│   ├── StatsView
│   │   ├── BestStreakCard
│   │   ├── CompletionRateCard
│   │   ├── HabitStatsGrid
│   │   │   └── HabitStatCard (multiple)
│   │   └── WeeklyMonthlyStats
│   └── HabitDetailView
│       ├── Heatmap
│       ├── CheckInHistory
│       └── StreakInfo
└── Modals
    ├── ConfirmDeleteDialog
    ├── EmojiPicker
    ├── ColorPicker
    └── NotificationPermissionPrompt
```

### Data Flow

1. **User Authentication**: Supabase Auth → Session stored in Zustand → Protected routes
2. **Habit Creation**: Form submission → Zustand store update → Supabase insert → UI refresh
3. **Check-In**: Button click → Optimistic UI update → Supabase update → Streak recalculation
4. **Data Retrieval**: App load → Fetch from Supabase → Zustand store → Component render
5. **Reminders**: Service Worker → Check scheduled time → Send notification → Navigate to app

---

## Database Schema

### Tables

#### `users`
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  timezone TEXT DEFAULT 'UTC',
  theme TEXT DEFAULT 'dark', -- 'dark' or 'light'
  notification_permission BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `habits`
```sql
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  color_tag TEXT NOT NULL, -- 'red', 'blue', 'green', 'yellow', 'purple', 'pink'
  habit_type TEXT DEFAULT 'boolean', -- 'boolean' or 'quantity'
  target_quantity INTEGER, -- NULL for boolean habits
  target_unit TEXT, -- e.g., 'glasses', 'minutes', 'pages'
  target_days TEXT[] DEFAULT ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  reminder_time TIME, -- NULL if no reminder
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, name)
);

CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_habits_archived ON habits(user_id, is_archived);
```

#### `check_ins`
```sql
CREATE TABLE check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  check_in_date DATE NOT NULL,
  quantity_value INTEGER, -- NULL for boolean habits, numeric value for quantity habits
  completed BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(habit_id, check_in_date)
);

CREATE INDEX idx_check_ins_habit_id ON check_ins(habit_id);
CREATE INDEX idx_check_ins_user_id ON check_ins(user_id);
CREATE INDEX idx_check_ins_date ON check_ins(check_in_date);
```

#### `reminders`
```sql
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reminder_time TIME NOT NULL,
  is_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reminders_user_id ON reminders(user_id);
CREATE INDEX idx_reminders_habit_id ON reminders(habit_id);
```

### Key Relationships

- `users` → `habits` (1:N) - One user has many habits
- `users` → `check_ins` (1:N) - One user has many check-ins
- `habits` → `check_ins` (1:N) - One habit has many check-ins
- `habits` → `reminders` (1:N) - One habit has one reminder (optional)

### Timezone Handling Strategy

- Store user timezone in `users.timezone` (e.g., 'America/New_York')
- All dates stored as DATE type (no time component) in UTC
- Client-side conversion: Use `date-fns-tz` to convert UTC dates to user's local timezone
- Check-in recording: Convert local date to UTC before storing
- Reminder scheduling: Convert reminder time to user's timezone for scheduling

---

## Frontend Architecture

### State Management (Zustand)

#### Auth Store
```typescript
interface AuthStore {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
}
```

#### Habits Store
```typescript
interface HabitsStore {
  habits: Habit[];
  isLoading: boolean;
  fetchHabits: () => Promise<void>;
  createHabit: (habit: CreateHabitInput) => Promise<void>;
  updateHabit: (id: string, updates: UpdateHabitInput) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  archiveHabit: (id: string) => Promise<void>;
  unarchiveHabit: (id: string) => Promise<void>;
  getActiveHabits: () => Habit[];
  getArchivedHabits: () => Habit[];
  getHabitsForToday: () => Habit[];
}
```

#### Check-Ins Store
```typescript
interface CheckInsStore {
  checkIns: CheckIn[];
  isLoading: boolean;
  fetchCheckIns: (habitId?: string) => Promise<void>;
  recordCheckIn: (habitId: string, date: Date, quantity?: number) => Promise<void>;
  undoCheckIn: (habitId: string, date: Date) => Promise<void>;
  getCheckInsForHabit: (habitId: string) => CheckIn[];
  getCheckInForDate: (habitId: string, date: Date) => CheckIn | null;
}
```

#### UI Store
```typescript
interface UIStore {
  theme: 'dark' | 'light';
  sortBy: 'created' | 'current_streak' | 'longest_streak';
  showArchivedHabits: boolean;
  setTheme: (theme: 'dark' | 'light') => void;
  setSortBy: (sortBy: string) => void;
  toggleArchivedHabits: () => void;
}
```

### Component Structure

#### Pages
- `LoginPage` - Email/password authentication
- `SignupPage` - New user registration
- `Dashboard` - Today's habits and check-ins
- `HabitsView` - Habit management (create, edit, delete, archive)
- `StatsView` - Aggregate statistics and performance
- `HabitDetailView` - Individual habit heatmap and history

#### Layouts
- `AuthLayout` - Centered form layout for login/signup
- `MainLayout` - Navigation + content area with bottom nav on mobile

#### Reusable Components
- `HabitCard` - Displays habit with check-in button and streak
- `HabitForm` - Create/edit habit modal with validation
- `Heatmap` - GitHub-style calendar grid (12 months)
- `CheckInHistory` - List of recent check-ins with dates
- `StreakDisplay` - Current and longest streak badges
- `CompletionIndicator` - Visual indicator (checkmark/circle)
- `LoadingSpinner` - Reusable loading state
- `ErrorMessage` - Consistent error display
- `ConfirmDialog` - Reusable confirmation modal
- `EmojiPicker` - Emoji selection component
- `ColorPicker` - Color tag selection component
- `Navigation` - Bottom nav bar (mobile) / Top nav (desktop)

### Routing Structure

```
/
├── /login
├── /signup
├── /dashboard (protected)
├── /habits (protected)
├── /stats (protected)
└── /habits/:id (protected)
```

---

## API/Database Operations

### Habit Operations

#### Create Habit
```typescript
async function createHabit(input: {
  name: string;
  emoji: string;
  colorTag: string;
  habitType: 'boolean' | 'quantity';
  targetQuantity?: number;
  targetUnit?: string;
  targetDays: string[];
  reminderTime?: string;
}): Promise<Habit>
```

#### Update Habit
```typescript
async function updateHabit(habitId: string, updates: {
  name?: string;
  emoji?: string;
  colorTag?: string;
  targetDays?: string[];
  reminderTime?: string;
}): Promise<Habit>
```

#### Delete Habit
```typescript
async function deleteHabit(habitId: string): Promise<void>
// Cascades to delete all associated check-ins
```

#### Archive/Unarchive Habit
```typescript
async function archiveHabit(habitId: string): Promise<void>
async function unarchiveHabit(habitId: string): Promise<void>
```

### Check-In Operations

#### Record Check-In
```typescript
async function recordCheckIn(input: {
  habitId: string;
  date: Date;
  quantityValue?: number;
}): Promise<CheckIn>
// For quantity habits: mark complete if quantityValue >= targetQuantity
// For boolean habits: mark complete = true
```

#### Undo Check-In
```typescript
async function undoCheckIn(habitId: string, date: Date): Promise<void>
// Only allowed within 24 hours of check-in
// Validates: now - checkInTime <= 24 hours
```

#### Get Check-Ins for Habit
```typescript
async function getCheckInsForHabit(habitId: string, startDate: Date, endDate: Date): Promise<CheckIn[]>
// Used for heatmap and history views
```

### Streak Calculation Logic

#### Current Streak
```typescript
function calculateCurrentStreak(habitId: string, checkIns: CheckIn[], targetDays: string[]): number {
  // Start from today and work backwards
  // For each day in targetDays:
  //   - If check-in exists and completed: increment streak
  //   - If check-in missing or incomplete: break and return streak
  // Return total consecutive days
}
```

#### Longest Streak
```typescript
function calculateLongestStreak(habitId: string, checkIns: CheckIn[], targetDays: string[]): number {
  // Iterate through all check-ins chronologically
  // Track current streak and max streak
  // When streak breaks, compare with max and reset
  // Return max streak found
}
```

#### Streak Reset Logic
```typescript
function shouldResetStreak(habitId: string, lastCheckInDate: Date, targetDays: string[]): boolean {
  // Get all target days between lastCheckInDate and today
  // If any target day is missing a check-in: return true
  // Otherwise: return false
}
```

### Completion Rate Calculations

#### Weekly Completion Rate
```typescript
function calculateWeeklyCompletionRate(habitId: string, checkIns: CheckIn[], targetDays: string[]): number {
  // Get current week's target days
  // Count completed check-ins
  // Return (completed / targetDaysThisWeek) * 100
}
```

#### Monthly Completion Rate
```typescript
function calculateMonthlyCompletionRate(habitId: string, checkIns: CheckIn[], targetDays: string[]): number {
  // Get current month's target days
  // Count completed check-ins
  // Return (completed / targetDaysThisMonth) * 100
}
```

#### Overall Completion Rate
```typescript
function calculateOverallCompletionRate(habits: Habit[], checkIns: CheckIn[]): number {
  // Sum all target days for all habits in period
  // Sum all completed check-ins in period
  // Return (totalCompleted / totalTarget) * 100
}
```

### Reminder Scheduling

#### Schedule Reminder
```typescript
async function scheduleReminder(input: {
  habitId: string;
  reminderTime: string; // HH:MM format
}): Promise<void>
// Store in database
// Register with Service Worker for daily scheduling
```

#### Send Notification
```typescript
function sendNotification(habitName: string, habitEmoji: string): void {
  // Use Service Worker to send push notification
  // Title: `${habitEmoji} ${habitName}`
  // Body: "Time to check in!"
  // Action: Navigate to dashboard on click
}
```

---

## Authentication Flow

### Supabase Auth Integration

1. **Signup Flow**
   - User enters email and password
   - Validate email format and password length (≥8 chars)
   - Call `supabase.auth.signUp(email, password)`
   - Create user record in `users` table
   - Redirect to dashboard

2. **Login Flow**
   - User enters email and password
   - Call `supabase.auth.signInWithPassword(email, password)`
   - Restore session in Zustand store
   - Redirect to dashboard

3. **Session Persistence**
   - On app load, call `supabase.auth.getSession()`
   - If session exists and valid, restore to Zustand store
   - If session expired, redirect to login

4. **Logout**
   - Call `supabase.auth.signOut()`
   - Clear Zustand stores
   - Redirect to login page

### Protected Routes

```typescript
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore();
  
  if (isLoading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" />;
  
  return children;
}
```

---

## UI/UX Design

### Color Palette (Dark Mode Default)

```
Primary Background:  #0F172A (slate-950)
Secondary Background: #1E293B (slate-900)
Card Background:     #1E293B (slate-900)
Border:              #334155 (slate-700)
Text Primary:        #F1F5F9 (slate-100)
Text Secondary:      #CBD5E1 (slate-300)
Accent:              #3B82F6 (blue-500)

Habit Colors:
- Red:     #EF4444
- Blue:    #3B82F6
- Green:   #10B981
- Yellow:  #FBBF24
- Purple:  #A855F7
- Pink:    #EC4899
```

### Typography System

```
Font Family: Inter (sans-serif)

Heading 1: 32px, 700 (bold), line-height 1.2
Heading 2: 24px, 600 (semibold), line-height 1.3
Heading 3: 20px, 600 (semibold), line-height 1.4
Body:      16px, 400 (regular), line-height 1.5
Small:     14px, 400 (regular), line-height 1.5
Caption:   12px, 400 (regular), line-height 1.4
```

### Component Design Patterns

#### Habit Card
- Rounded corners: 12px
- Shadow: `0 1px 3px rgba(0,0,0,0.1)`
- Padding: 16px
- Border: 1px solid border color
- Hover state: Slight shadow increase, background lighten

#### Button
- Minimum size: 44px × 44px (touch-friendly)
- Rounded corners: 8px
- Padding: 12px 16px
- Font: 14px, 600 (semibold)
- States: default, hover, active, disabled

#### Form Input
- Rounded corners: 8px
- Border: 1px solid border color
- Padding: 12px 16px
- Font: 16px (prevents zoom on iOS)
- Focus state: Blue border, shadow

### Animation Specifications

#### Check-In Animation
- Duration: 300ms
- Easing: cubic-bezier(0.34, 1.56, 0.64, 1) (bounce)
- Sequence:
  1. Scale button 0.95 → 1.0
  2. Checkmark fade-in and scale
  3. Streak counter increment with slide-up

#### Undo Animation
- Duration: 200ms
- Easing: ease-out
- Reverse of check-in animation

#### Page Transitions
- Duration: 150ms
- Easing: ease-in-out
- Fade + slight slide

#### Prefers Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Responsive Breakpoints

```
Mobile:    < 640px (375px minimum)
Tablet:    640px - 1024px
Desktop:   > 1024px
Large:     > 1920px

Layout Strategy:
- Mobile: Single column, bottom nav
- Tablet: Single/dual column, top nav
- Desktop: Multi-column, top nav
```

---

## Key Algorithms

### Streak Calculation

```typescript
function calculateStreaks(habitId: string, checkIns: CheckIn[], targetDays: string[]): {
  currentStreak: number;
  longestStreak: number;
} {
  const sortedCheckIns = checkIns.sort((a, b) => 
    new Date(b.checkInDate).getTime() - new Date(a.checkInDate).getTime()
  );
  
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  
  const today = new Date();
  let checkDate = new Date(today);
  
  // Calculate current streak (backwards from today)
  while (true) {
    const dayName = checkDate.toLocaleDateString('en-US', { weekday: 'long' });
    
    if (!targetDays.includes(dayName)) {
      checkDate.setDate(checkDate.getDate() - 1);
      continue;
    }
    
    const checkIn = sortedCheckIns.find(ci => 
      new Date(ci.checkInDate).toDateString() === checkDate.toDateString()
    );
    
    if (checkIn?.completed) {
      currentStreak++;
    } else {
      break;
    }
    
    checkDate.setDate(checkDate.getDate() - 1);
  }
  
  // Calculate longest streak (forward through history)
  sortedCheckIns.reverse().forEach(checkIn => {
    const dayName = new Date(checkIn.checkInDate).toLocaleDateString('en-US', { weekday: 'long' });
    
    if (targetDays.includes(dayName) && checkIn.completed) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else if (targetDays.includes(dayName)) {
      tempStreak = 0;
    }
  });
  
  return { currentStreak, longestStreak };
}
```

### Heatmap Data Generation

```typescript
function generateHeatmapData(habitId: string, checkIns: CheckIn[]): HeatmapCell[][] {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setFullYear(today.getFullYear() - 1);
  
  const weeks: HeatmapCell[][] = [];
  let currentWeek: HeatmapCell[] = [];
  
  for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay();
    
    const checkIn = checkIns.find(ci => 
      new Date(ci.checkInDate).toDateString() === d.toDateString()
    );
    
    currentWeek.push({
      date: new Date(d),
      completed: checkIn?.completed ?? false,
      quantity: checkIn?.quantityValue ?? null,
    });
    
    if (dayOfWeek === 6 || d.toDateString() === today.toDateString()) {
      weeks.push([...currentWeek]);
      currentWeek = [];
    }
  }
  
  return weeks;
}
```

### Reminder Scheduling Logic

```typescript
function scheduleReminders(habits: Habit[]): void {
  habits.forEach(habit => {
    if (!habit.reminderTime) return;
    
    const [hours, minutes] = habit.reminderTime.split(':').map(Number);
    
    // Schedule for each day
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);
    
    // If time has passed today, schedule for tomorrow
    if (scheduledTime < now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }
    
    const timeUntilReminder = scheduledTime.getTime() - now.getTime();
    
    setTimeout(() => {
      sendNotification(habit.name, habit.emoji);
      // Reschedule for next day
      scheduleReminders([habit]);
    }, timeUntilReminder);
  });
}
```

---

## Performance Considerations

### Data Fetching Strategy

1. **Initial Load**
   - Fetch user data and habits on app mount
   - Fetch check-ins for current month (lazy load older data)
   - Cache in Zustand store

2. **Incremental Loading**
   - Load heatmap data (12 months) on-demand when viewing habit detail
   - Paginate check-in history (load 30 at a time)

3. **Real-Time Updates**
   - Use Supabase realtime subscriptions for check-ins
   - Debounce updates to prevent excessive re-renders

### Caching Approach

```typescript
interface CacheConfig {
  habits: { ttl: 5 * 60 * 1000, lastFetch: number }; // 5 minutes
  checkIns: { ttl: 2 * 60 * 1000, lastFetch: number }; // 2 minutes
  stats: { ttl: 10 * 60 * 1000, lastFetch: number }; // 10 minutes
}

function shouldRefetch(key: keyof CacheConfig): boolean {
  const now = Date.now();
  return now - cache[key].lastFetch > cache[key].ttl;
}
```

### Mobile Optimization

- Lazy load images and icons
- Minimize bundle size with code splitting
- Use CSS-in-JS sparingly (Tailwind only)
- Optimize re-renders with React.memo for list items
- Debounce scroll and resize events

---

## Accessibility Implementation

### WCAG AA Compliance Approach

1. **Color Contrast**
   - All text: 4.5:1 ratio (normal text)
   - Large text (18px+): 3:1 ratio
   - Interactive elements: 3:1 ratio

2. **Semantic HTML**
   - Use `<button>` for buttons, not `<div>`
   - Use `<form>` for forms with proper `<label>` elements
   - Use `<nav>` for navigation
   - Use heading hierarchy (`<h1>`, `<h2>`, etc.)

3. **ARIA Labels**
   - `aria-label` for icon-only buttons
   - `aria-describedby` for form error messages
   - `aria-live="polite"` for dynamic updates
   - `aria-current="page"` for active nav item

4. **Keyboard Navigation**
   - All interactive elements focusable with Tab
   - Focus visible with 2px outline
   - Escape key closes modals
   - Enter/Space activates buttons

5. **Screen Reader Support**
   - Descriptive button labels
   - Form labels associated with inputs
   - Skip links for navigation
   - Announce dynamic updates with `aria-live`

### Implementation Examples

```typescript
// Icon button with aria-label
<button aria-label="Delete habit" onClick={handleDelete}>
  <TrashIcon />
</button>

// Form with proper labels
<form>
  <label htmlFor="habitName">Habit Name</label>
  <input id="habitName" type="text" required />
  <span id="nameError" role="alert">{error}</span>
</form>

// Live region for updates
<div aria-live="polite" aria-atomic="true">
  {successMessage}
</div>
```

---

## PWA Implementation

### Service Worker Strategy

1. **Installation**
   - Cache app shell (HTML, CSS, JS)
   - Cache critical assets (fonts, icons)

2. **Activation**
   - Clean up old caches
   - Claim clients

3. **Fetch Strategy**
   - Network-first for API calls
   - Cache-first for static assets
   - Stale-while-revalidate for data

### Manifest.json Configuration

```json
{
  "name": "StreakFlow - Habit Tracker",
  "short_name": "StreakFlow",
  "description": "Track your daily habits and build streaks",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "theme_color": "#0F172A",
  "background_color": "#0F172A",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    }
  ]
}
```

### Offline Support Approach

- Cache check-in data locally (IndexedDB)
- Queue offline check-ins for sync when online
- Display offline indicator
- Sync on reconnection

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Acceptance Criteria Testing Prework

#### Requirement 1: User Authentication

1.1. WHEN a user navigates to the login page, THE Authentication_System SHALL display email and password input fields
  Thoughts: This is testing a specific UI state. We can verify the page contains the required input fields.
  Testable: yes - example

1.2. WHEN a user submits valid email and password credentials, THE Authentication_System SHALL create a new account and log the user in
  Thoughts: This is a general rule that should work for any valid email/password combination. We can generate random valid emails and passwords, submit them, and verify the user is logged in.
  Testable: yes - property

1.3. WHEN a user submits an email that already exists, THE Authentication_System SHALL return an error message indicating the email is already registered
  Thoughts: This is testing error handling for a specific condition. We can create a user, then try to create another with the same email, and verify an error is returned.
  Testable: yes - example

1.4. WHEN a user submits an invalid email format, THE Authentication_System SHALL return an error message indicating invalid email format
  Thoughts: This is testing input validation. We can generate invalid email formats and verify they are rejected.
  Testable: yes - property

1.5. WHEN a user submits a password shorter than 8 characters, THE Authentication_System SHALL return an error message indicating minimum password length requirement
  Thoughts: This is testing password validation. We can generate passwords shorter than 8 characters and verify they are rejected.
  Testable: yes - property

1.6. WHEN a user is logged in, THE Authentication_System SHALL persist the session across browser refreshes
  Thoughts: This is testing session persistence. We can log in, refresh, and verify the session is still valid.
  Testable: yes - property

1.7. WHEN a user clicks the logout button, THE Authentication_System SHALL clear the session and redirect to the login page
  Thoughts: This is testing logout functionality. We can log in, click logout, and verify the session is cleared.
  Testable: yes - property

#### Requirement 2: Habit Creation

2.1. WHEN a user clicks the "Create Habit" button, THE Habit_Manager SHALL display a form with fields for habit name, emoji icon, colour tag, and target days
  Thoughts: This is testing a specific UI state. We can verify the form contains the required fields.
  Testable: yes - example

2.2. WHEN a user enters a habit name and selects an emoji icon, THE Habit_Manager SHALL accept the input
  Thoughts: This is testing input acceptance. We can generate random habit names and emojis and verify they are accepted.
  Testable: yes - property

2.3. WHEN a user submits the form with all required fields populated, THE Habit_Manager SHALL create the habit and add it to the active habits list
  Thoughts: This is a general rule that should work for any valid habit data. We can generate random valid habits and verify they are created.
  Testable: yes - property

2.4. WHEN a user submits the form without a habit name, THE Habit_Manager SHALL return an error message indicating the name is required
  Thoughts: This is testing validation. We can submit without a name and verify an error is returned.
  Testable: yes - example

2.5. WHEN a user selects target days, THE Habit_Manager SHALL allow selection of one or more days (Monday through Sunday)
  Thoughts: This is testing input acceptance. We can select various combinations of days and verify they are accepted.
  Testable: yes - property

2.6. WHEN a user creates a habit without selecting target days, THE Habit_Manager SHALL default to all seven days of the week
  Thoughts: This is testing default behavior. We can create a habit without selecting days and verify all days are selected.
  Testable: yes - property

2.7. WHEN a user selects a colour tag, THE Habit_Manager SHALL apply the colour to the habit's visual representation in the UI
  Thoughts: This is testing UI rendering. We can select a color and verify it's applied to the habit display.
  Testable: yes - property

#### Requirement 3: Habit Editing

3.1. WHEN a user clicks the edit button on a habit, THE Habit_Manager SHALL display a form pre-populated with the habit's current details
  Thoughts: This is testing a specific UI state. We can verify the form is pre-populated with current values.
  Testable: yes - example

3.2. WHEN a user modifies any habit field and submits the form, THE Habit_Manager SHALL update the habit in the database
  Thoughts: This is a general rule that should work for any valid modifications. We can modify various fields and verify they are updated.
  Testable: yes - property

3.3. WHEN a user changes the target days of a habit, THE Habit_Manager SHALL apply the change to future check-ins only, preserving historical data
  Thoughts: This is testing data preservation. We can change target days and verify historical check-ins are preserved.
  Testable: yes - property

3.4. WHEN a user submits an edit form with an empty habit name, THE Habit_Manager SHALL return an error message and prevent the update
  Thoughts: This is testing validation. We can submit with an empty name and verify an error is returned.
  Testable: yes - example

#### Requirement 4: Habit Deletion

4.1. WHEN a user clicks the delete button on a habit, THE Habit_Manager SHALL display a confirmation dialog
  Thoughts: This is testing a specific UI state. We can verify the dialog appears.
  Testable: yes - example

4.2. WHEN a user confirms the deletion, THE Habit_Manager SHALL remove the habit and all associated check-in data from the database
  Thoughts: This is testing cascading deletion. We can delete a habit and verify it and its check-ins are removed.
  Testable: yes - property

4.3. WHEN a user cancels the deletion, THE Habit_Manager SHALL close the dialog without making changes
  Thoughts: This is testing cancellation. We can cancel deletion and verify the habit still exists.
  Testable: yes - property

#### Requirement 5: Habit Archival

5.1. WHEN a user clicks the archive button on a habit, THE Habit_Manager SHALL move the habit to an archived state
  Thoughts: This is testing state change. We can archive a habit and verify its archived status.
  Testable: yes - property

5.2. WHEN a habit is archived, THE Dashboard SHALL no longer display it in the active habits list
  Thoughts: This is testing filtering. We can archive a habit and verify it's not in the active list.
  Testable: yes - property

5.3. WHEN a user navigates to the Habits view, THE Habit_Manager SHALL display an option to view archived habits
  Thoughts: This is testing UI presence. We can verify the option exists.
  Testable: yes - example

5.4. WHEN a user views archived habits, THE Habit_Manager SHALL display all archived habits with an unarchive option
  Thoughts: This is testing filtering and display. We can view archived habits and verify they are displayed.
  Testable: yes - property

5.5. WHEN a user clicks unarchive on an archived habit, THE Habit_Manager SHALL restore the habit to active status
  Thoughts: This is testing state restoration. We can unarchive a habit and verify it's active again.
  Testable: yes - property

#### Requirement 6: Daily Dashboard View

6.1. WHEN a user logs in, THE Dashboard SHALL display all active habits with today's target day
  Thoughts: This is testing filtering. We can log in and verify only habits with today's target day are displayed.
  Testable: yes - property

6.2. WHEN a habit's target day does not include today, THE Dashboard SHALL not display that habit
  Thoughts: This is testing filtering. We can verify habits without today's target day are not displayed.
  Testable: yes - property

6.3. THE Dashboard SHALL display each habit with its emoji icon, name, and colour tag
  Thoughts: This is testing UI rendering. We can verify each habit displays its emoji, name, and color.
  Testable: yes - property

6.4. THE Dashboard SHALL display the current streak count for each habit
  Thoughts: This is testing data display. We can verify the streak count is displayed.
  Testable: yes - property

6.5. THE Dashboard SHALL display a visual indicator showing whether each habit has been completed today
  Thoughts: This is testing UI rendering. We can verify the completion indicator is displayed.
  Testable: yes - property

6.6. THE Dashboard SHALL be fully responsive and optimized for mobile screens at 375px minimum width
  Thoughts: This is testing responsive design. We can verify the layout works at 375px width.
  Testable: yes - property

6.7. THE Dashboard SHALL use a card-based layout with subtle shadows and rounded corners
  Thoughts: This is testing UI styling. We can verify cards have shadows and rounded corners.
  Testable: yes - property

#### Requirement 7: One-Tap Check-In

7.1. WHEN a user taps the check-in button on a habit card, THE Check_In_System SHALL mark the habit as completed for today
  Thoughts: This is testing check-in recording. We can tap the button and verify the habit is marked complete.
  Testable: yes - property

7.2. WHEN a habit is marked complete, THE Check_In_System SHALL update the streak counter immediately
  Thoughts: This is testing streak update. We can mark complete and verify the streak increments.
  Testable: yes - property

7.3. WHEN a habit is marked complete, THE Check_In_System SHALL display a satisfying completion animation (e.g., tick mark, confetti)
  Thoughts: This is testing animation display. We can verify an animation is shown.
  Testable: yes - property

7.4. WHEN a user marks a habit complete, THE Check_In_System SHALL persist the check-in to the database
  Thoughts: This is testing persistence. We can mark complete and verify it's in the database.
  Testable: yes - property

7.5. WHEN a habit is already marked complete for today, THE Check_In_System SHALL display a visual indicator (e.g., checkmark, filled state)
  Thoughts: This is testing UI state. We can verify the indicator is displayed for completed habits.
  Testable: yes - property

#### Requirement 8: Quantity-Based Habit Check-In

8.1. WHEN a user creates a habit, THE Habit_Manager SHALL allow selection of habit type: boolean or quantity-based
  Thoughts: This is testing input acceptance. We can select both types and verify they are accepted.
  Testable: yes - property

8.2. WHEN a user selects quantity-based, THE Habit_Manager SHALL require specification of a target quantity and unit
  Thoughts: This is testing validation. We can select quantity-based and verify quantity/unit are required.
  Testable: yes - property

8.3. WHEN a user checks in a quantity-based habit, THE Check_In_System SHALL display a numeric input field
  Thoughts: This is testing UI rendering. We can verify the input field is displayed.
  Testable: yes - property

8.4. WHEN a user enters a quantity value, THE Check_In_System SHALL accept the input and mark the habit complete if the quantity meets or exceeds the target
  Thoughts: This is testing quantity validation. We can enter various quantities and verify completion logic.
  Testable: yes - property

8.5. WHEN a user enters a quantity below the target, THE Check_In_System SHALL display the habit as incomplete for that day
  Thoughts: This is testing incomplete marking. We can enter below-target quantity and verify incomplete status.
  Testable: yes - property

8.6. WHEN a user views a quantity-based habit's history, THE Heatmap_System SHALL display the quantity value for each day
  Thoughts: This is testing data display. We can verify quantity values are shown in history.
  Testable: yes - property

#### Requirement 9: Undo Check-In

9.1. WHEN a user marks a habit complete, THE Check_In_System SHALL display an undo option for 24 hours
  Thoughts: This is testing UI presence. We can verify the undo option is displayed.
  Testable: yes - property

9.2. WHEN a user clicks undo within the same calendar day, THE Check_In_System SHALL remove the check-in and revert the streak counter
  Thoughts: This is testing undo logic. We can undo and verify the check-in is removed and streak reverts.
  Testable: yes - property

9.3. WHEN a user clicks undo after 24 hours have passed, THE Check_In_System SHALL not allow the undo action
  Thoughts: This is testing time-based validation. We can verify undo is not allowed after 24 hours.
  Testable: yes - property

9.4. WHEN a user undoes a check-in, THE Check_In_System SHALL persist the change to the database
  Thoughts: This is testing persistence. We can undo and verify the change is persisted.
  Testable: yes - property

#### Requirement 10: Streak Tracking

10.1. THE Streak_Tracker SHALL calculate the current streak as the count of consecutive days a habit has been completed up to today
  Thoughts: This is testing streak calculation. We can generate check-in data and verify the streak is calculated correctly.
  Testable: yes - property

10.2. THE Streak_Tracker SHALL calculate the longest streak as the maximum consecutive days a habit has ever been completed
  Thoughts: This is testing longest streak calculation. We can generate check-in data and verify the longest streak is calculated correctly.
  Testable: yes - property

10.3. WHEN a user misses a day (does not complete a habit on a target day), THE Streak_Tracker SHALL reset the current streak to zero
  Thoughts: This is testing streak reset. We can miss a day and verify the streak resets.
  Testable: yes - property

10.4. WHEN a user completes a habit on a non-target day, THE Streak_Tracker SHALL not increment the streak
  Thoughts: This is testing streak logic. We can complete on a non-target day and verify the streak doesn't increment.
  Testable: yes - property

10.5. THE Streak_Tracker SHALL display the current streak and longest streak on the Dashboard for each habit
  Thoughts: This is testing data display. We can verify streaks are displayed.
  Testable: yes - property

10.6. THE Streak_Tracker SHALL display the current streak and longest streak on the Stats Dashboard
  Thoughts: This is testing data display. We can verify streaks are displayed on stats.
  Testable: yes - property

#### Requirement 11: Heatmap Visualization

11.1. WHEN a user clicks on a habit, THE Heatmap_System SHALL display a GitHub-style calendar grid showing the past 12 months of completion history
  Thoughts: This is testing heatmap display. We can verify the heatmap is displayed with 12 months of data.
  Testable: yes - property

11.2. THE Heatmap_System SHALL use colour intensity to represent completion status: darker for completed, lighter for incomplete
  Thoughts: This is testing visual representation. We can verify color intensity matches completion status.
  Testable: yes - property

11.3. WHEN a user hovers over a heatmap cell, THE Heatmap_System SHALL display a tooltip showing the date and completion status
  Thoughts: This is testing tooltip display. We can verify the tooltip is shown on hover.
  Testable: yes - property

11.4. FOR quantity-based habits, THE Heatmap_System SHALL display the quantity value in the tooltip
  Thoughts: This is testing data display. We can verify quantity values are shown in tooltips.
  Testable: yes - property

11.5. THE Heatmap_System SHALL display the heatmap in a responsive layout that adapts to mobile screens
  Thoughts: This is testing responsive design. We can verify the heatmap adapts to mobile screens.
  Testable: yes - property

#### Requirement 12: Weekly and Monthly Completion Rate

12.1. THE Stats_Dashboard SHALL calculate the weekly completion rate as the percentage of target days completed in the current week
  Thoughts: This is testing completion rate calculation. We can generate check-in data and verify the rate is calculated correctly.
  Testable: yes - property

12.2. THE Stats_Dashboard SHALL calculate the monthly completion rate as the percentage of target days completed in the current month
  Thoughts: This is testing completion rate calculation. We can generate check-in data and verify the rate is calculated correctly.
  Testable: yes - property

12.3. THE Stats_Dashboard SHALL display the weekly completion rate for each habit
  Thoughts: This is testing data display. We can verify weekly rates are displayed.
  Testable: yes - property

12.4. THE Stats_Dashboard SHALL display the monthly completion rate for each habit
  Thoughts: This is testing data display. We can verify monthly rates are displayed.
  Testable: yes - property

12.5. THE Stats_Dashboard SHALL display the overall weekly completion rate across all habits
  Thoughts: This is testing data display. We can verify overall weekly rate is displayed.
  Testable: yes - property

12.6. THE Stats_Dashboard SHALL display the overall monthly completion rate across all habits
  Thoughts: This is testing data display. We can verify overall monthly rate is displayed.
  Testable: yes - property

#### Requirement 13: Daily Reminder Notifications

13.1. WHEN a user edits a habit, THE Reminder_System SHALL display a time picker to set a daily reminder
  Thoughts: This is testing UI presence. We can verify the time picker is displayed.
  Testable: yes - example

13.2. WHEN a user sets a reminder time, THE Reminder_System SHALL store the time in the database
  Thoughts: This is testing persistence. We can set a reminder and verify it's stored.
  Testable: yes - property

13.3. WHEN the reminder time is reached, THE Reminder_System SHALL send a browser push notification with the habit name
  Thoughts: This is testing notification sending. We can verify a notification is sent at the scheduled time.
  Testable: yes - property

13.4. WHEN a user clicks the notification, THE Reminder_System SHALL navigate the user to the Dashboard
  Thoughts: This is testing notification action. We can verify navigation occurs on click.
  Testable: yes - property

13.5. WHEN a user disables a reminder, THE Reminder_System SHALL stop sending notifications for that habit
  Thoughts: This is testing reminder disabling. We can disable and verify no notifications are sent.
  Testable: yes - property

13.6. IF the user has not granted browser notification permissions, THE Reminder_System SHALL display a prompt requesting permission
  Thoughts: This is testing permission handling. We can verify a prompt is displayed when permissions are not granted.
  Testable: yes - property

#### Requirement 14: Stats Dashboard Overview

14.1. WHEN a user navigates to the Stats view, THE Stats_Dashboard SHALL display all active habits with their current streaks
  Thoughts: This is testing data display. We can verify all active habits are displayed with streaks.
  Testable: yes - property

14.2. THE Stats_Dashboard SHALL display the longest streak for each habit
  Thoughts: This is testing data display. We can verify longest streaks are displayed.
  Testable: yes - property

14.3. THE Stats_Dashboard SHALL display a "Best Streak" highlight card showing the habit with the longest current streak
  Thoughts: This is testing data display. We can verify the best streak card is displayed.
  Testable: yes - property

14.4. THE Stats_Dashboard SHALL display the overall completion rate for the current week
  Thoughts: This is testing data display. We can verify overall weekly rate is displayed.
  Testable: yes - property

14.5. THE Stats_Dashboard SHALL display the overall completion rate for the current month
  Thoughts: This is testing data display. We can verify overall monthly rate is displayed.
  Testable: yes - property

14.6. THE Stats_Dashboard SHALL be fully responsive and optimized for mobile screens at 375px minimum width
  Thoughts: This is testing responsive design. We can verify the layout works at 375px width.
  Testable: yes - property

#### Requirement 15-40: UI/UX, Accessibility, PWA, etc.

Most of these requirements are about design patterns, accessibility compliance, and architectural decisions rather than testable functional behavior. They are important for implementation but not directly testable as properties.

15.1-15.6: Responsive design - testable as properties (layout adapts correctly)
16.1-16.5: Dark mode - testable as properties (theme persists, contrast maintained)
17.1-17.6: Accessibility - testable as properties (keyboard navigation works, ARIA labels present)
18.1-18.4: Session persistence - testable as properties (session persists across refresh)
19.1-19.6: Data persistence - testable as properties (data persists to database)
20.1-20.5: Animations - testable as properties (animations complete within 500ms)
21.1-21.6: Habit list management - testable as properties (habits displayed correctly)
22.1-22.5: Bottom navigation - testable as properties (nav bar displays and functions)
23.1-23.5: Typography - testable as properties (font sizes and weights applied)
24.1-24.5: Card-based layout - testable as properties (cards display with correct styling)
25.1-25.4: Completion indicator - testable as properties (indicator displays correctly)
26.1-26.3: Habit filtering - testable as properties (habits filtered by target days)
27.1-27.5: Error handling - testable as properties (errors displayed correctly)
28.1-28.4: Loading states - testable as properties (loading indicators displayed)
29.1-29.4: Timezone handling - testable as properties (dates handled in user timezone)
30.1-30.5: PWA readiness - testable as properties (manifest valid, service worker works)
31.1-31.5: Form validation - testable as properties (validation works correctly)
32.1-32.3: Habit name uniqueness - testable as properties (duplicates detected)
33.1-33.4: Habit sorting - testable as properties (habits sorted correctly)
34.1-34.3: Streak reset - testable as properties (streak resets on missed day)
35.1-35.4: Color tag selection - testable as properties (colors applied correctly)
36.1-36.4: Emoji selection - testable as properties (emojis displayed correctly)
37.1-37.4: Check-in history - testable as properties (history displayed correctly)
38.1-38.4: Image/icon handling - testable as properties (icons render correctly)
39.1-39.4: State management - architectural decision, not directly testable
40.1-40.4: Component architecture - architectural decision, not directly testable

### Property Reflection

After analyzing all acceptance criteria, I've identified the following key testable properties:

**Redundancy Analysis:**
- Properties about streak calculation (10.1, 10.2, 10.3, 10.4) can be combined into one comprehensive streak calculation property
- Properties about completion rate calculation (12.1, 12.2) can be combined into one comprehensive rate calculation property
- Properties about data display (6.3, 6.4, 6.5, 14.1, 14.2) can be combined into one comprehensive display property
- Properties about filtering (6.1, 6.2, 26.1, 26.2) can be combined into one comprehensive filtering property
- Properties about persistence (1.6, 18.1, 18.2, 19.1, 19.2, 19.3, 19.4, 19.5, 19.6) can be combined into one comprehensive persistence property
- Properties about validation (1.4, 1.5, 2.4, 31.1, 31.2, 31.3) can be combined into one comprehensive validation property

**Consolidated Properties:**
1. Streak calculation (combines 10.1, 10.2, 10.3, 10.4)
2. Completion rate calculation (combines 12.1, 12.2)
3. Habit filtering by target days (combines 6.1, 6.2, 26.1, 26.2)
4. Check-in recording and persistence (combines 7.1, 7.4, 19.1, 19.2)
5. Undo check-in (combines 9.2, 9.3, 9.4)
6. Habit CRUD operations (combines 2.3, 3.2, 4.2, 5.1, 5.5)
7. Form validation (combines 1.4, 1.5, 2.4, 31.1, 31.2, 31.3)
8. Session persistence (combines 1.6, 18.1, 18.2)
9. Data persistence (combines 19.1, 19.2, 19.3, 19.4, 19.5, 19.6)
10. Heatmap data generation (combines 11.1, 11.2)
11. Responsive design (combines 6.6, 14.6, 15.1-15.6)
12. Keyboard navigation (combines 17.3, 22.1-22.5)
13. Theme persistence (combines 16.1, 16.2, 16.3)
14. Timezone handling (combines 29.1, 29.2, 29.3, 29.4)


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Streak Calculation Correctness

*For any* habit with a set of check-ins and target days, the current streak should equal the count of consecutive target days completed up to today, and the longest streak should equal the maximum consecutive target days ever completed.

**Validates: Requirements 10.1, 10.2, 10.3, 10.4**

### Property 2: Completion Rate Calculation

*For any* habit with a set of check-ins and target days in a given period (week or month), the completion rate should equal (completed target days / total target days in period) × 100, and should be between 0 and 100.

**Validates: Requirements 12.1, 12.2**

### Property 3: Habit Filtering by Target Days

*For any* dashboard view and any habit, if today is not in the habit's target days, the habit should not be displayed; if today is in the target days, the habit should be displayed.

**Validates: Requirements 6.1, 6.2, 26.1, 26.2**

### Property 4: Check-In Recording and Persistence

*For any* habit and any date, when a check-in is recorded, the check-in should be persisted to the database and retrievable with the same date and completion status.

**Validates: Requirements 7.1, 7.4, 19.1, 19.2**

### Property 5: Undo Check-In Reversal

*For any* check-in recorded within the same calendar day, undoing the check-in should remove it from the database and revert the streak to its previous value; after 24 hours, undo should not be allowed.

**Validates: Requirements 9.2, 9.3, 9.4**

### Property 6: Habit CRUD Operations

*For any* habit creation, update, or deletion operation, the operation should succeed with valid input, persist to the database, and be retrievable or removed as appropriate; invalid input should be rejected with an error message.

**Validates: Requirements 2.3, 3.2, 4.2, 5.1, 5.5**

### Property 7: Form Validation

*For any* form submission with invalid input (invalid email format, password < 8 characters, empty required fields), the form should reject the submission and display an error message; with valid input, the form should accept the submission.

**Validates: Requirements 1.4, 1.5, 2.4, 31.1, 31.2, 31.3**

### Property 8: Session Persistence

*For any* authenticated user, after logging in, the session should persist across browser refreshes and page reloads; after logout, the session should be cleared and the user should be redirected to the login page.

**Validates: Requirements 1.6, 18.1, 18.2**

### Property 9: Data Persistence Round-Trip

*For any* habit or check-in data created or modified by a user, the data should be persisted to Supabase and retrievable with the same values; deleted data should not be retrievable.

**Validates: Requirements 19.1, 19.2, 19.3, 19.4, 19.5, 19.6**

### Property 10: Heatmap Data Generation

*For any* habit with check-in history, the heatmap should display the past 12 months of data with color intensity representing completion status (darker for completed, lighter for incomplete).

**Validates: Requirements 11.1, 11.2**

### Property 11: Responsive Layout Adaptation

*For any* screen width from 375px to 1920px, the dashboard and stats views should display correctly with appropriate layout (single column on mobile, multi-column on larger screens) and all interactive elements should be touch-friendly (minimum 44px × 44px).

**Validates: Requirements 6.6, 14.6, 15.1, 15.2, 15.3, 15.4, 15.5, 15.6**

### Property 12: Keyboard Navigation

*For any* interactive element on the page, it should be focusable via Tab key, activatable via Enter/Space, and display a visible focus indicator; Escape should close modals.

**Validates: Requirements 17.3, 22.1, 22.2, 22.3, 22.4, 22.5**

### Property 13: Theme Persistence

*For any* user who toggles between dark and light modes, the preference should be persisted in local storage and restored on subsequent page loads; both modes should maintain WCAG AA contrast ratios.

**Validates: Requirements 16.1, 16.2, 16.3, 16.4, 16.5**

### Property 14: Timezone-Aware Date Handling

*For any* user in any timezone, check-ins should be recorded with the user's local date, reminders should be scheduled based on the user's local timezone, and historical data should display dates in the user's local timezone.

**Validates: Requirements 29.1, 29.2, 29.3, 29.4**

### Property 15: Quantity-Based Habit Completion Logic

*For any* quantity-based habit with a target quantity, a check-in with quantity >= target should mark the habit complete; a check-in with quantity < target should mark it incomplete.

**Validates: Requirements 8.4, 8.5**

### Property 16: Habit Archival State Management

*For any* archived habit, it should not appear in the active habits list; when unarchived, it should reappear in the active list; archival should preserve all historical check-in data.

**Validates: Requirements 5.1, 5.2, 5.4, 5.5**

### Property 17: Animation Completion Time

*For any* check-in or undo animation, the animation should complete within 500ms; users with prefers-reduced-motion enabled should see animations complete in 0.01ms.

**Validates: Requirements 20.1, 20.2, 20.3, 20.4, 20.5**

### Property 18: Habit Display Consistency

*For any* habit displayed across Dashboard, Habits, and Stats views, the emoji icon, name, and color tag should be consistent; the current and longest streaks should match the calculated values.

**Validates: Requirements 6.3, 6.4, 6.5, 14.1, 14.2**

### Property 19: Reminder Scheduling and Notification

*For any* habit with a reminder time set, a push notification should be sent at the scheduled time with the habit name; clicking the notification should navigate to the dashboard.

**Validates: Requirements 13.2, 13.3, 13.4**

### Property 20: Habit Name Uniqueness Validation

*For any* user, creating or editing a habit with a name that already exists (excluding the habit being edited) should display a warning; the system should allow proceeding or choosing a different name.

**Validates: Requirements 32.1, 32.2, 32.3**

---

## Error Handling

### Error Categories

1. **Authentication Errors**
   - Invalid email format → Display "Please enter a valid email address"
   - Password too short → Display "Password must be at least 8 characters"
   - Email already exists → Display "This email is already registered"
   - Invalid credentials → Display "Email or password is incorrect"

2. **Database Errors**
   - Connection failure → Display "Unable to connect to server. Please check your connection."
   - Timeout → Display "Request timed out. Please try again."
   - Constraint violation → Display "This action cannot be completed. Please try again."

3. **Validation Errors**
   - Empty required field → Display "This field is required"
   - Invalid input format → Display "Please enter a valid value"
   - Duplicate habit name → Display "A habit with this name already exists"

4. **Network Errors**
   - Offline → Display "You are offline. Some features may be limited."
   - Slow connection → Display "Connection is slow. Please wait..."

### Error Recovery

- Retry buttons for failed operations
- Automatic retry for transient errors (with exponential backoff)
- Graceful degradation for offline scenarios
- Clear next steps for user action

---

## Testing Strategy

### Dual Testing Approach

StreakFlow uses both unit tests and property-based tests to ensure comprehensive coverage:

- **Unit Tests**: Verify specific examples, edge cases, and error conditions
- **Property Tests**: Verify universal properties across all inputs

### Unit Testing

Unit tests focus on:
- Specific examples that demonstrate correct behavior
- Integration points between components
- Edge cases and error conditions
- UI interactions and animations

Example unit tests:
- Login with valid credentials succeeds
- Creating a habit without a name shows error
- Deleting a habit shows confirmation dialog
- Undo is disabled after 24 hours
- Archived habits don't appear in dashboard

### Property-Based Testing

Property tests verify universal properties using randomized inputs. Each property test:
- Runs minimum 100 iterations
- Generates random valid inputs
- Verifies the property holds for all inputs
- References the design document property

**Property Test Configuration**:
- Library: fast-check (JavaScript/TypeScript)
- Minimum iterations: 100
- Seed: Random (for reproducibility)
- Timeout: 5 seconds per test

**Test Tag Format**:
```typescript
// Feature: streakflow, Property 1: Streak Calculation Correctness
test('Property 1: Streak calculation correctness', () => {
  fc.assert(
    fc.property(
      // generators
      (habit, checkIns, targetDays) => {
        // property verification
      }
    ),
    { numRuns: 100 }
  );
});
```

### Test Coverage Goals

- **Acceptance Criteria**: 100% of testable criteria covered
- **Code Coverage**: Minimum 80% line coverage
- **Property Coverage**: All 20 correctness properties tested
- **Edge Cases**: All identified edge cases tested

### Testing Tools

- **Unit Testing**: Vitest
- **Property-Based Testing**: fast-check
- **Component Testing**: React Testing Library
- **E2E Testing**: Playwright (future enhancement)
- **Accessibility Testing**: axe-core

### Test Organization

```
tests/
├── unit/
│   ├── auth.test.ts
│   ├── habits.test.ts
│   ├── checkIns.test.ts
│   ├── streaks.test.ts
│   └── completionRate.test.ts
├── properties/
│   ├── streakCalculation.test.ts
│   ├── completionRate.test.ts
│   ├── habitFiltering.test.ts
│   ├── checkInPersistence.test.ts
│   ├── undoLogic.test.ts
│   ├── habitCRUD.test.ts
│   ├── formValidation.test.ts
│   ├── sessionPersistence.test.ts
│   ├── dataPersistence.test.ts
│   ├── heatmapGeneration.test.ts
│   ├── responsiveLayout.test.ts
│   ├── keyboardNavigation.test.ts
│   ├── themePersistence.test.ts
│   ├── timezoneHandling.test.ts
│   ├── quantityHabits.test.ts
│   ├── habitArchival.test.ts
│   ├── animations.test.ts
│   ├── habitDisplay.test.ts
│   ├── reminders.test.ts
│   └── habitNameUniqueness.test.ts
└── integration/
    ├── authFlow.test.ts
    ├── habitCreationFlow.test.ts
    ├── checkInFlow.test.ts
    └── dashboardFlow.test.ts
```

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
- Project setup (React, TypeScript, Tailwind, Supabase)
- Database schema creation
- Authentication implementation
- State management setup (Zustand stores)

### Phase 2: Core Features (Weeks 3-4)
- Habit CRUD operations
- Check-in recording and undo
- Streak calculation
- Dashboard view

### Phase 3: Analytics & Visualization (Weeks 5-6)
- Heatmap component
- Completion rate calculations
- Stats dashboard
- Habit detail view

### Phase 4: Notifications & Polish (Weeks 7-8)
- Reminder system and push notifications
- Animations and micro-interactions
- Form validation and error handling
- Loading states

### Phase 5: Accessibility & PWA (Weeks 9-10)
- WCAG AA compliance audit
- Keyboard navigation
- ARIA labels and semantic HTML
- Service worker and manifest.json
- PWA installation

### Phase 6: Testing & Optimization (Weeks 11-12)
- Unit test suite
- Property-based tests
- Performance optimization
- Mobile testing and refinement

