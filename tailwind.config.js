/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark mode colors
        'slate-950': '#0F172A',
        'slate-900': '#1E293B',
        'slate-700': '#334155',
        'slate-300': '#CBD5E1',
        'slate-100': '#F1F5F9',
        // Habit colors
        'habit-red': '#EF4444',
        'habit-blue': '#3B82F6',
        'habit-green': '#10B981',
        'habit-yellow': '#FBBF24',
        'habit-purple': '#A855F7',
        'habit-pink': '#EC4899',
      },
      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '1024px',
        'lg': '1920px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'h1': ['32px', { lineHeight: '1.2', fontWeight: '700' }],
        'h2': ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        'h3': ['20px', { lineHeight: '1.4', fontWeight: '600' }],
        'body': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'small': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'caption': ['12px', { lineHeight: '1.4', fontWeight: '400' }],
      },
      spacing: {
        '44': '44px',
      },
      borderRadius: {
        'card': '12px',
        'button': '8px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.1)',
      },
    },
  },
  darkMode: 'class',
  plugins: [],
}
