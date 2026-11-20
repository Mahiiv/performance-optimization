// Test file for TaskTracker component
// Using Vitest, React Testing Library, and user-event

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskTracker from './TaskTracker';

describe('TaskTracker - Happy Path', () => {
  afterEach(() => {
    // Reset any fake timers and mocks after each test
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // 1. Check initial page elements: heading, form inputs, and submit button
  it('renders the heading "Performance Optimization", form inputs (Title, Owner, Priority), and an Add Task button', async () => {
    // Render the component
    render(<TaskTracker />);

    // Wait for the main heading to appear
    const heading = await screen.findByRole('heading', { name: /performance optimization/i });
    expect(heading).toBeInTheDocument();

    // Check that Title input exists
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();

    // Check that Owner input exists
    expect(screen.getByLabelText(/owner/i)).toBeInTheDocument();

    // Check that Priority dropdown exists with Low, Medium, High options
    const prioritySelect = screen.getByLabelText(/priority/i);
    expect(prioritySelect).toBeInTheDocument();
    expect(within(prioritySelect).getByRole('option', { name: /low/i })).toBeInTheDocument();
    expect(within(prioritySelect).getByRole('option', { name: /medium/i })).toBeInTheDocument();
    expect(within(prioritySelect).getByRole('option', { name: /high/i })).toBeInTheDocument();

    // Check that the Add Task button exists
    expect(screen.getByRole('button', { name: /add task/i })).toBeInTheDocument();
  });

  // 2. Filling the form and clicking Add Task adds the task to the list
  it('adds a new task to the list when the form is submitted', async () => {
    const user = userEvent.setup();
    render(<TaskTracker />);

    await screen.findByRole('heading', { name: /performance optimization/i });

    // Fill in the task details
    await user.type(screen.getByLabelText(/title/i), 'Optimize Image Loading');
    await user.type(screen.getByLabelText(/owner/i), 'Sarah');
    await user.selectOptions(screen.getByLabelText(/priority/i), 'High');

    // Click the Add Task button
    await user.click(screen.getByRole('button', { name: /add task/i }));

    // Check that the task is now displayed in the list with all its info
    expect(await screen.findByText('Optimize Image Loading', {}, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.getByText(/sarah/i)).toBeInTheDocument();
    expect(within(screen.getByRole('list')).getByText(/high/i)).toBeInTheDocument();
  });

  // 3. Search box filters the list by title
  it('filters the list of tasks by title using the search box', async () => {
    const user = userEvent.setup();
    render(<TaskTracker />);

    await screen.findByRole('heading', { name: /performance optimization/i });

    // Add first task
    await user.clear(screen.getByLabelText(/title/i));
    await user.type(screen.getByLabelText(/title/i), 'Minify Javascript Bundle');
    await user.clear(screen.getByLabelText(/owner/i));
    await user.type(screen.getByLabelText(/owner/i), 'Alex');
    await user.selectOptions(screen.getByLabelText(/priority/i), 'Medium');
    await user.click(screen.getByRole('button', { name: /add task/i }));
    await screen.findByText('Minify Javascript Bundle', {}, { timeout: 3000 });

    // Add second task
    await user.clear(screen.getByLabelText(/title/i));
    await user.type(screen.getByLabelText(/title/i), 'Compress Hero Images');
    await user.clear(screen.getByLabelText(/owner/i));
    await user.type(screen.getByLabelText(/owner/i), 'Bob');
    await user.selectOptions(screen.getByLabelText(/priority/i), 'Low');
    await user.click(screen.getByRole('button', { name: /add task/i }));
    await screen.findByText('Compress Hero Images', {}, { timeout: 3000 });

    // Find the search input
    const searchInput = screen.getByLabelText(/search/i);

    // Filter by typing 'Minify'
    await user.type(searchInput, 'Minify');

    // Only 'Minify Javascript Bundle' should be visible
    expect(screen.getByText('Minify Javascript Bundle')).toBeInTheDocument();
    expect(screen.queryByText('Compress Hero Images')).not.toBeInTheDocument();

    // Clear search filter
    await user.clear(searchInput);

    // Both tasks should show up again
    expect(screen.getByText('Minify Javascript Bundle')).toBeInTheDocument();
    expect(screen.getByText('Compress Hero Images')).toBeInTheDocument();
  });

  // 4. Each task has a "Mark done" button that marks it done
  it('marks a task as done when clicking the "Mark done" button', async () => {
    const user = userEvent.setup();
    render(<TaskTracker />);

    await screen.findByRole('heading', { name: /performance optimization/i });

    // Add a task
    await user.type(screen.getByLabelText(/title/i), 'Enable Gzip Compression');
    await user.type(screen.getByLabelText(/owner/i), 'Dave');
    await user.selectOptions(screen.getByLabelText(/priority/i), 'High');
    await user.click(screen.getByRole('button', { name: /add task/i }));

    // Wait for the task to be added and locate its "Mark done" button
    await screen.findByText('Enable Gzip Compression', {}, { timeout: 3000 });
    const markDoneButton = screen.getByRole('button', { name: /mark done/i });
    expect(markDoneButton).toBeInTheDocument();

    // Click "Mark done"
    await user.click(markDoneButton);

    // The task should now show it is done (e.g. status shows Done, line-through style, or button disabled/updated)
    const taskTitle = screen.getByText('Enable Gzip Compression');
    const doneStatus = screen.queryByText(/^done$/i) || screen.queryByText(/completed/i);
    const hasLineThrough = taskTitle.style.textDecoration.includes('line-through') ||
                          taskTitle.closest('li, tr, div')?.style.textDecoration.includes('line-through');
    const isButtonDoneOrDisabled = markDoneButton.disabled || screen.queryByRole('button', { name: /^done$/i });

    expect(Boolean(doneStatus || hasLineThrough || isButtonDoneOrDisabled)).toBe(true);
  });
});

describe('TaskTracker - Unhappy Path', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // 5a. Empty state when task list has no tasks
  it('shows "No data found" when the task list is empty', async () => {
    render(<TaskTracker />);

    // When no tasks exist yet, show the empty state
    expect(await screen.findByText(/no data found/i)).toBeInTheDocument();
  });

  // 5b. Empty state when search finds no matching tasks
  it('shows "No data found" when a search query finds no matching tasks', async () => {
    const user = userEvent.setup();
    render(<TaskTracker />);

    await screen.findByRole('heading', { name: /performance optimization/i });

    // Add a task
    await user.type(screen.getByLabelText(/title/i), 'Audit Lighthouse Score');
    await user.type(screen.getByLabelText(/owner/i), 'Emma');
    await user.click(screen.getByRole('button', { name: /add task/i }));
    await screen.findByText('Audit Lighthouse Score', {}, { timeout: 3000 });

    // Search for a keyword that does not match
    const searchInput = screen.getByLabelText(/search/i);
    await user.type(searchInput, 'NonExistentTask12345');

    // Should display "No data found" and hide the previous task
    expect(screen.getByText(/no data found/i)).toBeInTheDocument();
    expect(screen.queryByText('Audit Lighthouse Score')).not.toBeInTheDocument();
  });

  // 6a. Loading indicator on first load using fake timers
  it('shows a loading indicator with "Loading..." on first load until delay completes', async () => {
    // Turn on fake timers before rendering
    vi.useFakeTimers();

    render(<TaskTracker />);

    // Immediately on mount, role="status" should show "Loading..."
    const loadingIndicator = screen.getByRole('status');
    expect(loadingIndicator).toBeInTheDocument();
    expect(loadingIndicator).toHaveTextContent(/loading\.\.\./i);

    // Fast-forward fake timers for the loading delay
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // The loading indicator should disappear after delay
    expect(screen.queryByText(/loading\.\.\./i)).not.toBeInTheDocument();
  });

  // 6b. Saving indicator while saving a task using fake timers
  it('shows a saving indicator with "Saving..." while saving a new task until delay completes', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(<TaskTracker />);

    // Advance fake timers so initial loading finishes
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Fill in task form
    await user.type(screen.getByLabelText(/title/i), 'Server-Side Caching');
    await user.type(screen.getByLabelText(/owner/i), 'George');
    await user.selectOptions(screen.getByLabelText(/priority/i), 'High');

    // Click Add Task to start saving
    await user.click(screen.getByRole('button', { name: /add task/i }));

    // While saving, role="status" should display "Saving..."
    const savingIndicator = screen.getByRole('status');
    expect(savingIndicator).toBeInTheDocument();
    expect(savingIndicator).toHaveTextContent(/saving\.\.\./i);

    // Fast-forward fake timers for the save delay
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Saving indicator is gone and the saved task is now in the list
    expect(screen.queryByText(/saving\.\.\./i)).not.toBeInTheDocument();
    expect(screen.getByText('Server-Side Caching')).toBeInTheDocument();
  });

  // 7a. Validation: empty Title prevents submission, sets aria-invalid="true", red border, and error
  it('prevents submission, marks Title invalid with aria-invalid and red border, and shows error message when Title is empty', async () => {
    const user = userEvent.setup();
    render(<TaskTracker />);

    await screen.findByRole('heading', { name: /performance optimization/i });

    const titleInput = screen.getByLabelText(/title/i);
    const ownerInput = screen.getByLabelText(/owner/i);
    const addButton = screen.getByRole('button', { name: /add task/i });

    // Leave Title empty and only fill Owner
    await user.type(ownerInput, 'John Doe');
    await user.click(addButton);

    // Title input must have aria-invalid="true"
    expect(titleInput).toHaveAttribute('aria-invalid', 'true');

    // Title input must have a red border style
    const titleBorder = titleInput.style.border || titleInput.style.borderColor;
    expect(titleBorder).toMatch(/red|rgb\(255,\s*0,\s*0\)/i);

    // An error message should be displayed on screen
    expect(screen.getByText(/required|error|empty/i)).toBeInTheDocument();

    // Form must not submit: list remains empty ("No data found")
    expect(screen.getByText(/no data found/i)).toBeInTheDocument();
  });

  // 7b. Validation: empty Owner prevents submission, sets aria-invalid="true", red border, and error
  it('prevents submission, marks Owner invalid with aria-invalid and red border, and shows error message when Owner is empty', async () => {
    const user = userEvent.setup();
    render(<TaskTracker />);

    await screen.findByRole('heading', { name: /performance optimization/i });

    const titleInput = screen.getByLabelText(/title/i);
    const ownerInput = screen.getByLabelText(/owner/i);
    const addButton = screen.getByRole('button', { name: /add task/i });

    // Fill Title and leave Owner empty
    await user.type(titleInput, 'Reduce DOM Size');
    await user.click(addButton);

    // Owner input must have aria-invalid="true"
    expect(ownerInput).toHaveAttribute('aria-invalid', 'true');

    // Owner input must have a red border style
    const ownerBorder = ownerInput.style.border || ownerInput.style.borderColor;
    expect(ownerBorder).toMatch(/red|rgb\(255,\s*0,\s*0\)/i);

    // An error message should be displayed
    expect(screen.getByText(/required|error|empty/i)).toBeInTheDocument();

    // Form must not submit: task was not added
    expect(screen.queryByText('Reduce DOM Size')).not.toBeInTheDocument();
    expect(screen.getByText(/no data found/i)).toBeInTheDocument();
  });
});

describe('TaskTracker - Non-Functional Requirements', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // 8a. Accessibility: every input, select and button has an accessible name
  it('ensures every input, select, and button has an accessible name', async () => {
    render(<TaskTracker />);

    await screen.findByRole('heading', { name: /performance optimization/i });

    // Find all interactive inputs, selects, and buttons
    const interactiveElements = document.querySelectorAll('input, select, button');
    expect(interactiveElements.length).toBeGreaterThan(0);

    // Every interactive control must have an accessible name (label, aria-label, aria-labelledby, or button text)
    interactiveElements.forEach((element) => {
      const ariaLabel = element.getAttribute('aria-label');
      const hasAssociatedLabel = Boolean(element.labels && element.labels.length > 0);
      const ariaLabelledby = element.getAttribute('aria-labelledby');
      const isButtonWithText = element.tagName.toLowerCase() === 'button' && element.textContent.trim().length > 0;

      const hasAccessibleName = Boolean(ariaLabel || hasAssociatedLabel || ariaLabelledby || isButtonWithText);
      expect(hasAccessibleName).toBe(true);
    });
  });

  // 8b. Accessibility: form must work with keyboard only
  it('allows filling and submitting the form using keyboard navigation only', async () => {
    const user = userEvent.setup();
    render(<TaskTracker />);

    await screen.findByRole('heading', { name: /performance optimization/i });

    const titleInput = screen.getByLabelText(/title/i);
    const ownerInput = screen.getByLabelText(/owner/i);
    const prioritySelect = screen.getByLabelText(/priority/i);
    const addButton = screen.getByRole('button', { name: /add task/i });

    // Tab to the Title input
    await user.tab();
    while (document.activeElement !== titleInput && document.activeElement !== document.body) {
      await user.tab();
    }
    expect(titleInput).toHaveFocus();

    // Type the title using keyboard
    await user.keyboard('Keyboard Friendly Task');

    // Tab to Owner input
    await user.tab();
    expect(ownerInput).toHaveFocus();

    // Type owner using keyboard
    await user.keyboard('Hannah');

    // Tab to Priority dropdown
    await user.tab();
    expect(prioritySelect).toHaveFocus();

    // Tab to Add Task button
    await user.tab();
    expect(addButton).toHaveFocus();

    // Press Enter to submit the form
    await user.keyboard('{Enter}');

    // The task should be added successfully to the list
    expect(await screen.findByText('Keyboard Friendly Task', {}, { timeout: 3000 })).toBeInTheDocument();
  });

  // 9. Analytics: console.log called with exact string on add task and mark done
  it('calls console.log with the exact analytics message when a task is added or marked done', async () => {
    const user = userEvent.setup();

    // Spy on console.log
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    render(<TaskTracker />);

    await screen.findByRole('heading', { name: /performance optimization/i });

    // Add a new task
    await user.type(screen.getByLabelText(/title/i), 'Defer Offscreen Images');
    await user.type(screen.getByLabelText(/owner/i), 'Ivan');
    await user.selectOptions(screen.getByLabelText(/priority/i), 'High');
    await user.click(screen.getByRole('button', { name: /add task/i }));

    await screen.findByText('Defer Offscreen Images', {}, { timeout: 3000 });

    // Check that console.log was called with the exact analytics string
    const expectedAnalyticsMsg = '[Analytics] User interacted with Performance Optimization';
    expect(consoleSpy).toHaveBeenCalledWith(expectedAnalyticsMsg);

    // Reset call history before checking mark done
    consoleSpy.mockClear();

    // Click "Mark done"
    const markDoneButton = screen.getByRole('button', { name: /mark done/i });
    await user.click(markDoneButton);

    // Check that console.log was called again with the exact analytics string
    expect(consoleSpy).toHaveBeenCalledWith(expectedAnalyticsMsg);
  });

  // 10. Security: strips script tags to prevent XSS
  it('does not contain script tags in the saved text when title includes a script tag', async () => {
    const user = userEvent.setup();
    render(<TaskTracker />);

    await screen.findByRole('heading', { name: /performance optimization/i });

    // Type a title containing script tags
    await user.type(screen.getByLabelText(/title/i), 'Safe Title <script>alert(1)</script>');
    await user.type(screen.getByLabelText(/owner/i), 'Judy');
    await user.click(screen.getByRole('button', { name: /add task/i }));

    // Wait for the task to be saved
    const savedTask = await screen.findByText(/safe title/i, {}, { timeout: 3000 });

    // Ensure the saved text does not contain any script tags
    expect(savedTask.textContent).not.toContain('<script>');
    expect(savedTask.textContent).not.toContain('</script>');

    // Ensure no <script> tag was inserted into the document
    expect(document.body.innerHTML).not.toContain('<script>');
    expect(document.body.innerHTML).not.toContain('</script>');
  });
});
