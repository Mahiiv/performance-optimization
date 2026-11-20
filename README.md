# Performance Optimization Tracker

A small React app for News Blog floor staff to track performance tasks, replacing paper and Excel sheets.

## Features
- Add tasks with title, owner and priority
- Search tasks by title
- Mark tasks as done
- "No data found" message for empty lists and empty searches
- Loading and saving indicators for slow connections
- Form validation with red fields and error messages
- Keyboard friendly, Lighthouse accessibility score 100
- Text inputs are cleaned against XSS before saving
- Console analytics message after each main action

## Tech
React (Vite), Vitest, React Testing Library, ESLint

## Run it
1. `npm install`
2. `npm run dev`

## Tests and lint
- `npm test` (14 tests)
- `npm run lint`

## Process
Built test-first with an AI assistant. All prompts are in `PROMPTS.md`.
