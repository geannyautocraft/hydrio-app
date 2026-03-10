# Hydrio

Hydrio is a hydration tracking app that helps users monitor daily water intake and build healthy hydration habits.

## Features

### Core Tracking
- Quick water intake logging with customizable preset buttons
- Custom amount input with validation (max 2000 ml per entry)
- Circular progress visualization with dynamic color states
- Daily log with inline editing and delete confirmation
- Configurable daily hydration goal

### Hydration Intelligence
- Dynamic feedback messages based on current intake
- Smart suggestions (e.g., "If you drink 250 ml now, you'll reach your goal!")
- Overhydration warnings when intake is significantly above goal
- Color-coded progress: blue (under goal), green (reached), orange (over), red (excess)

### History & Statistics
- 7-day hydration history with progress bars
- Daily average, best day, and goal streak tracking
- Statistics automatically appear after 2+ days of usage

### Daily Reset
- Automatic day detection at midnight
- Entries are scoped to each day via date keys
- Full history is preserved in localStorage

## Tech Stack

- **React 19** with TypeScript
- **Vite 7** for bundling
- **Tailwind CSS 4** for styling
- **Zustand 5** for state management
- **localStorage** for persistence

## Project Structure

```
src/
├── App.tsx                         # Root layout
├── main.tsx                        # Entry point
├── index.css                       # Global styles + Tailwind
├── components/
│   ├── Header.tsx                  # App header with status
│   ├── HydrationProgress.tsx       # Circular progress indicator
│   ├── HydrationInsights.tsx       # Smart feedback banner
│   ├── HydrationHistory.tsx        # 7-day history view
│   ├── HydrationStats.tsx          # Statistics card
│   ├── QuickAddButtons.tsx         # Preset quick-add buttons
│   ├── CustomWaterInput.tsx        # Manual amount input
│   ├── DailyLogList.tsx            # Today's log container
│   ├── DailyLogItem.tsx            # Individual log entry
│   └── GoalEditor.tsx              # Settings panel
├── store/
│   └── useHydrationStore.ts        # Zustand store with persistence
├── hooks/
│   ├── useMidnightReset.ts         # Midnight day transition
│   ├── useHydrationInsights.ts     # Dynamic feedback logic
│   └── useHydrationStats.ts        # Aggregated statistics
├── utils/
│   └── date.ts                     # Date formatting utilities
└── types/
    └── index.ts                    # Shared TypeScript types
```

## Getting Started

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` — Start development server
- `npm run build` — Production build
- `npm run preview` — Preview production build
- `npm run lint` — Run ESLint
