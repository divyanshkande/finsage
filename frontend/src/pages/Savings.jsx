import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

function Savings() {
  const [income, setIncome] = useState("");
  const [summary, setSummary] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState({ name: "", amount: "" });
  const [topCategory, setTopCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAI, setShowAI] = useState(false);

  // AI Advisor states
  const [advisorInput, setAdvisorInput] = useState({
    salary: "",
    expenses: "",
    goals: [],
  });
  const [aiNewGoal, setAiNewGoal] = useState({ name: "", amount: "" });
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiError, setAiError] = useState(null);

  const navigate = useNavigate();

  // Fetch all data on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchSummary(),
        fetchMonthlyData(),
        fetchGoals(),
        fetchTopCategory(),
      ]);
      setLoading(false);
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/expenses/summary", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
        setIncome(data.totalIncome?.toString() || "");
      }
    } catch (err) {
      console.error("fetchSummary error", err);
    }
  };

  const fetchMonthlyData = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/expenses/summary/monthly", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        const transformed = Object.entries(data)
          .map(([month, value]) => ({ month, value }))
          .sort((a, b) => a.month.localeCompare(b.month));
        setMonthlyData(transformed);
      }
    } catch (err) {
      console.error("fetchMonthlyData error", err);
    }
  };

  const fetchGoals = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/savings/goals", {
        credentials: "include",
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
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        const entries = Object.entries(data).map(([name, value]) => ({
          name,
          value,
        }));
        if (entries.length > 0) {
          const top = entries.reduce((prev, curr) =>
            curr.value > prev.value ? curr : prev
          );
          setTopCategory(top);
        }
      }
    } catch (err) {
      console.error("fetchTopCategory error", err);
    }
  };

  const updateIncome = async () => {
    const incomeNum = parseFloat(income);
    if (isNaN(incomeNum) || incomeNum <= 0) {
      alert("Please enter a valid income amount.");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:8080/api/expenses/update-income?income=${incomeNum}`,
        {
          method: "PUT",
          credentials: "include",
        }
      );

      if (res.ok) {
        await fetchSummary();
        alert("Income updated successfully!");
      } else {
        alert("Failed to update income.");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating income.");
    }
  };

  const addGoal = async () => {
    const amount = parseFloat(newGoal.amount);
    if (!newGoal.name.trim() || isNaN(amount) || amount <= 0) {
      alert("Please enter a valid goal name and positive amount.");
      return;
    }

    try {
      const res = await fetch("http://localhost:8080/api/savings/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: newGoal.name.trim(), amount }),
      });

      if (res.ok) {
        setNewGoal({ name: "", amount: "" });
        fetchGoals();
      } else {
        alert("Failed to add goal.");
      }
    } catch (err) {
      console.error(err);
      alert("Error adding goal.");
    }
  };

  const deleteGoal = async (id) => {
    if (!window.confirm("Delete this goal?")) return;

    try {
      const res = await fetch(`http://localhost:8080/api/savings/goals/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) fetchGoals();
    } catch (err) {
      console.error(err);
    }
  };

  const addAiGoal = () => {
    const amount = parseFloat(aiNewGoal.amount);
    if (!aiNewGoal.name.trim() || isNaN(amount) || amount <= 0) {
      alert("Enter valid goal name and amount.");
      return;
    }
    setAdvisorInput({
      ...advisorInput,
      goals: [...advisorInput.goals, { name: aiNewGoal.name.trim(), amount }],
    });
    setAiNewGoal({ name: "", amount: "" });
  };

  const removeAiGoal = (idx) => {
    setAdvisorInput({
      ...advisorInput,
      goals: advisorInput.goals.filter((_, i) => i !== idx),
    });
  };

  const generateAdvice = async () => {
    setAiError(null);
    setAiResult(null);

    const salary = parseFloat(advisorInput.salary);
    const expenses = parseFloat(advisorInput.expenses || 0);

    if (isNaN(salary) || salary <= 0) {
      setAiError("Please enter a valid monthly salary.");
      return;
    }

    setAiLoading(true);
    try {
      const body = {
        salary,
        expenses: isNaN(expenses) ? 0 : expenses,
        goals: advisorInput.goals.reduce((acc, g) => {
          acc[g.name] = g.amount;
          return acc;
        }, {}),
      };

      const res = await fetch("http://localhost:8080/api/savings/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setAiError(data.message || "AI generation failed.");
      } else {
        setAiResult({
          idealSavings: data.idealSavings ?? data.monthlySavings ?? null,
          sipAmount: data.sipAmount ?? null,
          safeToSpend: data.safeToSpend ?? null,
          recommendedTimelineMonths: data.recommendedTimelineMonths ?? null,
          goalTimelineMonths: data.goalTimelineMonths ?? data.goalPlans ?? null,
          monthlyPlan: data.monthlyPlan ?? [],
        });
      }
    } catch (err) {
      console.error(err);
      setAiError("Failed to connect to AI service.");
    } finally {
      setAiLoading(false);
    }
  };

  // Helper: Indian currency formatting
  const formatINR = (num) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num || 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your savings data...</p>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <p className="text-center text-gray-600">
          Unable to load data. Please try refreshing.
        </p>
      </div>
    );
  }

  const savingsRate = summary.totalIncome
    ? ((summary.savings / summary.totalIncome) * 100).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <button
        onClick={() => navigate("/dashboard")}
        className="mb-6 text-blue-700 hover:text-blue-900 font-medium flex items-center gap-2"
      >
        ← Back to Dashboard
      </button>

      <h1 className="text-4xl font-bold text-gray-800 mb-8">Savings Overview</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Left/Middle */}
        <div className="lg:col-span-2 space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <p className="text-sm text-gray-500">Monthly Income</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {formatINR(summary.totalIncome)}
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <p className="text-sm text-gray-500">Total Expenses</p>
              <p className="text-3xl font-bold text-red-600 mt-2">
                {formatINR(summary.totalExpenses)}
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <p className="text-sm text-gray-500">Current Savings</p>
              <p
                className={`text-3xl font-bold mt-2 ${
                  summary.savings >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatINR(summary.savings)}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Savings Rate: <strong>{savingsRate}%</strong>
              </p>
            </div>
          </div>

          {/* Monthly Trend Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-semibold mb-4">📈 Monthly Expenses Trend</h3>
            {monthlyData.length === 0 ? (
              <p className="text-center text-gray-500 py-12">
                No monthly data available yet.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => formatINR(value)} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fill="url(#colorExp)"
                    name="Expenses"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Savings Goals */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-semibold mb-6">🎯 Your Savings Goals</h3>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <input
                type="text"
                placeholder="Goal name (e.g. New Phone)"
                value={newGoal.name}
                onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <input
                type="number"
                placeholder="Target ₹"
                value={newGoal.amount}
                onChange={(e) => setNewGoal({ ...newGoal, amount: e.target.value })}
                className="w-full sm:w-48 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                onClick={addGoal}
                className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-3 rounded-xl transition"
              >
                Add Goal
              </button>
            </div>

            {goals.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No goals yet. Start by adding one above!
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-5">
                {goals.map((goal) => {
                  const progress = Math.min(
                    100,
                    Math.round(
                      (summary.savings / (goal.amount || 1)) * 100
                    )
                  );
                  return (
                    <div
                      key={goal.id}
                      className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-lg">{goal.name}</h4>
                          <p className="text-2xl font-bold text-indigo-700">
                            {formatINR(goal.amount)}
                          </p>
                        </div>
                        <span className="text-sm font-medium text-gray-600">
                          {progress}%
                        </span>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-700"
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      <div className="flex justify-between mt-4 text-sm">
                        <span className={progress >= 100 ? "text-green-600 font-medium" : "text-gray-600"}>
                          {progress >= 100 ? "Goal Achieved!" : "Keep going!"}
                        </span>
                        <button
                          onClick={() => deleteGoal(goal.id)}
                          className="text-red-600 hover:text-red-800"
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

        {/* Right Sidebar */}
        <div className="space-y-8">
          {/* Update Income */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h4 className="text-xl font-semibold mb-4">Update Monthly Income</h4>
            <input
              type="number"
              placeholder="Enter your salary"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none mb-4"
            />
            <button
              onClick={updateIncome}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition"
            >
              Update Income
            </button>
          </div>

          {/* Quick Insights */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h4 className="text-xl font-semibold mb-4">Quick Insights</h4>

            {summary.savings < 0 ? (
              <p className="text-red-600 font-medium">
                You're overspending. Cut non-essential expenses.
              </p>
            ) : savingsRate >= 30 ? (
              <p className="text-green-600 font-medium">
                Excellent! You're saving {savingsRate}% — keep it up!
              </p>
            ) : (
              <p className="text-amber-600">
                Saving {savingsRate}%. Aim for 30%+ by automating savings.
              </p>
            )}

            {topCategory && (
              <div className="mt-5 p-4 bg-amber-50 rounded-xl">
                <p className="text-sm font-medium">Highest Spending:</p>
                <p className="text-lg font-bold text-amber-800">
                  {topCategory.name} — {formatINR(topCategory.value)}
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  Tip: Try reducing this by 15–20%
                </p>
              </div>
            )}
          </div>

          {/* AI Savings Advisor */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
            {/* Header */}
            <button
              onClick={() => setShowAI(!showAI)}
              className="w-full flex justify-between items-center p-6"
            >
              <h4 className="text-xl font-semibold">🤖 AI Savings Advisor</h4>
              <span className="text-sm text-blue-600">
                {showAI ? "Hide ▲" : "Show ▼"}
              </span>
            </button>

            {/* Collapsible Body */}
            {showAI && (
              <div className="px-6 pb-6 space-y-4">
                <input
                  type="number"
                  placeholder="Monthly Salary (₹)"
                  value={advisorInput.salary}
                  onChange={(e) =>
                    setAdvisorInput({ ...advisorInput, salary: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />

                <input
                  type="number"
                  placeholder="Expected Monthly Expenses (₹)"
                  value={advisorInput.expenses}
                  onChange={(e) =>
                    setAdvisorInput({ ...advisorInput, expenses: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />

                {/* Goals Input */}
                <div className="border-t pt-4">
                  <p className="font-medium mb-3">Add Goals for Timeline</p>

                  {advisorInput.goals.map((g, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center bg-purple-50 rounded-lg p-3 mb-2"
                    >
                      <span className="text-sm">
                        {g.name} — {formatINR(g.amount)}
                      </span>
                      <button
                        onClick={() => removeAiGoal(i)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ))}

                  <div className="flex gap-2 mt-3">
                    <input
                      type="text"
                      placeholder="Goal name"
                      value={aiNewGoal.name}
                      onChange={(e) =>
                        setAiNewGoal({ ...aiNewGoal, name: e.target.value })
                      }
                      className="flex-1 px-3 py-2 border rounded-lg text-sm"
                    />

                    <input
                      type="number"
                      placeholder="₹ Amount"
                      value={aiNewGoal.amount}
                      onChange={(e) =>
                        setAiNewGoal({ ...aiNewGoal, amount: e.target.value })
                      }
                      className="w-32 px-3 py-2 border rounded-lg text-sm"
                    />

                    <button
                      onClick={addAiGoal}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  onClick={generateAdvice}
                  disabled={aiLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-4 rounded-xl mt-5 disabled:opacity-60 transition"
                >
                  {aiLoading ? "Generating Plan..." : "Generate AI Plan"}
                </button>

                {aiError && (
                  <p className="text-red-600 text-sm mt-3 text-center">{aiError}</p>
                )}

                {/* AI Result */}
                {aiResult && (
                  <div className="mt-6 space-y-5 border-t pt-6">
                    <h5 className="font-bold text-lg">📊 Your Personalized Plan</h5>

                    <div className="grid grid-cols-2 gap-4 text-center">
                      {aiResult.idealSavings > 0 && (
                        <div className="bg-green-50 p-4 rounded-xl">
                          <p className="text-xs text-gray-600">Save Monthly</p>
                          <p className="text-xl font-bold text-green-700">
                            {formatINR(aiResult.idealSavings)}
                          </p>
                        </div>
                      )}

                      {aiResult.safeToSpend > 0 && (
                        <div className="bg-blue-50 p-4 rounded-xl">
                          <p className="text-xs text-gray-600">Safe to Spend</p>
                          <p className="text-xl font-bold text-blue-700">
                            {formatINR(aiResult.safeToSpend)}
                          </p>
                        </div>
                      )}
                    </div>

                    {aiResult.goalTimelineMonths && (
                      <div className="bg-indigo-50 p-4 rounded-xl">
                        <p className="font-medium mb-2">🎯 Goal Timeline</p>
                        <ul className="text-sm space-y-1">
                          {Object.entries(aiResult.goalTimelineMonths).map(
                            ([goal, months]) => (
                              <li key={goal} className="flex justify-between">
                                <span>{goal}</span>
                                <span className="font-semibold">{months} months</span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Savings;