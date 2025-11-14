import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";

function Savings() {
  const [income, setIncome] = useState('');
  const [summary, setSummary] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState({ name: '', amount: '' });
  const [topCategory, setTopCategory] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchSummary();
    fetchMonthlyData();
    fetchGoals();
    fetchTopCategory();
    // eslint-disable-next-line
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/expenses/summary", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
        setIncome(data.totalIncome || '');
      }
    } catch (err) {
      console.error("fetchSummary error", err);
    }
  };

  const fetchMonthlyData = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/expenses/summary/monthly", {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        // transform into sorted array by month key for predictable order
        const transformed = Object.entries(data).map(([month, value]) => ({ month, value }));
        // optional: sort by month string if needed (assumes YYYY-MM or similar)
        transformed.sort((a, b) => a.month.localeCompare(b.month));
        setMonthlyData(transformed);
      }
    } catch (err) {
      console.error("fetchMonthlyData error", err);
    }
  };

  const fetchGoals = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/savings/goals", {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        setGoals(data);
      }
    } catch (err) {
      console.error("fetchGoals error", err);
    }
  };

  const fetchTopCategory = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/expenses/summary/category", {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        const entries = Object.entries(data).map(([name, value]) => ({ name, value }));
        if (entries.length > 0) {
          const top = entries.reduce((prev, curr) => (curr.value > prev.value ? curr : prev), entries[0]);
          setTopCategory(top);
        } else {
          setTopCategory(null);
        }
      }
    } catch (err) {
      console.error("fetchTopCategory error", err);
    }
  };

  const updateIncome = async () => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/expenses/update-income?income=${income}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          credentials: "include"
        }
      );

      if (res.ok) {
        // friendly UX: re-fetch and show small toast (alert for now)
        await fetchSummary();
        alert("Income updated successfully");
      } else {
        alert("Failed to update income");
      }
    } catch (err) {
      console.error("updateIncome error", err);
      alert("Failed to update income");
    }
  };

  const addGoal = async () => {
    if (!newGoal.name || !newGoal.amount) {
      alert("Please enter both name and amount");
      return;
    }

    try {
      const res = await fetch("http://localhost:8080/api/savings/goals", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(newGoal)
      });

      if (res.ok) {
        setNewGoal({ name: '', amount: '' });
        fetchGoals();
      } else {
        alert("Failed to add goal");
      }
    } catch (err) {
      console.error("addGoal error", err);
      alert("Failed to add goal");
    }
  };

  const deleteGoal = async (id) => {
    try {
      await fetch(`http://localhost:8080/api/savings/goals/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include"
      });
      fetchGoals();
    } catch (err) {
      console.error("deleteGoal error", err);
    }
  };

  if (!summary) return <div className="p-6">Loading...</div>;

  const savingsRate = ((summary.savings / (summary.totalIncome || 1)) * 100).toFixed(1);
  const incomeText = summary.totalIncome ?? 0;
  const expensesText = summary.totalExpenses ?? 0;
  const savingsText = summary.savings ?? 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <button
        onClick={() => navigate('/dashboard')}
        className="mb-6 text-blue-600 hover:text-blue-800 font-medium"
      >
        ← Back to Dashboard
      </button>

      {/* Summary and right column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: big summary (spans two cols on large screens) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary cards row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-start gap-2 border">
              <div className="text-sm text-gray-500">Income</div>
              <div className="text-2xl font-bold text-green-600">₹{incomeText}</div>
              <div className="text-xs text-gray-400">Monthly salary / total income</div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-start gap-2 border">
              <div className="text-sm text-gray-500">Expenses</div>
              <div className="text-2xl font-bold text-red-500">₹{expensesText}</div>
              <div className="text-xs text-gray-400">Total expenses (period)</div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-start gap-2 border">
              <div className="text-sm text-gray-500">Savings</div>
              <div className={`text-2xl font-bold ${savingsText >= 0 ? 'text-green-600' : 'text-red-600'}`}>₹{savingsText}</div>
              <div className="text-xs text-gray-400">💡 You saved {savingsRate}% of your income</div>
            </div>
          </div>

          {/* Area Chart card */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">📈 Monthly Expenses Trend</h3>
              <div className="text-sm text-gray-500">Last 6 months</div>
            </div>

            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#06b6d4" fill="url(#colorExp)" name="Expenses" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Goals section (grid of cards) */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">🎯 Savings Goals</h3>
            </div>

            {/* Add new goal inline */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4 items-start">
              <input
                type="text"
                placeholder="Goal name (e.g., Laptop)"
                value={newGoal.name}
                onChange={e => setNewGoal({ ...newGoal, name: e.target.value })}
                className="border px-3 py-2 rounded w-full sm:w-1/2"
              />
              <input
                type="number"
                placeholder="Target amount"
                value={newGoal.amount}
                onChange={e => setNewGoal({ ...newGoal, amount: e.target.value })}
                className="border px-3 py-2 rounded w-full sm:w-1/3"
              />
              <button
                onClick={addGoal}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Add Goal
              </button>
            </div>

            {goals.length === 0 ? (
              <p className="text-gray-500">No goals yet. Add your first goal!</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {goals.map(goal => {
                  // progress relative to saved amount (if saved is logic: use summary.savings)
                  const savedAmount = Math.max(0, summary.savings || 0);
                  const progress = Math.min(100, Math.round((savedAmount / (goal.amount || 1)) * 100));
                  return (
                    <div key={goal.id} className="bg-gray-50 p-3 rounded-lg border">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-sm text-gray-600">{goal.name}</div>
                          <div className="text-lg font-semibold">₹{goal.amount}</div>
                        </div>
                        <div className="text-sm text-gray-500">Progress: {progress}%</div>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-3 mt-3 overflow-hidden">
                        <div
                          className="h-3 bg-gradient-to-r from-green-400 to-green-600"
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      <div className="flex justify-between items-center mt-3">
                        <div className="text-xs text-gray-500">
                          {progress >= 100 ? "✅ Goal reached" : "Keep saving"}
                        </div>
                        <button
                          onClick={() => deleteGoal(goal.id)}
                          className="text-red-500 text-sm hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right column: income updater + insights */}
        <div className="space-y-6">
          {/* Income updater card */}
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <h4 className="text-lg font-semibold mb-2">✏️ Update Income</h4>
            <input
              type="number"
              value={income}
              onChange={e => setIncome(e.target.value)}
              className="border px-3 py-2 rounded w-full mb-3"
            />
            <button
              onClick={updateIncome}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Update Income
            </button>
            <div className="text-xs text-gray-400 mt-3">Your income is used to calculate savings rate & recommendations</div>
          </div>

          {/* Recommendations / AI insights */}
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <h4 className="text-lg font-semibold mb-2">💡 Recommendations</h4>

            {summary.savings < 0 ? (
              <p className="text-red-600">⚠️ You are overspending. Reduce your monthly expenses and prioritize essential payments.</p>
            ) : Number(savingsRate) >= 30 ? (
              <p className="text-green-600">✅ Great job! You're saving {savingsRate}% of your income — excellent discipline.</p>
            ) : (
              <p className="text-yellow-600">⏳ You're saving {savingsRate}%. Aim to save at least 30% — try automating a fixed SIP every month.</p>
            )}

            {topCategory && (
              <div className="mt-3 text-sm text-gray-700">
                <div className="font-medium">📌 Highest Spending Category</div>
                <div className="mt-1 text-blue-700">
                  <strong>{topCategory.name}</strong> — ₹{topCategory.value}
                </div>
                <div className="text-xs text-gray-400 mt-2">Tip: Review this category and look for 10–20% reductions.</div>
              </div>
            )}

            {/* Quick actions */}
            <div className="mt-4 space-y-2">
              <button
                onClick={() => alert("Feature: Auto-SIP setup coming soon")}
                className="w-full border px-3 py-2 rounded hover:bg-gray-50"
              >
                ➕ Setup Auto SIP (recommended)
              </button>
              <button
                onClick={() => alert("Feature: AI insights coming soon")}
                className="w-full border px-3 py-2 rounded hover:bg-gray-50"
              >
                🔍 Get AI Insights (soon)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Savings;
