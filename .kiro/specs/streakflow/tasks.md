# Implementation Plan: StreakFlow

## Overview

StreakFlow is a mobile-first habit tracking web application. This implementation plan breaks down the feature into discrete coding tasks organized by phase, with each task building incrementally on previous work. The plan includes property-based tests for universal correctness properties and unit tests for specific examples and edge cases.

## Phase 1: Foundation & Setup (Weeks 1-2)

- [ ] 1.1 Set up React + Vite + TypeScript project structure
  - Initialize Vite project with React and TypeScript templates
  - Configure TypeScript strict mode
  - Set up ESLint and Prettier
  - _Requirements: 40.1, 40.2, 40.3, 40.4_

- [ ] 1.2 Install and configure Tailwind CSS
  - Install Tailwind CSS and dependencies
  - Configure Tailwind config for dark mode
  - Set up responsive breakpoints (375px, 640px, 1024px, 1920px)
  - _Requirements: 15.1, 16.1, 24.1_

- [ ] 1.3 Set up Supabase project and authentication
  - Create Supabase project
  - Configure Supabase Auth with email/password provider
  - Install Supabase client library
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 1.4 Create database schema and tables
  - Create users table with timezone and theme preferences
  - Create habits table with all required fields
  - Create check_ins table with unique constraint
  - Create reminders table
  - Set up indexes for performance
  - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.6_

- [ ] 1.5 Set up Zustand state management stores
  - Create Auth store with login, signup, logout, session restore
  - Create Habits store with CRUD operations
  - Create Check-Ins store with recording and undo
  - Create UI store for theme, sorting, archived view toggle
  - _Requirements: 39.1, 39.2, 39.3, 39.4_

- [ ] 1.6 Implement authentication pages (Login & Signup)
  - Create LoginPage component with email/password form
  - Create SignupPage component with email/password form
  - Add form validation (email format, password length)
  - Add error message display
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 31.1, 31.2, 31.3_

- [ ]* 1.7 Write property test for form validation
  - **Property 7: Form Validation**
  - **Validates: Requirements 1.4, 1.5, 2.4, 31.1, 31.2, 31.3**

- [ ] 1.8 Implement session persistence and protected routes
  - Restore session on app load
  - Create ProtectedRoute component
  - Redirect unauthenticated users to login
  - _Requirements: 1.6, 1.7, 18.1, 18.2, 18.3, 18.4_

- [ ]* 1.9 Write property test for session persistence
  - **Property 8: Session Persistence**
  - **Validates: Requirements 1.6, 18.1, 18.2**

- [ ] 1.10 Set up routing structure
  - Configure React Router with protected routes
  - Create route structure: /login, /signup, /dashboard, /habits, /stats, /habits/:id
  - _Requirements: 6.1, 21.1, 14.1_

- [ ] 1.11 Create main layout and navigation
  - Create MainLayout component with bottom nav on mobile
  - Create Navigation component with Dashboard, Habits, Stats links
  - Implement responsive nav (bottom on mobile, top on desktop)
  - _Requirements: 22.1, 22.2, 22.3, 22.4, 22.5, 15.1, 15.2_

- [ ]* 1.12 Write unit tests for authentication flow
  - Test login with valid credentials
  - Test signup with valid credentials
  - Test error messages for invalid input
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 1.13 Checkpoint - Ensure all foundation tests pass
  - Ensure all tests pass, ask the user if questions arise.


## Phase 2: Core Habit Features (Weeks 3-4)

- [ ] 2.1 Create Habit data model and types
  - Define TypeScript interfaces for Habit, CreateHabitInput, UpdateHabitInput
  - Define CheckIn interface with date and quantity fields
  - Define Streak interface with current and longest values
  - _Requirements: 2.1, 2.2, 2.3, 8.1, 8.2_

- [ ] 2.2 Implement habit creation form and modal
  - Create HabitForm component with name, emoji, color, target days inputs
  - Add emoji picker component
  - Add color picker component with predefined colors
  - Add target days selector (checkboxes for Mon-Sun)
  - Add habit type selector (boolean or quantity-based)
  - _Requirements: 2.1, 2.2, 2.3, 35.1, 35.2, 35.3, 35.4, 36.1, 36.2, 36.3, 36.4_

- [ ] 2.3 Implement habit creation API and store action
  - Create createHabit action in Habits store
  - Call Supabase to insert habit
  - Update local store with new habit
  - Handle errors and display messages
  - _Requirements: 2.3, 19.1_

- [ ]* 2.4 Write property test for habit creation
  - **Property 6: Habit CRUD Operations**
  - **Validates: Requirements 2.3, 3.2, 4.2, 5.1, 5.5**

- [ ] 2.5 Implement habit editing form and modal
  - Create edit form pre-populated with current habit data
  - Allow editing name, emoji, color, target days
  - Prevent editing habit type (boolean/quantity)
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 2.6 Implement habit update API and store action
  - Create updateHabit action in Habits store
  - Call Supabase to update habit
  - Preserve historical check-in data
  - _Requirements: 3.2, 3.3, 19.2_

- [ ] 2.7 Implement habit deletion with confirmation
  - Create ConfirmDialog component
  - Show confirmation before deletion
  - Delete habit and cascade delete check-ins
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 2.8 Implement habit archival and unarchival
  - Create archiveHabit and unarchiveHabit actions
  - Update habit archived status in database
  - Filter archived habits from active list
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ]* 2.9 Write property test for habit archival
  - **Property 16: Habit Archival State Management**
  - **Validates: Requirements 5.1, 5.2, 5.4, 5.5**

- [ ] 2.10 Implement check-in recording system
  - Create recordCheckIn action in Check-Ins store
  - Insert check-in record to database
  - Update streak calculation
  - _Requirements: 7.1, 7.2, 7.4, 19.1_

- [ ] 2.11 Implement undo check-in functionality
  - Create undoCheckIn action with 24-hour validation
  - Delete check-in from database
  - Revert streak to previous value
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [ ]* 2.12 Write property test for undo check-in
  - **Property 5: Undo Check-In Reversal**
  - **Validates: Requirements 9.2, 9.3, 9.4**

- [ ] 2.13 Implement streak calculation logic
  - Create calculateCurrentStreak function
  - Create calculateLongestStreak function
  - Handle target days filtering
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [ ]* 2.14 Write property test for streak calculation
  - **Property 1: Streak Calculation Correctness**
  - **Validates: Requirements 10.1, 10.2, 10.3, 10.4**

- [ ] 2.15 Create HabitCard component for dashboard
  - Display habit emoji, name, color tag
  - Display current streak
  - Display completion indicator
  - Add check-in button
  - _Requirements: 6.3, 6.4, 6.5, 7.1, 25.1, 25.2, 25.3, 25.4_

- [ ] 2.16 Implement check-in animation
  - Add scale and fade animation on check-in
  - Add checkmark animation
  - Add streak counter increment animation
  - Respect prefers-reduced-motion
  - _Requirements: 7.3, 20.1, 20.2, 20.3, 20.4, 20.5_

- [ ] 2.17 Implement Dashboard view with habit filtering
  - Create Dashboard component
  - Filter habits by today's target days
  - Display all active habits for today
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 26.1, 26.2, 26.3_

- [ ]* 2.18 Write property test for habit filtering
  - **Property 3: Habit Filtering by Target Days**
  - **Validates: Requirements 6.1, 6.2, 26.1, 26.2**

- [ ] 2.19 Implement Habits view with list management
  - Create HabitsView component
  - Display all active habits with edit/delete/archive buttons
  - Display archived habits section
  - _Requirements: 21.1, 21.2, 21.3, 21.4, 21.5, 21.6_

- [ ] 2.20 Implement quantity-based habit check-in
  - Create numeric input for quantity-based habits
  - Validate quantity against target
  - Mark complete if quantity >= target
  - _Requirements: 8.3, 8.4, 8.5_

- [ ]* 2.21 Write property test for quantity-based completion
  - **Property 15: Quantity-Based Habit Completion Logic**
  - **Validates: Requirements 8.4, 8.5**

- [ ] 2.22 Checkpoint - Ensure all core feature tests pass
  - Ensure all tests pass, ask the user if questions arise.


## Phase 3: Analytics & Visualization (Weeks 5-6)

- [ ] 3.1 Implement completion rate calculation logic
  - Create calculateWeeklyCompletionRate function
  - Create calculateMonthlyCompletionRate function
  - Create calculateOverallCompletionRate function
  - Handle target days filtering
  - _Requirements: 12.1, 12.2_

- [ ]* 3.2 Write property test for completion rate calculation
  - **Property 2: Completion Rate Calculation**
  - **Validates: Requirements 12.1, 12.2**

- [ ] 3.3 Implement heatmap data generation
  - Create generateHeatmapData function for 12-month history
  - Generate color intensity based on completion
  - Handle quantity-based habits
  - _Requirements: 11.1, 11.2_

- [ ]* 3.4 Write property test for heatmap data generation
  - **Property 10: Heatmap Data Generation**
  - **Validates: Requirements 11.1, 11.2**

- [ ] 3.5 Create Heatmap component (GitHub-style calendar)
  - Display 12-month calendar grid
  - Color cells based on completion status
  - Add tooltip on hover with date and status
  - Display quantity values in tooltips for quantity habits
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ] 3.6 Create CheckInHistory component
  - Display list of recent check-ins with dates
  - Show quantity values for quantity-based habits
  - Paginate history (load 30 at a time)
  - _Requirements: 37.1, 37.2, 37.3, 37.4_

- [ ] 3.7 Create HabitDetailView page
  - Display habit with heatmap and check-in history
  - Show current and longest streaks
  - Show weekly and monthly completion rates
  - _Requirements: 11.1, 37.1, 37.2, 37.3, 37.4_

- [ ] 3.8 Create StreakDisplay component
  - Display current streak badge
  - Display longest streak badge
  - Use consistent styling across views
  - _Requirements: 10.5, 10.6, 14.1, 14.2_

- [ ] 3.9 Create CompletionRateCard component
  - Display weekly completion rate
  - Display monthly completion rate
  - Show percentage with visual indicator
  - _Requirements: 12.3, 12.4_

- [ ] 3.10 Create BestStreakCard component
  - Display habit with longest current streak
  - Show streak count and habit emoji
  - Highlight with special styling
  - _Requirements: 14.3_

- [ ] 3.11 Create StatsView page
  - Display all active habits with streaks
  - Display BestStreakCard
  - Display overall weekly completion rate
  - Display overall monthly completion rate
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [ ] 3.12 Implement responsive heatmap layout
  - Adapt heatmap to mobile screens
  - Ensure readability at 375px width
  - _Requirements: 11.5, 15.1, 15.2_

- [ ] 3.13 Implement habit sorting functionality
  - Add sort by creation date (default)
  - Add sort by current streak
  - Add sort by longest streak
  - Persist sort preference in local storage
  - _Requirements: 33.1, 33.2, 33.3, 33.4_

- [ ] 3.14 Create HabitStatCard component
  - Display habit with current/longest streaks
  - Display weekly/monthly completion rates
  - Use consistent styling
  - _Requirements: 14.1, 14.2, 12.3, 12.4_

- [ ] 3.15 Implement data display consistency
  - Ensure emoji, name, color consistent across views
  - Ensure streak values match calculations
  - _Requirements: 6.3, 6.4, 6.5, 14.1, 14.2_

- [ ]* 3.16 Write property test for habit display consistency
  - **Property 18: Habit Display Consistency**
  - **Validates: Requirements 6.3, 6.4, 6.5, 14.1, 14.2**

- [ ] 3.17 Checkpoint - Ensure all analytics tests pass
  - Ensure all tests pass, ask the user if questions arise.


## Phase 4: Notifications & Polish (Weeks 7-8)

- [ ] 4.1 Set up service worker for push notifications
  - Create service worker file
  - Register service worker in app
  - Handle notification events
  - _Requirements: 13.3, 13.4, 30.1, 30.2_

- [ ] 4.2 Implement reminder scheduling logic
  - Create scheduleReminder function
  - Calculate next reminder time
  - Handle timezone conversion
  - _Requirements: 13.1, 13.2, 29.1, 29.2, 29.3, 29.4_

- [ ] 4.3 Implement push notification sending
  - Create sendNotification function in service worker
  - Send notification with habit name and emoji
  - Handle notification click to navigate to dashboard
  - _Requirements: 13.3, 13.4_

- [ ]* 4.4 Write property test for reminder scheduling
  - **Property 19: Reminder Scheduling and Notification**
  - **Validates: Requirements 13.2, 13.3, 13.4**

- [ ] 4.5 Add reminder time picker to habit form
  - Create TimePicker component
  - Allow setting reminder time (HH:MM format)
  - Store reminder time in database
  - _Requirements: 13.1, 13.2_

- [ ] 4.6 Implement notification permission handling
  - Request browser notification permission
  - Display permission prompt if not granted
  - Handle permission denial gracefully
  - _Requirements: 13.6_

- [ ] 4.7 Implement undo animation
  - Create reverse animation for undo action
  - Animate streak counter decrement
  - Respect prefers-reduced-motion
  - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5_

- [ ] 4.8 Implement page transition animations
  - Add fade and slide animations between pages
  - Use consistent easing and duration
  - Respect prefers-reduced-motion
  - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5_

- [ ]* 4.9 Write property test for animation timing
  - **Property 17: Animation Completion Time**
  - **Validates: Requirements 20.1, 20.2, 20.3, 20.4, 20.5**

- [ ] 4.10 Implement form validation with error messages
  - Add real-time validation feedback
  - Display error messages below fields
  - Highlight invalid fields
  - _Requirements: 27.1, 27.2, 27.3, 27.4, 27.5, 31.1, 31.2, 31.3, 31.4, 31.5_

- [ ] 4.11 Implement loading states
  - Create LoadingSpinner component
  - Show loading state during data fetch
  - Show loading state during form submission
  - _Requirements: 28.1, 28.2, 28.3, 28.4_

- [ ] 4.12 Implement error message display
  - Create ErrorMessage component
  - Display errors from API calls
  - Display network error messages
  - _Requirements: 27.1, 27.2, 27.3, 27.4, 27.5_

- [ ] 4.13 Implement dark mode toggle
  - Create theme toggle button
  - Switch between dark and light modes
  - Persist theme preference in local storage
  - _Requirements: 16.1, 16.2, 16.3_

- [ ]* 4.14 Write property test for theme persistence
  - **Property 13: Theme Persistence**
  - **Validates: Requirements 16.1, 16.2, 16.3, 16.4, 16.5**

- [ ] 4.15 Implement habit name uniqueness validation
  - Check for duplicate names on create/edit
  - Display warning message
  - Allow user to proceed or change name
  - _Requirements: 32.1, 32.2, 32.3_

- [ ]* 4.16 Write property test for habit name uniqueness
  - **Property 20: Habit Name Uniqueness Validation**
  - **Validates: Requirements 32.1, 32.2, 32.3**

- [ ] 4.17 Implement responsive card layout
  - Create card components with consistent styling
  - Add shadows and rounded corners
  - Ensure responsive grid layout
  - _Requirements: 24.1, 24.2, 24.3, 24.4, 24.5_

- [ ] 4.18 Implement responsive typography
  - Use Inter font throughout
  - Set responsive font sizes
  - Maintain proper line spacing
  - _Requirements: 23.1, 23.2, 23.3, 23.4, 23.5_

- [ ] 4.19 Checkpoint - Ensure all polish tests pass
  - Ensure all tests pass, ask the user if questions arise.


## Phase 5: Accessibility & PWA (Weeks 9-10)

- [ ] 5.1 Implement keyboard navigation
  - Ensure all interactive elements are focusable
  - Add visible focus indicators
  - Implement Tab key navigation
  - _Requirements: 17.3, 22.1, 22.2, 22.3, 22.4, 22.5_

- [ ] 5.2 Implement Escape key handling
  - Close modals on Escape key
  - Close dropdowns on Escape key
  - _Requirements: 17.3_

- [ ]* 5.3 Write property test for keyboard navigation
  - **Property 12: Keyboard Navigation**
  - **Validates: Requirements 17.3, 22.1, 22.2, 22.3, 22.4, 22.5**

- [ ] 5.4 Add ARIA labels and descriptions
  - Add aria-label to icon-only buttons
  - Add aria-describedby to form errors
  - Add aria-live regions for dynamic updates
  - _Requirements: 17.2, 17.5, 17.6_

- [ ] 5.5 Implement semantic HTML
  - Use proper heading hierarchy
  - Use semantic elements (button, form, nav, etc.)
  - Use proper form labels
  - _Requirements: 17.2, 17.4_

- [ ] 5.6 Verify WCAG AA contrast ratios
  - Ensure 4.5:1 ratio for normal text
  - Ensure 3:1 ratio for large text
  - Ensure 3:1 ratio for interactive elements
  - Test in both dark and light modes
  - _Requirements: 16.4, 17.1_

- [ ] 5.7 Add alt text and descriptions
  - Add descriptive alt text for icons
  - Add aria-label for visual indicators
  - _Requirements: 17.2_

- [ ] 5.8 Implement touch-friendly button sizes
  - Ensure minimum 44px × 44px button size
  - Add adequate spacing between buttons
  - _Requirements: 15.4_

- [ ] 5.9 Create manifest.json for PWA
  - Add app name, short name, description
  - Add theme color and background color
  - Add app icons (192px and 512px)
  - _Requirements: 30.1_

- [ ] 5.10 Implement service worker caching strategy
  - Cache app shell (HTML, CSS, JS)
  - Cache critical assets (fonts, icons)
  - Implement network-first strategy for API calls
  - _Requirements: 30.2, 30.3_

- [ ] 5.11 Implement PWA install prompt
  - Detect PWA install eligibility
  - Display install prompt to user
  - Handle install and dismiss actions
  - _Requirements: 30.4_

- [ ] 5.12 Implement offline support
  - Cache check-in data locally (IndexedDB)
  - Queue offline check-ins for sync
  - Display offline indicator
  - _Requirements: 30.5_

- [ ] 5.13 Implement responsive layout for all screen sizes
  - Test at 375px (mobile minimum)
  - Test at 640px (tablet)
  - Test at 1024px (desktop)
  - Test at 1920px (large desktop)
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6_

- [ ]* 5.14 Write property test for responsive layout
  - **Property 11: Responsive Layout Adaptation**
  - **Validates: Requirements 6.6, 14.6, 15.1, 15.2, 15.3, 15.4, 15.5, 15.6**

- [ ] 5.15 Implement timezone detection and handling
  - Detect user's local timezone
  - Store timezone in user profile
  - Convert dates to user's timezone
  - _Requirements: 29.1, 29.2, 29.3, 29.4_

- [ ]* 5.16 Write property test for timezone handling
  - **Property 14: Timezone-Aware Date Handling**
  - **Validates: Requirements 29.1, 29.2, 29.3, 29.4**

- [ ] 5.17 Implement data persistence round-trip
  - Verify all data persists to Supabase
  - Verify deleted data is removed
  - Verify updates are reflected
  - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.6_

- [ ]* 5.18 Write property test for data persistence
  - **Property 9: Data Persistence Round-Trip**
  - **Validates: Requirements 19.1, 19.2, 19.3, 19.4, 19.5, 19.6**

- [ ] 5.19 Implement check-in persistence
  - Verify check-ins persist to database
  - Verify check-ins are retrievable
  - _Requirements: 7.4, 19.1, 19.2_

- [ ]* 5.20 Write property test for check-in persistence
  - **Property 4: Check-In Recording and Persistence**
  - **Validates: Requirements 7.1, 7.4, 19.1, 19.2**

- [ ] 5.21 Checkpoint - Ensure all accessibility tests pass
  - Ensure all tests pass, ask the user if questions arise.


## Phase 6: Testing & Optimization (Weeks 11-12)

- [ ] 6.1 Set up Vitest testing framework
  - Install Vitest and dependencies
  - Configure Vitest for React and TypeScript
  - Set up test utilities (React Testing Library)
  - _Requirements: 40.1, 40.2, 40.3, 40.4_

- [ ] 6.2 Set up fast-check for property-based testing
  - Install fast-check library
  - Configure property test generators
  - Set up test runners for properties
  - _Requirements: 40.1, 40.2, 40.3, 40.4_

- [ ] 6.3 Write unit tests for authentication
  - Test login with valid credentials
  - Test signup with valid credentials
  - Test error handling for invalid input
  - Test session persistence
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

- [ ] 6.4 Write unit tests for habit CRUD operations
  - Test habit creation
  - Test habit editing
  - Test habit deletion
  - Test habit archival
  - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 6.5 Write unit tests for check-in operations
  - Test check-in recording
  - Test undo check-in
  - Test 24-hour undo window
  - _Requirements: 7.1, 7.2, 7.4, 9.1, 9.2, 9.3, 9.4_

- [ ] 6.6 Write unit tests for streak calculations
  - Test current streak calculation
  - Test longest streak calculation
  - Test streak reset on missed day
  - Test streak with non-target days
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [ ] 6.7 Write unit tests for completion rate calculations
  - Test weekly completion rate
  - Test monthly completion rate
  - Test overall completion rate
  - _Requirements: 12.1, 12.2_

- [ ] 6.8 Write unit tests for heatmap generation
  - Test 12-month data generation
  - Test color intensity mapping
  - Test quantity value display
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ] 6.9 Write unit tests for form validation
  - Test email format validation
  - Test password length validation
  - Test required field validation
  - Test error message display
  - _Requirements: 1.4, 1.5, 2.4, 31.1, 31.2, 31.3, 31.4, 31.5_

- [ ] 6.10 Write unit tests for UI components
  - Test HabitCard rendering
  - Test Dashboard filtering
  - Test HabitsView display
  - Test StatsView display
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 14.1, 14.2, 14.3, 14.4, 14.5, 21.1, 21.2, 21.3, 21.4, 21.5, 21.6_

- [ ] 6.11 Write unit tests for animations
  - Test check-in animation timing
  - Test undo animation timing
  - Test page transition animations
  - _Requirements: 7.3, 20.1, 20.2, 20.3, 20.4, 20.5_

- [ ] 6.12 Write unit tests for theme persistence
  - Test dark mode toggle
  - Test light mode toggle
  - Test theme persistence in local storage
  - _Requirements: 16.1, 16.2, 16.3_

- [ ] 6.13 Write unit tests for keyboard navigation
  - Test Tab key navigation
  - Test Escape key handling
  - Test focus indicators
  - _Requirements: 17.3, 22.1, 22.2, 22.3, 22.4, 22.5_

- [ ] 6.14 Write unit tests for responsive layout
  - Test layout at 375px width
  - Test layout at 640px width
  - Test layout at 1024px width
  - Test layout at 1920px width
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6_

- [ ] 6.15 Write unit tests for timezone handling
  - Test timezone detection
  - Test date conversion to user timezone
  - Test reminder scheduling in user timezone
  - _Requirements: 29.1, 29.2, 29.3, 29.4_

- [ ] 6.16 Write unit tests for reminder scheduling
  - Test reminder time storage
  - Test notification sending
  - Test notification click handling
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_

- [ ] 6.17 Optimize bundle size
  - Analyze bundle with webpack-bundle-analyzer
  - Remove unused dependencies
  - Implement code splitting for routes
  - _Requirements: 40.1, 40.2, 40.3, 40.4_

- [ ] 6.18 Optimize rendering performance
  - Use React.memo for list items
  - Implement useMemo for expensive calculations
  - Debounce scroll and resize events
  - _Requirements: 40.1, 40.2, 40.3, 40.4_

- [ ] 6.19 Optimize data fetching
  - Implement caching strategy
  - Lazy load heatmap data
  - Paginate check-in history
  - _Requirements: 40.1, 40.2, 40.3, 40.4_

- [ ] 6.20 Test mobile responsiveness
  - Test on iPhone 12 (390px)
  - Test on iPhone SE (375px)
  - Test on iPad (768px)
  - Test on Android devices
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6_

- [ ] 6.21 Test accessibility compliance
  - Run axe-core accessibility audit
  - Test with screen reader (NVDA/JAWS)
  - Test keyboard navigation
  - Verify WCAG AA contrast ratios
  - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6_

- [ ] 6.22 Test PWA functionality
  - Test service worker installation
  - Test offline functionality
  - Test install prompt
  - Test manifest.json validity
  - _Requirements: 30.1, 30.2, 30.3, 30.4, 30.5_

- [ ] 6.23 Final checkpoint - Ensure all tests pass
  - Ensure all unit tests pass
  - Ensure all property tests pass
  - Ensure code coverage >= 80%
  - Ask the user if questions arise.

- [ ] 6.24 Prepare deployment artifacts
  - Build production bundle
  - Generate source maps
  - Create deployment documentation
  - _Requirements: 40.1, 40.2, 40.3, 40.4_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP, but are recommended for comprehensive testing
- Each task references specific requirements for traceability
- Property-based tests validate universal correctness properties across all inputs
- Unit tests validate specific examples and edge cases
- Checkpoints ensure incremental validation and allow for course correction
- All code should follow TypeScript strict mode and ESLint rules
- All components should be fully responsive and accessible
