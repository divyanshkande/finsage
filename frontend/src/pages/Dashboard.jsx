import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, Legend, ResponsiveContainer
} from "recharts";
import { useNavigate } from "react-router-dom";
import useDashboardData from "../hooks/useDashboardData";
import useAuth from "../hooks/useAuth";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#00bcd4"];

function Dashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const {
    expenses,
    monthlyData,
    categoryData,
    loading
  } = useDashboardData(navigate);

  const [greeting, setGreeting] = useState("");
  const [suggestion, setSuggestion] = useState(null);

  // ✅ Improved greeting logic
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting("Good Morning 🌅");
    else if (hour >= 12 && hour < 16) setGreeting("Good Afternoon ☀️");
    else if (hour >= 16 && hour < 21) setGreeting("Good Evening 🌇");
    else setGreeting("Good Night 🌙");
  }, []);

  useEffect(() => {
    if (!user) return;

    fetch("http://localhost:8080/api/suggestions/today", {
      credentials: "include"
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => data?.message && setSuggestion(data))
      .catch(() => {});
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        🔄 Loading your dashboard...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        ❌ User not found
      </div>
    );
  }

  // ✅ last 5 recent expenses
  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const handleLogout = async () => {
    await fetch("http://localhost:8080/api/auth/logout", {
      method: "POST",
      credentials: "include"
    });
    localStorage.clear();
    setSuggestion(null);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 space-y-6">

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-lg shadow flex justify-between items-center">
        <div>
          <h2 className="text-2xl sm:text-3xl font-semibold">
            {greeting}, {user.fullName || user.email.split("@")[0]} 👋
          </h2>
          <p className="opacity-90 mt-1">Here's your financial overview</p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {/* Suggestion */}
      {suggestion && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded shadow flex justify-between">
          <div>
            <h3 className="font-semibold text-yellow-800">💡 Smart Suggestion</h3>
            <p>{suggestion.message}</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex flex-wrap gap-2 justify-end">
        <button onClick={() => navigate("/savings")} className="btn bg-blue-500">💰 Savings</button>
        <button onClick={() => navigate("/events")} className="btn bg-green-500">📅 Events</button>
        <button onClick={() => navigate("/expenses")} className="btn bg-purple-500">💳 Expenses</button>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <ChartCard title="📅 Monthly Expenses">
          <ResponsiveContainer width="100%" height={300}>
  <BarChart data={monthlyData} margin={{ top: 10, right: 20, left: 10, bottom: 40 }}>
    <XAxis dataKey="month" angle={-15} textAnchor="end" height={60} />
    <YAxis />
    <Tooltip />
    <Bar dataKey="amount" fill="#8884d8" />
  </BarChart>
</ResponsiveContainer>

        </ChartCard>

        <ChartCard title="📊 Category Breakdown">
          <ResponsiveContainer width="100%" height={300}>
  <PieChart>
    <Pie
      data={categoryData}
      dataKey="value"
      nameKey="name"
      labelLine={false}
      label={({ name }) => name}
    >
      {categoryData.map((_, i) => (
        <Cell key={i} fill={COLORS[i % COLORS.length]} />
      ))}
    </Pie>
    <Tooltip />
    <Legend />
  </PieChart>
</ResponsiveContainer>

        </ChartCard>
      </div>

      {/* ✅ Recent Expenses */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-xl font-semibold mb-4">🧾 Recent Expenses</h3>

        {recentExpenses.length === 0 ? (
          <p className="text-gray-500">No expenses added yet</p>
        ) : (
          <ul className="divide-y">
            {recentExpenses.map(exp => (
              <li key={exp.id} className="py-2 flex justify-between">
                <div>
                  <p className="font-medium">{exp.title}</p>
                  <p className="text-sm text-gray-500">
                    {exp.category} • {new Date(exp.date).toLocaleDateString()}
                  </p>
                </div>
                <span className="font-semibold text-red-500">₹{exp.amount}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white p-4 shadow rounded h-[380px] sm:h-[430px]">
      <h3 className="text-lg sm:text-xl font-semibold mb-3">{title}</h3>
      {children}
    </div>
  );
}


export default Dashboard;

