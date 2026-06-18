# To-Do App

A small client-side To‑Do List application demonstrating DOM manipulation, event handling, and local persistence with `localStorage`.

## Features

- Create, Read, Update, Delete (CRUD) tasks
- Persist tasks automatically using `window.localStorage` (key: `todo-app-tasks`)
- Filter tasks: All, Active, Completed
- Inline edit, mark complete, clear completed
- Accessible, state-driven DOM updates with delegated event handling

## File structure

- `index.html` — main markup
- `style.css` — styles
- `script.js` — application logic and state management

## Run locally

You can open `index.html` directly in a browser, or serve it using a simple static server.

Python 3:

```bash
cd "c:\Users\vijay\OneDrive\Desktop\todoapp web\todo-app"
python -m http.server 8000
```

Then open http://localhost:8000 in your browser.

## Data persistence

Tasks are stored in `localStorage` under the key `todo-app-tasks`. Clearing browser storage will remove saved tasks.

## Development notes

- The app uses `crypto.randomUUID()` for task IDs (modern browsers required).
- Event delegation is used on the task list for performance and simpler DOM updates.

## License

MIT — feel free to use and modify.
