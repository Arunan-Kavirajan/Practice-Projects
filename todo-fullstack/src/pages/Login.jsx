import {
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "../firebase/config";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1220] flex items-center justify-center text-slate-100">
      <div className="bg-[#111a2e] p-10 rounded-xl border border-indigo-500/10 text-center space-y-6">
        <h1 className="text-2xl font-bold">
          Login to Your Account
        </h1>

        <button
          onClick={handleLogin}
          className="bg-indigo-600 px-6 py-3 rounded-lg hover:opacity-90 transition"
        >
          Login with Google
        </button>
      </div>
    </div>
  );
}

export default Login;
