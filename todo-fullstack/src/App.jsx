import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Pomodoro from "./pages/Pomodoro";

function App() {
  return (
    <>
      <nav className="bg-white shadow-sm px-6 py-3 flex justify-between">
        <Link to="/" className="font-semibold text-gray-800">
          Task Manager
        </Link>

        <div className="flex gap-4 text-sm">
          <Link to="/" className="text-gray-600 hover:text-indigo-600">
            Tasks
          </Link>
          <Link to="/pomodoro" className="text-gray-600 hover:text-indigo-600">
            Pomodoro
          </Link>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pomodoro" element={<Pomodoro />} />
      </Routes>
    </>
  );
}

export default App;
