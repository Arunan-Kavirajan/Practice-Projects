import {
  signInWithRedirect,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import { auth } from "../firebase/config";

function Auth({ user }) {
  const provider = new GoogleAuthProvider();

  const handleLogin = async () => {
    try {
      await signInWithRedirect(auth, provider);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      {user ? (
        <>
          <span>Welcome, {user.displayName}</span>
          <button onClick={handleLogout} style={{ marginLeft: "10px" }}>
            Logout
          </button>
        </>
      ) : (
        <button onClick={handleLogin}>
          Login with Google
        </button>
      )}
    </div>
  );
}

export default Auth;
