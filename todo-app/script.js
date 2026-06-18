(function () {
  'use strict';

  const STORAGE_KEY = 'todoAppTasks';

  const state = {
    tasks: [],
    filter: 'all',
  };

  const newTaskInput = document.getElementById('new-task');
  const addBtn = document.getElementById('add-btn');
  const taskList = document.getElementById('task-list');
  const filterSection = document.querySelector('.filters');
  const itemsLeftEl = document.getElementById('items-left');

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function loadTasks() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw);
      state.tasks = Array.isArray(parsed.tasks) ? parsed.tasks : [];
      state.filter = parsed.filter || 'all';
    } catch (err) {
      console.error('Failed to load tasks from localStorage', err);
      state.tasks = [];
      state.filter = 'all';
    }
  }

  function saveTasks() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ tasks: state.tasks, filter: state.filter })
    );
  }

  function getVisibleTasks() {
    if (state.filter === 'active') {
      return state.tasks.filter((task) => !task.completed);
    }
    if (state.filter === 'completed') {
      return state.tasks.filter((task) => task.completed);
    }
    return state.tasks;
  }

  function addTask(title) {
    const trimmed = title.trim();
    if (!trimmed) return;

    state.tasks.unshift({
      id: generateId(),
      title: trimmed,
      completed: false,
      createdAt: Date.now(),
    });

    saveTasks();
    render();
  }

  function toggleComplete(id) {
    const task = state.tasks.find((t) => t.id === id);
    if (!task) return;

    task.completed = !task.completed;
    saveTasks();
    render();
  }

  function editTask(id, newTitle) {
    const trimmed = newTitle.trim();
    const task = state.tasks.find((t) => t.id === id);
    if (!task) return;

    if (!trimmed) {
      deleteTask(id);
      return;
    }

    task.title = trimmed;
    saveTasks();
    render();
  }

  function deleteTask(id) {
    state.tasks = state.tasks.filter((t) => t.id !== id);
    saveTasks();
    render();
  }

  function setFilter(filter) {
    state.filter = filter;
    saveTasks();
    render();
  }

  function updateItemsLeft() {
    const count = state.tasks.filter((t) => !t.completed).length;
    itemsLeftEl.textContent = `${count} item${count === 1 ? '' : 's'} left`;
  }

  function updateFilterButtons() {
    filterSection.querySelectorAll('.filter-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.filter === state.filter);
    });
  }

  function createTaskElement(task) {
    const li = document.createElement('li');
    li.className = 'task-item' + (task.completed ? ' completed' : '');
    li.dataset.id = task.id;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-toggle';
    checkbox.checked = task.completed;
    checkbox.setAttribute('aria-label', `Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`);

    const title = document.createElement('span');
    title.className = 'task-title';
    title.textContent = task.title;

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'task-edit';
    editBtn.setAttribute('aria-label', `Edit "${task.title}"`);
    editBtn.textContent = 'Edit';

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'task-delete';
    deleteBtn.setAttribute('aria-label', `Delete "${task.title}"`);
    deleteBtn.textContent = 'Delete';

    li.append(checkbox, title, editBtn, deleteBtn);
    return li;
  }

  function startEditing(li, id) {
    const task = state.tasks.find((t) => t.id === id);
    if (!task) return;

    li.innerHTML = '';
    li.classList.add('editing');

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'task-edit-input';
    input.value = task.title;
    input.setAttribute('aria-label', 'Edit task title');

    const saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.className = 'task-save';
    saveBtn.textContent = 'Save';

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'task-cancel';
    cancelBtn.textContent = 'Cancel';

    li.append(input, saveBtn, cancelBtn);
    input.focus();
    input.select();

    function commit() {
      editTask(id, input.value);
    }

    function cancel() {
      render();
    }

    saveBtn.addEventListener('click', commit);
    cancelBtn.addEventListener('click', cancel);

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') commit();
      if (e.key === 'Escape') cancel();
    });
  }

  function renderTasks() {
    const visible = getVisibleTasks();
    taskList.innerHTML = '';

    if (visible.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'task-empty';
      empty.textContent =
        state.filter === 'completed'
          ? 'No completed tasks yet.'
          : state.filter === 'active'
            ? 'All tasks completed!'
            : 'No tasks yet. Add one above.';
      taskList.appendChild(empty);
      return;
    }

    visible.forEach((task) => {
      taskList.appendChild(createTaskElement(task));
    });
  }

  function render() {
    renderTasks();
    updateFilterButtons();
    updateItemsLeft();
  }

  taskList.addEventListener('click', (e) => {
    const li = e.target.closest('.task-item');
    if (!li) return;

    const id = li.dataset.id;

    if (e.target.matches('.task-toggle')) {
      toggleComplete(id);
      return;
    }

    if (e.target.matches('.task-delete')) {
      deleteTask(id);
      return;
    }

    if (e.target.matches('.task-edit')) {
      startEditing(li, id);
    }
  });

  taskList.addEventListener('dblclick', (e) => {
    const title = e.target.closest('.task-title');
    if (!title) return;

    const li = title.closest('.task-item');
    if (!li) return;

    startEditing(li, li.dataset.id);
  });

  addBtn.addEventListener('click', () => {
    addTask(newTaskInput.value);
    newTaskInput.value = '';
    newTaskInput.focus();
  });

  newTaskInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      addTask(newTaskInput.value);
      newTaskInput.value = '';
    }
  });

  filterSection.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    setFilter(btn.dataset.filter);
  });

  loadTasks();
  render();
})();
