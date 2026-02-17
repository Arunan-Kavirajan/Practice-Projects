import { doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { motion } from "framer-motion";
import { useState } from "react";

/**
 * Highly polished task item
 * Interactive, animated, psychologically engaging
 */

function TodoItem({ todo }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggle = async () => {
    await updateDoc(doc(db, "todos", todo.id), {
      completed: !todo.completed,
    });
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setTimeout(async () => {
      await deleteDoc(doc(db, "todos", todo.id));
    }, 250);
  };

  const isOverdue =
    todo.dueDate &&
    !todo.completed &&
    new Date(todo.dueDate) < new Date();

  const priorityStyles = {
    low: "bg-emerald-500/15 text-emerald-400",
    medium: "bg-yellow-500/15 text-yellow-400",
    high: "bg-red-500/15 text-red-400",
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{
        opacity: isDeleting ? 0 : 1,
        scale: isDeleting ? 0.95 : 1,
      }}
      transition={{ duration: 0.25 }}
      whileHover={{ y: -3 }}
      className={`group relative p-4 rounded-xl border transition-all duration-300 backdrop-blur-md ${
        isOverdue
          ? "border-red-500/40 bg-red-500/5"
          : "border-white/10 bg-white/5"
      }`}
    >
      {/* Glow border effect */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none bg-gradient-to-r from-indigo-500/10 to-cyan-400/10" />

      <div className="flex justify-between items-center relative z-10">

        {/* Left Section */}
        <div className="flex items-center gap-4">

          {/* Animated Checkbox */}
          <motion.input
            type="checkbox"
            checked={todo.completed}
            onChange={handleToggle}
            whileTap={{ scale: 0.9 }}
            className="w-5 h-5 accent-indigo-500 cursor-pointer"
          />

          <motion.span
            animate={{
              opacity: todo.completed ? 0.5 : 1,
            }}
            className={`text-sm transition-all ${
              todo.completed
                ? "line-through text-slate-400"
                : "text-slate-200"
            }`}
          >
            {todo.text}
          </motion.span>
        </div>

        {/* Delete Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleDelete}
          className="text-xs text-red-400 hover:text-red-500 transition"
        >
          Delete
        </motion.button>
      </div>

      {/* Meta Row */}
      <div className="flex gap-3 mt-3 text-xs relative z-10">

        {/* Priority Badge */}
        <div
          className={`px-2 py-1 rounded-full ${
            priorityStyles[todo.priority] || "bg-slate-600/20 text-slate-300"
          }`}
        >
          {todo.priority || "medium"}
        </div>

        {/* Due Date */}
        {todo.dueDate && (
          <div
            className={`px-2 py-1 rounded-full ${
              isOverdue
                ? "bg-red-500/20 text-red-400"
                : "bg-slate-600/20 text-slate-300"
            }`}
          >
            Due: {todo.dueDate}
          </div>
        )}

        {/* Overdue Label */}
        {isOverdue && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-2 py-1 rounded-full bg-red-600/20 text-red-500"
          >
            Overdue
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default TodoItem;
