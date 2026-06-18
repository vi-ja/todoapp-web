# To-Do List Application

A fully functional, client-side To-Do List built with HTML5, CSS3, and vanilla JavaScript (ES6). Tasks are managed in memory with a single state object, rendered dynamically to the DOM, and persisted automatically in the browser using `localStorage`.

## Features

- **Create** — Add new tasks via the Add button or Enter key
- **Read** — Display all tasks in a dynamic list
- **Update** — Edit task titles inline; mark tasks as completed or active
- **Delete** — Remove tasks individually
- **Filtering** — View All, Active, or Completed tasks
- **Persistence** — Tasks and the active filter survive page refresh and browser restarts
- **Responsive UI** — Clean, modern layout that works on desktop and mobile

## Project Structure

```
todo-app/
├── index.html   # App markup and layout
├── style.css    # Styles and responsive design
└── script.js    # State management, DOM logic, and localStorage
```

## Technologies

| Technology | Purpose |
|---|---|
| HTML5 | Semantic structure and accessibility |
| CSS3 | Layout, theming, animations, media queries |
| JavaScript (ES6) | State, CRUD operations, event handling |
| `localStorage` | Client-side data persistence |

## Getting Started

No build step or dependencies are required.

1. Clone or download this repository.
2. Open `todo-app/index.html` in any modern browser.
3. Start adding tasks.

Alternatively, serve the folder with a local static server:

```bash
# Using Python
python -m http.server 8080

# Using Node (npx)
npx serve todo-app
```

Then visit `http://localhost:8080` (adjust the port if needed).

## Usage

| Action | How |
|---|---|
| Add a task | Type in the input field and click **Add** or press **Enter** |
| Complete a task | Check the checkbox next to the task |
| Edit a task | Click **Edit**, or double-click the task title |
| Save edit | Click **Save** or press **Enter** |
| Cancel edit | Click **Cancel** or press **Escape** |
| Delete a task | Click **Delete** |
| Filter tasks | Use the **All**, **Active**, or **Completed** buttons |

## How It Works

### State

The app keeps a central state object:

```js
{
  tasks: [{ id, title, completed, createdAt }, ...],
  filter: 'all' | 'active' | 'completed'
}
```

Every user action updates state, saves to `localStorage`, and triggers a re-render.

### Persistence

- **Storage key:** `todoAppTasks`
- **Format:** JSON string containing `tasks` and `filter`
- **When saved:** After every create, update, delete, toggle, or filter change
- **When loaded:** On page load via `loadTasks()`

### Event Handling

Event listeners use **delegation** on the task list and filter section, so handlers stay attached even when the DOM is rebuilt on each render.

## Browser Support

Works in all modern browsers that support ES6 and `localStorage` (Chrome, Firefox, Safari, Edge).

## License

This project is open source and available for learning and personal use.
