import json
import os
from tool_code import write_todos

TODO_FILE = os.path.join(os.path.dirname(__file__), "todos.json")

def load_todos():
    if not os.path.exists(TODO_FILE):
        return []
    with open(TODO_FILE, "r") as f:
        return json.load(f)

def save_todos(todos):
    with open(TODO_FILE, "w") as f:
        json.dump(todos, f, indent=2)

def display_todos(todos):
    todos_for_display = []
    for todo in todos:
        todos_for_display.append({
            "description": f"ID: {todo['id']} - {todo['description']}",
            "status": todo["status"]
        })
    write_todos(todos=todos_for_display)

def add_todo(description):
    todos = load_todos()
    new_id = 1 if not todos else max(todo["id"] for todo in todos) + 1
    todos.append({"id": new_id, "description": description, "status": "pending"})
    save_todos(todos)
    print(f"Added todo {new_id}: {description}")
    display_todos(todos)

def list_todos():
    todos = load_todos()
    display_todos(todos)

def update_todo_status(todo_id, status):
    todos = load_todos()
    found = False
    for todo in todos:
        if todo["id"] == todo_id:
            todo["status"] = status
            found = True
            break
    if found:
        save_todos(todos)
        print(f"Todo {todo_id} marked as {status}.")
        display_todos(todos)
    else:
        print(f"Error: Todo with ID {todo_id} not found.")

def complete_todo(todo_id):
    update_todo_status(todo_id, "completed")

def in_progress_todo(todo_id):
    update_todo_status(todo_id, "in_progress")

def cancel_todo(todo_id):
    update_todo_status(todo_id, "cancelled")