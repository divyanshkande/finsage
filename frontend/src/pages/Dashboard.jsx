import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, Legend, ResponsiveContainer,
  CartesianGrid
} from "recharts";
import { useNavigate } from "react-router-dom";
import useDashboardData from "../hooks/useDashboardData";
import useAuth from "../hooks/useAuth";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#00bcd4", "#ff6b9d", "#c471ed", "#12cad6"];

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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-xl text-gray-700">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <p className="text-xl text-red-600">❌ User not found</p>
          <button 
            onClick={() => navigate("/")}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

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

  // Format currency
  const formatINR = (num) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num || 0);

  // Custom tooltip for bar chart
  const CustomBarTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
          <p className="font-semibold text-gray-800">{payload[0].payload.month}</p>
          <p className="text-blue-600 font-bold">{formatINR(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for pie chart
  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
          <p className="font-semibold text-gray-800">{payload[0].name}</p>
          <p className="text-blue-600 font-bold">{formatINR(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  // Custom label for pie chart
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null; // Hide labels for small slices
    
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 sm:p-6 lg:p-8 space-y-6">

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 sm:p-8 rounded-2xl shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
              {greeting}, {user.fullName || user.email.split("@")[0]} 👋
            </h2>
            <p className="opacity-90 mt-2 text-sm sm:text-base">Here's your financial overview</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-6 py-2.5 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Suggestion */}
      {suggestion && (
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-500 p-5 rounded-xl shadow-md">
          <h3 className="font-bold text-yellow-800 text-lg mb-1">💡 Smart Suggestion</h3>
          <p className="text-gray-700">{suggestion.message}</p>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex flex-wrap gap-3 justify-center sm:justify-end">
        <button 
          onClick={() => navigate("/savings")} 
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
        >
          💰 Savings
        </button>
        <button 
          onClick={() => navigate("/events")} 
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
        >
          📅 Events
        </button>
        <button 
          onClick={() => navigate("/expenses")} 
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
        >
          💳 Expenses
        </button>
      </div>

      {/* Charts Section */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Monthly Expenses Bar Chart */}
        <div className="bg-white p-6 shadow-xl rounded-2xl border border-gray-100">
          <h3 className="text-xl font-bold mb-4 text-gray-800">📅 Monthly Expenses</h3>
          
          {!monthlyData || monthlyData.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p className="text-lg">No monthly data available</p>
                <p className="text-sm mt-2">Add some expenses to see your trends</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={monthlyData} 
                margin={{ top: 10, right: 10, left: 0, bottom: 50 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="month" 
                  angle={-45} 
                  textAnchor="end" 
                  height={80}
                  tick={{ fontSize: 12 }}
                  interval={0}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `₹${value/1000}k`}
                />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar 
                  dataKey="amount" 
                  fill="#3b82f6" 
                  radius={[8, 8, 0, 0]}
                  maxBarSize={60}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Category Breakdown Pie Chart */}
        <div className="bg-white p-6 shadow-xl rounded-2xl border border-gray-100">
          <h3 className="text-xl font-bold mb-4 text-gray-800">📊 Category Breakdown</h3>
          
          {!categoryData || categoryData.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p className="text-lg">No category data available</p>
                <p className="text-sm mt-2">Add expenses to see your spending by category</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={renderCustomLabel}
                  labelLine={false}
                >
                  {categoryData.map((_, i) => (
                    <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value, entry) => (
                    <span className="text-sm">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Expenses Section */}
      <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
        <h3 className="text-xl font-bold mb-5 text-gray-800">🧾 Recent Expenses</h3>

        {recentExpenses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No expenses added yet</p>
            <button
              onClick={() => navigate("/expenses")}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
            >
              Add Your First Expense
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentExpenses.map(exp => (
              <div 
                key={exp.id} 
                className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200 hover:shadow-md transition-all"
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 text-lg">{exp.title}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="inline-block bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-medium mr-2">
                      {exp.category}
                    </span>
                    {new Date(exp.date).toLocaleDateString('en-IN', { 
                      day: 'numeric', 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
                <span className="font-bold text-xl text-red-600 ml-4">
                  {formatINR(exp.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

export default Dashboard;

