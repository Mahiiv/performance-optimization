// TaskTracker component
// Built for news blog floor staff to track performance optimization tasks
// Kept simple with casual comments and inline React hooks

import { useState, useEffect, useMemo, useCallback } from 'react';
import './TaskTracker.css';

export default function TaskTracker() {
  // --- STATE ---
  // Store all created tasks in an array
  const [tasks, setTasks] = useState([]);

  // Form input fields
  const [title, setTitle] = useState('');
  const [owner, setOwner] = useState('');
  const [priority, setPriority] = useState('Low');

  // Search input query
  const [searchTerm, setSearchTerm] = useState('');

  // Status flags for simulated delays (no real backend)
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Field-level validation error states
  const [titleError, setTitleError] = useState(false);
  const [ownerError, setOwnerError] = useState(false);

  // --- INITIAL LOAD DELAY ---
  // Simulate an initial network load using setTimeout
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // --- HELPER FUNCTION: XSS SANITIZATION ---
  // Remove script tags and dangerous HTML characters before saving to state
  const cleanInput = (rawText) => {
    if (!rawText) return '';
    return rawText
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove <script>...</script>
      .replace(/<\/?script[^>]*>/gi, '') // Remove any dangling script tags
      .replace(/<[^>]+>/g, '') // Strip all HTML tags
      .replace(/[<>&"']/g, '') // Strip HTML characters
      .trim();
  };

  // --- MEMOIZED FILTERED LIST ---
  // useMemo filters tasks by title so we only recalculate when tasks or search change
  const filteredTasks = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) {
      return tasks;
    }
    return tasks.filter((task) =>
      task.title.toLowerCase().includes(query)
    );
  }, [tasks, searchTerm]);

  // --- HANDLER: SEARCH INPUT CHANGE ---
  // useCallback keeps the search handler stable across renders
  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  // --- HANDLER: ADD TASK ---
  // useCallback handles task validation, fake saving delay, and adding to state
  const handleAddTask = useCallback((e) => {
    e.preventDefault();

    // Clean inputs first
    const cleanedTitle = cleanInput(title);
    const cleanedOwner = cleanInput(owner);

    let hasValidationError = false;

    // Title validation: cannot be empty
    if (!title.trim() || !cleanedTitle) {
      setTitleError(true);
      hasValidationError = true;
    } else {
      setTitleError(false);
    }

    // Owner validation: cannot be empty
    if (!owner.trim() || !cleanedOwner) {
      setOwnerError(true);
      hasValidationError = true;
    } else {
      setOwnerError(false);
    }

    // Stop submission if validation failed
    if (hasValidationError) {
      return;
    }

    // Reset inputs immediately so the form is ready for the next task
    setTitle('');
    setOwner('');
    setPriority('Low');
    setTitleError(false);
    setOwnerError(false);

    // Turn on saving indicator
    setIsSaving(true);

    // Simulate save delay with setTimeout
    setTimeout(() => {
      const newTask = {
        id: Date.now(),
        title: cleanedTitle,
        owner: cleanedOwner,
        priority: priority,
        done: false,
      };

      setTasks((prevTasks) => [...prevTasks, newTask]);

      // Fire analytics log
      console.log('[Analytics] User interacted with Performance Optimization');

      // Finish saving
      setIsSaving(false);
    }, 200);
  }, [title, owner, priority]);

  // --- HANDLER: MARK TASK AS DONE ---
  // useCallback updates task status to done and triggers analytics
  const handleMarkDone = useCallback((taskId) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, done: true } : task
      )
    );

    // Fire analytics log
    console.log('[Analytics] User interacted with Performance Optimization');
  }, []);

  return (
    <div id="task-tracker-app">
      {/* Page Heading */}
      <h1 id="main-heading">Performance Optimization</h1>

      {/* Task Creation Form */}
      <section id="task-form-section">
        <form id="task-form" onSubmit={handleAddTask} noValidate>
          {/* Title Field */}
          <div id="title-group">
            <label id="title-label" htmlFor="title-input">
              Title
            </label>
            <input
              id="title-input"
              type="text"
              aria-label="Title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (titleError) setTitleError(false);
              }}
              aria-invalid={titleError ? 'true' : 'false'}
              style={{
                border: titleError
                  ? '1px solid rgb(255, 0, 0)'
                  : '1px solid rgb(128, 128, 128)',
              }}
            />
            {titleError && (
              <p id="title-error">
                Title is required
              </p>
            )}
          </div>

          {/* Owner Field */}
          <div id="owner-group">
            <label id="owner-label" htmlFor="owner-input">
              Owner
            </label>
            <input
              id="owner-input"
              type="text"
              aria-label="Owner"
              value={owner}
              onChange={(e) => {
                setOwner(e.target.value);
                if (ownerError) setOwnerError(false);
              }}
              aria-invalid={ownerError ? 'true' : 'false'}
              style={{
                border: ownerError
                  ? '1px solid rgb(255, 0, 0)'
                  : '1px solid rgb(128, 128, 128)',
              }}
            />
            {ownerError && (
              <p id="owner-error">
                Owner is required
              </p>
            )}
          </div>

          {/* Priority Field */}
          <div id="priority-group">
            <label id="priority-label" htmlFor="priority-select">
              Priority
            </label>
            <select
              id="priority-select"
              aria-label="Priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {/* Submit Button */}
          <button id="add-task-btn" type="submit" aria-label="Add Task">
            Add Task
          </button>
        </form>
      </section>

      {/* Search Box */}
      <section id="search-section">
        <label id="search-label" htmlFor="search-input">
          Search tasks
        </label>
        <input
          id="search-input"
          type="text"
          aria-label="Search tasks"
          placeholder="Search tasks by title..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </section>

      {/* Task List Section */}
      <section id="task-list-section">
        {/* Loading indicator on first load */}
        {isLoading ? (
          <div id="loading-indicator" role="status">
            Loading...
          </div>
        ) : (
          <>
            {/* Saving indicator while adding a task */}
            {isSaving && (
              <div id="saving-indicator" role="status">
                Saving...
              </div>
            )}

            {/* Empty state when no tasks match */}
            {filteredTasks.length === 0 ? (
              <p id="empty-state">No data found</p>
            ) : (
              <ul id="task-list">
                {filteredTasks.map((task) => (
                  <li key={task.id} id={`task-item-${task.id}`}>
                    <div id={`task-details-${task.id}`}>
                      <span
                        id={`task-title-${task.id}`}
                        style={{
                          textDecoration: task.done ? 'line-through' : 'none',
                          fontWeight: 'bold',
                          display: 'block',
                          marginBottom: '16px',
                        }}
                      >
                        {task.title}
                      </span>
                      <span
                        id={`task-owner-${task.id}`}
                        style={{ display: 'block', marginBottom: '16px' }}
                      >
                        Owner: {task.owner}
                      </span>
                      <span
                        id={`task-priority-${task.id}`}
                        style={{ display: 'block', marginBottom: '16px' }}
                      >
                        Priority: {task.priority}
                      </span>
                      <span
                        id={`task-status-${task.id}`}
                        style={{ display: 'block' }}
                      >
                        Status: {task.done ? 'Done' : 'Pending'}
                      </span>
                    </div>

                    <button
                      id={`mark-done-${task.id}`}
                      type="button"
                      aria-label={task.done ? 'Done' : 'Mark done'}
                      disabled={task.done}
                      onClick={() => handleMarkDone(task.id)}
                    >
                      {task.done ? 'Done' : 'Mark done'}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>
    </div>
  );
}
