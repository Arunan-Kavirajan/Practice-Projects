import { useState, useMemo } from "react";
import TodoItem from "./TodoItem";
import { motion, AnimatePresence } from "framer-motion";

function TodoList({ todos = [] }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  /* ================= PROCESS TODOS ================= */

  const processedTodos = useMemo(() => {
    let result = [...todos];

    // Search
    if (search.trim()) {
      result = result.filter((todo) =>
        todo.text?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filter
    if (filter === "active") {
      result = result.filter((t) => !t.completed);
    }

    if (filter === "completed") {
      result = result.filter((t) => t.completed);
    }

    if (filter === "overdue") {
      result = result.filter(
        (t) =>
          t.dueDate &&
          !t.completed &&
          new Date(t.dueDate) < new Date()
      );
    }

    // Sorting
    if (sortBy === "priority") {
      const order = { high: 3, medium: 2, low: 1 };
      result.sort((a, b) => order[b.priority] - order[a.priority]);
    }

    if (sortBy === "due") {
      result.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      });
    }

    if (sortBy === "newest") {
      result.sort(
        (a, b) =>
          (b.createdAt?.seconds || 0) -
          (a.createdAt?.seconds || 0)
      );
    }

    return result;
  }, [todos, filter, search, sortBy]);

  /* ================= RENDER ================= */

  return (
    <div className="space-y-8">

      {/* Search + Sort */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 rounded-md border border-indigo-500/10 bg-white/5 backdrop-blur focus:ring-2 focus:ring-indigo-500 outline-none"
        />

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 rounded-md border border-indigo-500/10 bg-white/5 backdrop-blur"
        >
          <option value="newest">Newest</option>
          <option value="priority">Priority</option>
          <option value="due">Due Date</option>
        </select>
      </div>

      {/* Filters */}
      <div className="flex gap-3 text-sm">
        {["all", "active", "completed", "overdue"].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-1 rounded-md transition ${
              filter === type
                ? "bg-gradient-to-r from-indigo-600 to-cyan-500 text-white"
                : "bg-white/10 hover:bg-white/20"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-3">
        <AnimatePresence>
          {processedTodos.map((todo) => (
            <TodoItem key={todo.id} todo={todo} />
          ))}
        </AnimatePresence>

        {processedTodos.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-10 text-slate-400"
          >
            No tasks match your filters.
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default TodoList;
