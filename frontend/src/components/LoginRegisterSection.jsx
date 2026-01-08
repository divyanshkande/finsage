import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";

export default function LoginRegisterSection() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
  e.preventDefault();
  setLoading(true);

  const url = isLogin
    ? "http://localhost:8080/api/auth/login"
    : "http://localhost:8080/api/auth/register";

  const payload = isLogin 
    ? { email, password }
    : { email, password, fullName };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include"
    });

    const data = await res.json();

    if (res.ok) {
      if (isLogin) {
        // Verify authentication before redirecting
        const verifyRes = await fetch("http://localhost:8080/api/auth/me", {
          credentials: "include"
        });
        
        if (verifyRes.ok) {
          console.log("✅ Login successful, redirecting to dashboard");
          navigate("/dashboard");
        } else {
          alert("Login verification failed. Please try again.");
        }
      } else {
        // Registration success
        alert("Registered successfully! Please login.");
        setIsLogin(true);
        setPassword('');
        setFullName('');
      }
    } else {
      // Show error from backend
     alert(data.message || data.error || "Operation failed. Please try again.");

    }
  } catch (err) {
    console.error("Auth error:", err);
    alert("Network error. Please check your connection and try again.");
  } finally {
    setLoading(false);
  }
};

  const handleGoogleLogin = async () => {
  setLoading(true);
  try {
    
    await auth.signOut().catch(() => {});
    
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();

    console.log("🔑 Got Firebase token, sending to backend...");

    const res = await fetch("http://localhost:8080/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
      credentials: "include"
    });

    const data = await res.json();

    if (res.ok && data.token) {
      console.log("✅ Backend authentication successful");
      
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const verifyRes = await fetch("http://localhost:8080/api/auth/me", {
        credentials: "include"
      });
      
      if (verifyRes.ok) {
        console.log("✅ Verification successful, redirecting to dashboard");
        navigate("/dashboard");
      } else {
        console.error("❌ Verification failed");
        alert("Authentication verification failed. Please try again.");
      }
    } else {
      alert(data.message || data.error || "Google login failed. Please try again.");

    }
  } catch (err) {
  console.error("Google login error:", err);

  if (err.code === "auth/popup-closed-by-user") {
    alert("Login cancelled by user.");
  } else if (err.response?.data?.message) {
    alert(err.response.data.message);
  } else {
    alert("Google authentication failed. Please try again.");
  }
}
 finally {
    setLoading(false);
  }
};
  return (
    <div
      className="min-h-screen w-full bg-cover bg-center flex items-center justify-center px-4 relative"
      style={{ backgroundImage: `url('/login-bg.jpg')` }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50 z-0" />

      <div className="relative z-10 bg-white bg-opacity-20 backdrop-blur-md rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-md">
        <h3 className="text-3xl font-semibold text-center text-white mb-6">
          {isLogin ? "Login to Finsage" : "Create Your Account"}
        </h3>

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              className="w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white bg-opacity-70"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              disabled={loading}
            />
          )}
          
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white bg-opacity-70"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white bg-opacity-70"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            minLength={6}
          />

          {isLogin && (
            <div className="text-right text-sm">
              <span
                className="text-blue-200 hover:underline cursor-pointer"
                onClick={() => navigate("/forgot-password")}
              >
                Forgot Password?
              </span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-md font-semibold transition ${
              loading
                ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {loading ? "Processing..." : (isLogin ? "Login" : "Register")}
          </button>
        </form>

        <div className="text-center text-sm text-white mt-4">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
        </div>

        <button
          onClick={() => {
            setIsLogin(!isLogin);
            setPassword('');
            setFullName('');
          }}
          className="w-full text-blue-200 hover:underline text-sm mt-2"
          disabled={loading}
        >
          {isLogin ? "Register Here" : "Login Here"}
        </button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white bg-opacity-20 text-white">OR</span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className={`w-full py-2 rounded-md font-semibold transition flex items-center justify-center gap-2 ${
            loading
              ? "bg-gray-500 text-gray-300 cursor-not-allowed"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          {loading ? (
            "Processing..."
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </>
          )}
        </button>
      </div>
    </div>
  );
}