import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import toast from "react-hot-toast";

function TodoForm({ user }) {
  const [text, setText] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!text.trim()) {
      toast.error("Task cannot be empty");
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, "todos"), {
        text: text.trim(),
        completed: false,
        priority,
        dueDate: dueDate || null,
        createdAt: serverTimestamp(),
        uid: user.uid,
      });

      setText("");
      setDueDate("");
      setPriority("medium");

      toast.success("Task added");
    } catch (error) {
      toast.error("Failed to add task");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      {/* Task Input */}
      <input
        type="text"
        placeholder="Enter task..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="
          w-full
          bg-[#111a2e]
          text-slate-100
          border border-indigo-500/20
          rounded-lg
          px-4 py-3
          focus:outline-none
          focus:ring-2
          focus:ring-indigo-500
          transition
        "
      />

      {/* Controls Row */}
      <div className="flex gap-4 flex-wrap">

        {/* Priority */}
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="
            bg-[#111a2e]
            text-slate-200
            border border-indigo-500/20
            rounded-lg
            px-4 py-3
            focus:outline-none
            focus:ring-2
            focus:ring-indigo-500
            transition
          "
        >
          <option value="high">High Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="low">Low Priority</option>
        </select>

        {/* Due Date */}
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="
            bg-[#111a2e]
            text-slate-200
            border border-indigo-500/20
            rounded-lg
            px-4 py-3
            focus:outline-none
            focus:ring-2
            focus:ring-indigo-500
            transition
          "
        />

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="
            bg-gradient-to-r
            from-indigo-600
            to-cyan-500
            hover:opacity-90
            transition
            text-white
            font-medium
            rounded-lg
            px-6 py-3
            disabled:opacity-50
          "
        >
          {loading ? "Adding..." : "Add Task"}
        </button>

      </div>
    </form>
  );
}

export default TodoForm;
