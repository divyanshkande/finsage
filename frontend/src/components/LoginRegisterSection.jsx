import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginRegisterSection() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    const url = isLogin
      ? "http://localhost:8080/api/auth/login"
      : "http://localhost:8080/api/auth/register";

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include"
    });

    const data = await res.json();

    if (res.ok) {
      if (isLogin) {
        localStorage.setItem("token", data.token);
        navigate("/dashboard");
      } else {
        alert("Registered successfully! Please login.");
        setIsLogin(true);
      }
    } else {
      alert(data.message || `${isLogin ? "Login" : "Registration"} failed`);
    }
  };

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center flex items-center justify-center px-4 relative"
      style={{
        backgroundImage: `url('/login-bg.jpg')`,
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50 z-0" />

      {/* Glassmorphism Box */}
      <div className="relative z-10 bg-white bg-opacity-20 backdrop-blur-md rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-md">
        <h3 className="text-3xl font-semibold text-center text-white mb-6">
          {isLogin ? "Login to Finsage" : "Create Your Account"}
        </h3>

        <form onSubmit={handleAuth} className="space-y-4">
  <input
    type="email"
    placeholder="Email"
    className="w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white bg-opacity-70"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    required
  />
  <input
    type="password"
    placeholder="Password"
    className="w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white bg-opacity-70"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
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
    className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition"
  >
    {isLogin ? "Login" : "Register"}
  </button>
</form>

        <div className="text-center text-sm text-white mt-4">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
        </div>

        <button
          onClick={() => setIsLogin(!isLogin)}
          className="w-full text-blue-200 hover:underline text-sm mt-2"
        >
          {isLogin ? "Register Here" : "Login Here"}
        </button>
      </div>
    </div>
  );
}
