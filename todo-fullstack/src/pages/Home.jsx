import { useEffect, useState, useMemo } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase/config";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import Auth from "../components/Auth";
import TodoForm from "../components/TodoForm";
import TodoList from "../components/TodoList";
import { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

function Home() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [todos, setTodos] = useState([]);

  /* ================= AUTH ================= */

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  /* ================= REAL FIRESTORE LISTENER ================= */

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "todos"),
      where("uid", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTodos(data);
    });

    return () => unsubscribe();
  }, [user]);

  /* ================= BASIC STATS ================= */

  const total = todos.length;
  const completed = todos.filter((t) => t.completed).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  /* ================= DAILY COMPLETION TREND ================= */

  const dailyTrend = useMemo(() => {
    const days = Array.from({ length: 7 }).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const label = date.toLocaleDateString(undefined, { weekday: "short" });

      const count = todos.filter((t) => {
        if (!t.completed || !t.createdAt) return false;
        const d = new Date(t.createdAt.seconds * 1000);
        return d.toDateString() === date.toDateString();
      }).length;

      return { day: label, completed: count };
    });

    return days;
  }, [todos]);

  /* ================= PRIORITY DISTRIBUTION ================= */

  const priorityData = useMemo(() => {
    const counts = { high: 0, medium: 0, low: 0 };

    todos.forEach((t) => {
      if (counts[t.priority] !== undefined) {
        counts[t.priority]++;
      }
    });

    return [
      { name: "High", value: counts.high },
      { name: "Medium", value: counts.medium },
      { name: "Low", value: counts.low },
    ];
  }, [todos]);

  /* ================= OVERDUE VS ACTIVE ================= */

  const overdueData = useMemo(() => {
    const today = new Date();
    let overdue = 0;
    let active = 0;

    todos.forEach((t) => {
      if (!t.completed && t.dueDate) {
        const due = new Date(t.dueDate);
        if (due < today) overdue++;
        else active++;
      }
    });

    return [
      { name: "Overdue", value: overdue },
      { name: "Active", value: active },
    ];
  }, [todos]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b1220] text-slate-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1220] text-slate-100 px-10 py-14">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-slate-400 text-sm">
            Real productivity insights
          </p>
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <img
              src={user.photoURL || "https://i.pravatar.cc/100"}
              className="w-10 h-10 rounded-full"
              alt="profile"
            />
          )}
          <Auth user={user} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-8 mb-12">
        <StatCard label="Total Tasks" value={total} />
        <StatCard label="Completed" value={completed} />
        <StatCard label="Completion Rate" value={`${percent}%`} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-10 mb-16">

        <ChartCard title="Daily Completion Trend">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dailyTrend}>
              <CartesianGrid stroke="#1e293b" />
              <XAxis dataKey="day" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="completed"
                stroke="#6366f1"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Priority Distribution">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={priorityData} dataKey="value" outerRadius={90}>
                <Cell fill="#ef4444" />
                <Cell fill="#facc15" />
                <Cell fill="#22c55e" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Overdue vs Active">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={overdueData}>
              <CartesianGrid stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Bar dataKey="value" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

      </div>

      {/* Task Section */}
      <div className="space-y-10">
        <div className="bg-[#111a2e] p-6 rounded-xl">
          {user && <TodoForm user={user} />}
        </div>

        <div className="bg-[#111a2e] p-6 rounded-xl">
          {user && <TodoList todos={todos} />}
        </div>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function StatCard({ label, value }) {
  return (
    <div className="bg-[#111a2e] p-6 rounded-xl border border-indigo-500/10">
      <div className="text-sm text-slate-400">{label}</div>
      <div className="text-2xl font-bold mt-2">{value}</div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-[#111a2e] p-6 rounded-xl border border-indigo-500/10"
    >
      <div className="mb-4 font-semibold">{title}</div>
      {children}
    </motion.div>
  );
}

export default Home;
