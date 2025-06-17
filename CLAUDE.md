# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Frontend (React)
```bash
cd frontend
npm start          # Development server on localhost:3000
npm run build      # Production build
```

### Backend (Flask)
```bash
cd backend
python app.py      # Development server on localhost:5000
```

The frontend automatically proxies API requests to the backend server.

## Architecture Overview

Tayra is a full-stack task management application with a React frontend and Flask backend using SQLite database.

**Frontend Structure (Modular):**
- `src/App.js` - Main application component (~280 lines)
- `src/components/` - Reusable UI components
  - `TaskItem.js` - Individual task display and editing
  - `Sidebar.js` - Navigation and category management
  - `TodayView.js` - Today's tasks with sections
- `src/hooks/` - Custom React hooks for business logic
  - `useTasks.js` - Task management state and operations
  - `useCategories.js` - Category management
- `src/api.js` - Centralized API communication
- `src/taskUtils.js` - Task filtering and organization utilities
- Uses Tailwind CSS utilities implemented in custom CSS
- Drag-and-drop day planning interface
- Keyboard shortcuts (Spacebar for quick add, Escape to close)

**Backend Structure:**
- Flask REST API in `backend/app.py` (clean, minimal)
- SQLAlchemy ORM with SQLite database
- Three main tables: Category, Task, Subtask
- Database auto-initializes with default categories

**Key Features:**
- Full CRUD operations for tasks with subtasks
- Category-based organization with color coding
- Priority levels and due date scheduling
- Ephemeral tasks (auto-delete if incomplete)
- Multiple views: Today, All Tasks

## Database Schema

Tasks have rich properties including:
- Basic: title, description, notes
- Scheduling: due_date, do_date
- Organization: category, priority
- Behavior: ephemeral flag, completion status
- Relationships: subtasks with individual completion

## API Endpoints

Base URL: `http://localhost:5000/api`

**Categories:**
- `GET /categories` - Fetch all categories
- `POST /categories` - Create new category
- `DELETE /categories/<id>` - Delete category (moves tasks to General)

**Tasks:**
- `GET /tasks` - Fetch all tasks
- `POST /tasks` - Create task
- `PUT /tasks/<id>` - Update task
- `DELETE /tasks/<id>` - Delete task

**Subtasks:**
- `POST /tasks/<id>/subtasks` - Create subtask
- `PUT /subtasks/<id>` - Update subtask

**Health:**
- `GET /health` - Health check

## Development Notes

- Database file: `backend/instance/tayra.db`
- Default categories: General (Gray), Work (Blue), Personal (Green), Health (Orange)
- Uses UUID strings for database IDs
- Frontend state managed with React hooks
- No authentication system implemented


## Goals
Most importantly, the app should be focused on a flow that emphasizes the tasks that you have deliberately scheduled to do for the day. The most important list should be a "today" list, which you can add things to as appropriate.

Features for a todo app:
- Subtasks for tasks
- Distinction between due dates and :do dates" - the date you intend to do a task
- Marking tasks as dependencies of each other (and hiding the dependent items until they can be complete)
- Being able to get push notifications/configured reminders for tasks
- Quick add functionality both on phone and website (on website, with a keyboard shortcut, like space)
- Day planning: prompt every morning and open an easy UI to drag in tasks to be scheduled for the day
- No auto-rollover of tasks - unless I have explicitly scheduled a task for today, it should not appear on my list for the day
- Complex recurring tasks: for instance, "schedule this for the first weekend of every month", "schedule this two days after I check off the last instance of this recurring task", "every four days"
- Divide the "today" list into Important and Extra categories
- Configurable categories, with a default category
- Ephemeral tasks: add a task and if it isn't completed in one day it is deleted
- Deep links: ability to link to an individual task
- Bonus: project vs task distinction
- Bonus: projects can be sequential or parallel
- Bonus: Add notes to tasks

Integrations/apps:
- Android app
- Web interface
- Android widget that allows viewing and adding tasks
- Firefox extension that allows viewing and adding tasks
- Discord bot integration