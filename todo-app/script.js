/**
 * To-Do List Application
 * ES6 | DOM Manipulation | Event Handling | localStorage
 */

const STORAGE_KEY = "todo-app-tasks";

// --- State Management ---
const state = {
  tasks: [],
  filter: "all",
  editingId: null,
};

// --- DOM References ---
const elements = {
  form: document.getElementById("todo-form"),
  input: document.getElementById("todo-input"),
  list: document.getElementById("todo-list"),
  taskCount: document.getElementById("task-count"),
  clearCompleted: document.getElementById("clear-completed"),
  emptyState: document.getElementById("empty-state"),
  filterButtons: document.querySelectorAll(".filter-btn"),
};

// --- Local Storage (Data Persistence) ---

function loadFromLocalStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) {
      state.tasks = parsed;
    }
  } catch {
    state.tasks = [];
  }
}

function saveToLocalStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
}

// --- CRUD Operations ---

function createTask(text) {
  const trimmed = text.trim();
  if (!trimmed) return false;

  state.tasks.unshift({
    id: crypto.randomUUID(),
    text: trimmed,
    completed: false,
    createdAt: Date.now(),
  });

  saveToLocalStorage();
  return true;
}

function readTasks() {
  return state.tasks;
}

function updateTask(id, updates) {
  const index = state.tasks.findIndex((task) => task.id === id);
  if (index === -1) return false;

  state.tasks[index] = { ...state.tasks[index], ...updates };
  saveToLocalStorage();
  return true;
}

function deleteTask(id) {
  const index = state.tasks.findIndex((task) => task.id === id);
  if (index === -1) return false;

  state.tasks.splice(index, 1);
  saveToLocalStorage();
  return true;
}

function toggleTaskComplete(id) {
  const task = state.tasks.find((t) => t.id === id);
  if (!task) return;
  updateTask(id, { completed: !task.completed });
}

function clearCompletedTasks() {
  state.tasks = state.tasks.filter((task) => !task.completed);
  saveToLocalStorage();
}

// --- Filtering ---

function getFilteredTasks() {
  const { tasks, filter } = state;

  if (filter === "active") return tasks.filter((task) => !task.completed);
  if (filter === "completed") return tasks.filter((task) => task.completed);
  return tasks;
}

function setFilter(filter) {
  state.filter = filter;
  state.editingId = null;

  elements.filterButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.filter === filter);
  });

  render();
}

// --- DOM Manipulation ---

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function createTaskElement(task) {
  const li = document.createElement("li");
  li.className = `todo-item${task.completed ? " completed" : ""}`;
  li.dataset.id = task.id;

  const isEditing = state.editingId === task.id;

  li.innerHTML = `
    <input
      type="checkbox"
      class="todo-checkbox"
      ${task.completed ? "checked" : ""}
      aria-label="Toggle complete"
    />
    ${
      isEditing
        ? `<input type="text" class="todo-text-input" value="${escapeHtml(task.text)}" />`
        : `<span class="todo-text">${escapeHtml(task.text)}</span>`
    }
    <div class="todo-actions">
      ${
        isEditing
          ? `<button type="button" class="btn-icon save" title="Save">✓</button>
             <button type="button" class="btn-icon cancel" title="Cancel">✕</button>`
          : `<button type="button" class="btn-icon edit" title="Edit">✎</button>
             <button type="button" class="btn-icon delete" title="Delete">🗑</button>`
      }
    </div>
  `;

  if (isEditing) {
    const editInput = li.querySelector(".todo-text-input");
    editInput.focus();
    editInput.setSelectionRange(editInput.value.length, editInput.value.length);
  }

  return li;
}

function renderTaskList() {
  elements.list.replaceChildren();

  const filtered = getFilteredTasks();
  filtered.forEach((task) => {
    elements.list.appendChild(createTaskElement(task));
  });

  const hasAnyTasks = readTasks().length > 0;
  const hasVisibleTasks = filtered.length > 0;

  elements.emptyState.hidden = hasVisibleTasks;
  elements.emptyState.textContent = !hasAnyTasks
    ? "No tasks yet. Add one above!"
    : `No ${state.filter} tasks to show.`;
}

function renderStats() {
  const activeCount = readTasks().filter((task) => !task.completed).length;
  const completedCount = readTasks().length - activeCount;

  elements.taskCount.textContent =
    activeCount === 1 ? "1 task left" : `${activeCount} tasks left`;

  elements.clearCompleted.hidden = completedCount === 0;
}

function render() {
  renderTaskList();
  renderStats();
}

// --- Update (Edit Mode) ---

function startEditing(id) {
  state.editingId = id;
  render();
}

function finishEditing(id, newText) {
  const trimmed = newText.trim();

  if (!trimmed) {
    deleteTask(id);
  } else {
    updateTask(id, { text: trimmed });
  }

  state.editingId = null;
  render();
}

function cancelEditing() {
  state.editingId = null;
  render();
}

// --- Event Handling (Delegated Listeners) ---

elements.form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (createTask(elements.input.value)) {
    elements.input.value = "";
    render();
  }

  elements.input.focus();
});

elements.filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => setFilter(btn.dataset.filter));
});

elements.clearCompleted.addEventListener("click", () => {
  clearCompletedTasks();
  render();
});

elements.list.addEventListener("click", (event) => {
  const item = event.target.closest(".todo-item");
  if (!item) return;

  const { id } = item.dataset;

  if (event.target.matches(".todo-checkbox")) {
    toggleTaskComplete(id);
    render();
    return;
  }

  if (event.target.matches(".todo-text, .edit")) {
    startEditing(id);
    return;
  }

  if (event.target.matches(".delete")) {
    deleteTask(id);
    render();
    return;
  }

  if (event.target.matches(".save")) {
    const input = item.querySelector(".todo-text-input");
    finishEditing(id, input.value);
    return;
  }

  if (event.target.matches(".cancel")) {
    cancelEditing();
  }
});

elements.list.addEventListener("keydown", (event) => {
  const item = event.target.closest(".todo-item");
  if (!item || !event.target.matches(".todo-text-input")) return;

  const { id } = item.dataset;

  if (event.key === "Enter") {
    event.preventDefault();
    finishEditing(id, event.target.value);
  }

  if (event.key === "Escape") {
    event.preventDefault();
    cancelEditing();
  }
});

// --- Initialize App ---
loadFromLocalStorage();
render();
