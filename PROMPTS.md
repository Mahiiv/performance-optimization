# PROMPTS.md

Project: Performance Optimization task tracker for News Blog (React + Vite, tests with Vitest).
Tool used: Antigravity (Gemini 3.8 Flash High).
Method: test-driven development. Tests first, then the component.

---

## Prompt 1 - write the tests first

```
I am building a "Performance Optimization" task tracker in React (Vite) for a News Blog client. Their floor staff currently use paper and Excel sheets. The project already has Vitest, jsdom and React Testing Library installed, and the test setup file is src/setupTests.js.

IMPORTANT: Do NOT write the real component yet. Write ONLY the test file first, src/TaskTracker.test.jsx, for a component called TaskTracker (it will live in src/TaskTracker.jsx and have a default export). The tests should FAIL right now because the component does not exist yet.

The app: staff add performance tasks (title, owner, priority Low/Medium/High), search them, and mark them done.

Write tests for these requirements:

HAPPY PATH
1. The page shows a heading "Performance Optimization", a task form (Title, Owner, Priority) and an "Add Task" button.
2. Filling the form and clicking "Add Task" adds the task to the list.
3. A search box filters the list by title.
4. Each task has a "Mark done" button that marks it done.

UNHAPPY PATH
5. Empty state: when the list is empty, or a search finds nothing, show the text "No data found".
6. Loading: on first load and while saving a task, show a visible loading indicator (role="status") with the text "Loading..." or "Saving...". Use Vitest fake timers for the delays.
7. Invalid input: if Title or Owner is empty, the form must NOT submit. Those fields must get aria-invalid="true" and a red border style, and show an error message.

NON-FUNCTIONAL
8. Accessibility: every input, select and button must have an accessible name (aria-label or a label), and the form must work with the keyboard only.
9. Analytics: when a task is added or marked done, console.log is called with exactly: "[Analytics] User interacted with Performance Optimization". Spy on console.log.
10. Security: if the title contains <script>alert(1)</script>, the saved text must not contain script tags.

RULES: Use Vitest + @testing-library/react + @testing-library/user-event. Beginner-level code with simple casual comments. No custom hooks. Tell me the list of tests when you are done.
```

**Result:** The agent wrote src/TaskTracker.test.jsx. I ran `npm test` and the tests failed, which is correct because the component did not exist yet.

---

## Prompt 2 - write the component so the tests pass

```
Now write the real component to make ALL the tests in src/TaskTracker.test.jsx pass. Create src/TaskTracker.jsx (default export TaskTracker) and show it in src/App.jsx. Do not change the tests unless a test is clearly wrong, and tell me if you change one.

RULES:
- Beginner-level React. Simple code, casual comments like I am explaining it to myself. No custom hooks, no extra abstractions, keep the logic inline in the component.
- Use useMemo for the filtered list and useCallback for the handler functions (add task, mark done, search change), as the brief requires.
- Use useState for state. Fake the loading with setTimeout (no real backend).
- Clean text inputs against XSS before saving them in state (strip <script> tags and HTML characters).
- After a task is added or marked done, run console.log("[Analytics] User interacted with Performance Optimization").
- Empty state: show "No data found".
- Invalid form: block the submit, set aria-invalid="true", show a red border and an error message under the field.
- Accessibility: aria-labels on every input, select and button, keyboard friendly, a visible focus outline, a main heading.
- Styling: one CSS file. Only grey, black and white colors written as rgb() (red only for errors, also as rgb()). NO hex colors, NO CSS variables, NO rem units, px only. Padding in 16px or 32px steps. Use id selectors for styling, not a big class system.
- Zero ESLint warnings and no unused imports.

When done, run npm test and npm run lint and tell me the results.
```

**Result:** The agent created src/TaskTracker.jsx and updated src/App.jsx. All 14 of 14 tests passed and ESLint showed zero warnings.

---

## Final checks (done by me, by hand)

- `npm test`: 14 of 14 tests passed
- `npm run lint`: zero warnings
- Lighthouse accessibility score: 100
- Checked in the browser: empty state ("No data found"), loading and saving indicators, red invalid fields, the console analytics message, keyboard Tab navigation

## What I learned

- Writing the tests first made the requirements clear before any code existed.
- The AI follows the brief better when each rule is listed one by one.
- I still checked the results myself (tests, lint, Lighthouse and the browser) instead of trusting the agent.