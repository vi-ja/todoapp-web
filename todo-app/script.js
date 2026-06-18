(function(){
  const STORAGE_KEY = 'todos:v1';

  // State
  let state = {
    todos: [],
    filter: 'all' // all | active | completed
  };

  // Elements
  const newTodoInput = document.getElementById('newTodoInput');
  const addBtn = document.getElementById('addBtn');
  const todoList = document.getElementById('todoList');
  const filters = document.querySelectorAll('.filter');
  const clearCompletedBtn = document.getElementById('clearCompleted');
  const itemsLeft = document.getElementById('itemsLeft');

  // Persistence
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      state = raw ? JSON.parse(raw) : state;
      if (!state.todos) state.todos = [];
      if (!state.filter) state.filter = 'all';
    } catch (e) {
      console.error('Failed to load todos', e);
    }
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  // Helpers
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2,8); }

  function addTodo(title){
    title = title && title.trim();
    if (!title) return;
    state.todos.unshift({ id: uid(), title, completed: false });
    save();
    render();
  }

  function updateTodo(id, patch){
    const i = state.todos.findIndex(t => t.id === id);
    if (i === -1) return;
    state.todos[i] = Object.assign({}, state.todos[i], patch);
    save();
    render();
  }

  function deleteTodo(id){
    state.todos = state.todos.filter(t => t.id !== id);
    save();
    render();
  }

  function clearCompleted(){
    state.todos = state.todos.filter(t => !t.completed);
    save();
    render();
  }

  function setFilter(f){
    state.filter = f;
    save();
    render();
  }

  function visibleTodos(){
    if (state.filter === 'active') return state.todos.filter(t => !t.completed);
    if (state.filter === 'completed') return state.todos.filter(t => t.completed);
    return state.todos;
  }

  // Rendering
  function render(){
    // render list
    const items = visibleTodos();
    todoList.innerHTML = '';

    for (const todo of items){
      const li = document.createElement('li');
      li.className = 'todo-item' + (todo.completed ? ' completed' : '');
      li.dataset.id = todo.id;

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = !!todo.completed;
      checkbox.className = 'toggle';
      checkbox.setAttribute('aria-label', 'Toggle todo');

      const title = document.createElement('div');
      title.className = 'title';
      title.textContent = todo.title;
      title.tabIndex = 0;

      const editBtn = document.createElement('button');
      editBtn.className = 'edit-btn';
      editBtn.title = 'Edit';
      editBtn.textContent = '✎';

      const delBtn = document.createElement('button');
      delBtn.className = 'delete-btn';
      delBtn.title = 'Delete';
      delBtn.textContent = '✕';

      li.appendChild(checkbox);
      li.appendChild(title);
      li.appendChild(editBtn);
      li.appendChild(delBtn);

      todoList.appendChild(li);
    }

    // update filters UI
    filters.forEach(btn => btn.classList.toggle('active', btn.dataset.filter === state.filter));

    // items left
    const left = state.todos.filter(t => !t.completed).length;
    itemsLeft.textContent = `${left} item${left !== 1 ? 's' : ''} left`;
  }

  // Event handling (delegation)
  todoList.addEventListener('click', (e) => {
    const li = e.target.closest('li');
    if (!li) return;
    const id = li.dataset.id;

    if (e.target.matches('.toggle')){
      updateTodo(id, { completed: e.target.checked });
      return;
    }

    if (e.target.matches('.delete-btn')){
      deleteTodo(id);
      return;
    }

    if (e.target.matches('.edit-btn')){
      startEditing(li, id);
      return;
    }
  });

  // double-click or Enter to edit title
  todoList.addEventListener('dblclick', (e) => {
    const li = e.target.closest('li');
    if (!li) return;
    const id = li.dataset.id;
    startEditing(li, id);
  });

  function startEditing(li, id){
    const todo = state.todos.find(t => t.id === id);
    if (!todo) return;

    li.innerHTML = '';
    li.classList.remove('completed');

    const input = document.createElement('input');
    input.className = 'edit';
    input.value = todo.title;

    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save';
    saveBtn.className = 'save-btn';

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.className = 'cancel-btn';

    li.appendChild(input);
    li.appendChild(saveBtn);
    li.appendChild(cancelBtn);

    input.focus();

    function commit(){
      const v = input.value.trim();
      if (!v) {
        deleteTodo(id);
      } else {
        updateTodo(id, { title: v });
      }
    }

    saveBtn.addEventListener('click', commit);
    cancelBtn.addEventListener('click', () => render());

    input.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') commit();
      if (ev.key === 'Escape') render();
    });

    input.addEventListener('blur', () => {
      // small timeout to allow click on save/cancel
      setTimeout(() => { if (document.activeElement !== saveBtn && document.activeElement !== cancelBtn) commit(); }, 150);
    });
  }

  // Add new
  addBtn.addEventListener('click', () => { addTodo(newTodoInput.value); newTodoInput.value = ''; newTodoInput.focus(); });

  newTodoInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { addTodo(newTodoInput.value); newTodoInput.value = ''; } });

  // Filters
  document.querySelector('.filters').addEventListener('click', (e) => {
    if (!e.target.matches('.filter')) return;
    setFilter(e.target.dataset.filter);
  });

  clearCompletedBtn.addEventListener('click', clearCompleted);

  // Initialize
  load();
  render();
})();