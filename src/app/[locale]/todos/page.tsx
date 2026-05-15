"use client";

import { useState, useEffect } from "react";
import { Check, Plus, Trash2, RotateCcw } from "lucide-react";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("todos");
        return stored ? JSON.parse(stored) : [];
      } catch {}
    }
    return [];
  });
  const [input, setInput] = useState("");

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  function addTodo() {
    const text = input.trim();
    if (!text) return;
    setTodos([
      { id: crypto.randomUUID(), text, completed: false, createdAt: Date.now() },
      ...todos,
    ]);
    setInput("");
  }

  function toggleTodo(id: string) {
    setTodos(todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  }

  function deleteTodo(id: string) {
    setTodos(todos.filter((t) => t.id !== id));
  }

  const activeTodos = todos.filter((t) => !t.completed);
  const completedTodos = todos.filter((t) => t.completed);

  return (
    <div className="min-h-screen bg-[#F0F9FF] py-16">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-3xl font-bold text-[#0C4A6E] mb-2">Todo List</h1>
        <p className="text-gray-700 mb-8">
          {activeTodos.length} task{activeTodos.length !== 1 ? "s" : ""} remaining
        </p>

        <div className="flex gap-2 mb-8">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
            placeholder="Add a new task..."
            className="flex-1 px-4 py-3 rounded-lg border border-[#EAEEF3] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] bg-white text-[#0C4A6E] placeholder:text-gray-700/50"
          />
          <button
            onClick={addTodo}
            className="px-5 py-3 bg-[#0EA5E9] text-white rounded-lg hover:bg-[#0EA5E9]/90 transition-colors flex items-center gap-2 font-medium"
          >
            <Plus size={18} /> Add
          </button>
        </div>

        {todos.length === 0 && (
          <div className="text-center py-16 text-gray-700">
            <p className="text-lg">No tasks yet. Add one above!</p>
          </div>
        )}

        {activeTodos.length > 0 && (
          <div className="space-y-2 mb-8">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
              Active
            </h2>
            {activeTodos.map((todo) => (
              <TodoItem key={todo.id} todo={todo} onToggle={toggleTodo} onDelete={deleteTodo} />
            ))}
          </div>
        )}

        {completedTodos.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <RotateCcw size={14} /> Completed ({completedTodos.length})
            </h2>
            {completedTodos.map((todo) => (
              <TodoItem key={todo.id} todo={todo} onToggle={toggleTodo} onDelete={deleteTodo} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TodoItem({
  todo,
  onToggle,
  onDelete,
}: {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg bg-white border border-[#EAEEF3] transition-all ${
        todo.completed ? "opacity-60" : ""
      }`}
    >
      <button
        onClick={() => onToggle(todo.id)}
        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
          todo.completed
            ? "bg-green-500 border-green-500 text-white"
            : "border-[#5E6D77] hover:border-[#0EA5E9]"
        }`}
      >
        {todo.completed && <Check size={12} strokeWidth={3} />}
      </button>
      <span
        className={`flex-1 text-[#0C4A6E] ${todo.completed ? "line-through text-gray-700" : ""}`}
      >
        {todo.text}
      </span>
      <button
        onClick={() => onDelete(todo.id)}
        className="text-gray-700 hover:text-red-500 transition-colors p-1"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
