# StreakFlow - Habit Tracker

A mobile-first personal habit tracker web application built with React, TypeScript, Tailwind CSS, and Supabase.

## Features

- Create and manage daily habits
- Track streaks and completion rates
- Visualize habit history with heatmaps
- Set daily reminders
- Dark mode support
- Fully responsive design (375px minimum width)
- PWA-ready with offline support

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **State Management**: Zustand
- **Backend**: Supabase (PostgreSQL + Auth)
- **Build Tool**: Vite
- **Testing**: Vitest, fast-check (property-based testing)

## Getting Started

### Prerequisites

- Node.js 18+ (or 20+ for latest features)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open http://localhost:5173 in your browser

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Project Structure

```
src/
├── components/       # Reusable components
├── pages/           # Page components
├── stores/          # Zustand stores
├── lib/             # Utilities and helpers
├── types/           # TypeScript types
├── App.tsx          # Main app component
├── main.tsx         # Entry point
└── index.css        # Global styles
```

## Database Schema

See `design.md` for detailed database schema and API documentation.

## Testing

### Unit Tests
```bash
npm run test
```

### Property-Based Tests
```bash
npm run test:properties
```

## Accessibility

StreakFlow is built with WCAG AA compliance in mind:
- Semantic HTML
- Keyboard navigation
- ARIA labels
- High contrast ratios
- Focus indicators

## License

MIT
