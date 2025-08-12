import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
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
  }, []);

  const fetchSummary = async () => {
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
  };

  const fetchMonthlyData = async () => {
    const res = await fetch("http://localhost:8080/api/expenses/summary/monthly", {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include"
    });
    if (res.ok) {
      const data = await res.json();
      const transformed = Object.entries(data).map(([month, value]) => ({
        month,
        value
      }));
      setMonthlyData(transformed);
    }
  };

  const fetchGoals = async () => {
    const res = await fetch("http://localhost:8080/api/savings/goals", {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include"
    });
    if (res.ok) {
      const data = await res.json();
      setGoals(data);
    }
  };

  const fetchTopCategory = async () => {
    const res = await fetch("http://localhost:8080/api/expenses/summary/category", {
      headers: {
        Authorization: `Bearer ${token}`
      },
      credentials: "include"
    });

    if (res.ok) {
      const data = await res.json();
      const entries = Object.entries(data).map(([name, value]) => ({ name, value }));
      const top = entries.reduce((prev, curr) => (curr.value > prev.value ? curr : prev), { name: '', value: 0 });
      setTopCategory(top);
    }
  };

  const updateIncome = async () => {
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
      alert("Income updated successfully");
      fetchSummary();
    } else {
      alert("Failed to update income");
    }
  };

  const addGoal = async () => {
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
    }
  };

  const deleteGoal = async (id) => {
    await fetch(`http://localhost:8080/api/savings/goals/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include"
    });
    fetchGoals();
  };

  if (!summary) return <div className="p-6">Loading...</div>;

  const savingsRate = ((summary.savings / (summary.totalIncome || 1)) * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-gray-100 p-6 space-y-8">

      {/* 🔙 Dashboard Button */}
      <button
        onClick={() => navigate('/dashboard')}
        className="mb-6 text-blue-600 hover:text-blue-800 font-medium"
      >
        ← Back to Dashboard
      </button>

      {/* 💰 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow text-center">
          <p className="text-sm text-gray-500">Income</p>
          <p className="text-2xl font-bold text-green-600">₹{summary.totalIncome}</p>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <p className="text-sm text-gray-500">Expenses</p>
          <p className="text-2xl font-bold text-red-500">₹{summary.totalExpenses}</p>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <p className="text-sm text-gray-500">Savings</p>
          <p className={`text-2xl font-bold ${summary.savings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ₹{summary.savings}
          </p>
          <p className="text-sm text-gray-600 mt-1">💡 You saved {savingsRate}% of your income</p>
        </div>
      </div>

      {/* 📈 Monthly Trend */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-xl font-semibold mb-2">📈 Monthly Expenses Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#00bcd4" name="Expenses" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ✏️ Income Updater */}
      <div className="bg-white p-4 rounded shadow max-w-xl mx-auto space-y-4">
        <h3 className="text-xl font-semibold">✏️ Update Income</h3>
        <input
          type="number"
          value={income}
          onChange={e => setIncome(e.target.value)}
          className="border rounded px-3 py-2 w-full"
        />
        <button
          onClick={updateIncome}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Update Income
        </button>
      </div>

      {/* 🎯 Goals with Progress */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-xl font-semibold mb-4">🎯 Savings Goals</h3>

        <div className="space-y-2 mb-4">
          <input
            type="text"
            placeholder="Goal Name"
            value={newGoal.name}
            onChange={e => setNewGoal({ ...newGoal, name: e.target.value })}
            className="border px-2 py-1 rounded mr-2"
          />
          <input
            type="number"
            placeholder="Target Amount"
            value={newGoal.amount}
            onChange={e => setNewGoal({ ...newGoal, amount: e.target.value })}
            className="border px-2 py-1 rounded mr-2"
          />
          <button
            onClick={addGoal}
            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
          >
            Add Goal
          </button>
        </div>

        {goals.length === 0 && <p className="text-gray-500">No goals yet. Add your first goal!</p>}

        <ul className="space-y-3">
          {goals.map((goal) => {
            const progress = Math.min(100, Math.round((summary.savings / goal.amount) * 100));
            return (
              <li key={goal.id} className="bg-gray-100 p-3 rounded">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{goal.name}</p>
                    <p className="text-sm text-gray-600">Target: ₹{goal.amount}</p>
                    <p className="text-sm text-blue-600">Progress: {progress}%</p>
                  </div>
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </div>
                <div className="w-full bg-gray-300 h-2 mt-2 rounded">
                  <div
                    className="h-2 bg-green-500 rounded"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* 💡 Insights */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-xl font-semibold mb-2">💡 Recommendations</h3>
        {summary.savings < 0 ? (
          <p className="text-red-600">⚠️ You are overspending. Reduce your monthly expenses.</p>
        ) : savingsRate >= 30 ? (
          <p className="text-green-600">✅ Great job! You're saving more than 30% of your income.</p>
        ) : (
          <p className="text-yellow-600">⏳ You're saving moderately. Aim to save at least 30%.</p>
        )}

        {topCategory && (
          <p className="mt-2 text-blue-700">
            📌 Highest Spending Category: <strong>{topCategory.name}</strong> (₹{topCategory.value})
          </p>
        )}
      </div>
    </div>
  );
}

export default Savings;
