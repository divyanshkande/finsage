import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, Legend, ResponsiveContainer
} from 'recharts';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#00bcd4'];

function Dashboard() {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        await Promise.all([
          fetchExpenses(),
          fetchMonthlySummary(),
          fetchCategorySummary(),
          fetchSummary()
        ]);
      } catch (error) {
        console.error("Dashboard loading failed:", error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, token]);

  const fetchExpenses = async () => {
    const res = await fetch("http://localhost:8080/api/expenses/all", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      credentials: "include"
    });
    if (res.status === 401) {
      navigate('/');
      return;
    }
    const data = await res.json();
    setExpenses(data);
  };

  const deleteExpense = async (id) => {
    await fetch(`http://localhost:8080/api/expenses/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      credentials: "include"
    });
    fetchExpenses();
  };

  const fetchMonthlySummary = async () => {
    const res = await fetch("http://localhost:8080/api/expenses/summary/monthly", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      credentials: "include"
    });
    const json = await res.json();
    const transformed = Object.entries(json).map(([month, amount]) => ({ month, amount }));
    setMonthlyData(transformed);
  };

  const fetchCategorySummary = async () => {
    const res = await fetch("http://localhost:8080/api/expenses/summary/category", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      credentials: "include"
    });
    const json = await res.json();
    const transformed = Object.entries(json).map(([category, amount]) => ({
      name: category,
      value: amount
    }));
    setCategoryData(transformed);
  };

  const fetchSummary = async () => {
    const res = await fetch("http://localhost:8080/api/expenses/summary", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      credentials: "include"
    });
    const data = await res.json();
    setSummary(data);
  };

  if (loading) {
    return <div className="p-10 text-center text-lg text-gray-700">🔄 Loading your dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Dashboard</h1>
        <div className="flex flex-wrap justify-center sm:justify-end gap-2 mt-4 sm:mt-0">
          <button onClick={() => navigate('/savings')} className="btn bg-blue-500">Savings</button>
          <button onClick={() => navigate('/events')} className="btn bg-green-500">Events</button>
          <button onClick={() => navigate('/expenses')} className="btn bg-purple-500">Expenses</button>
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 shadow rounded text-center">
            <p className="text-gray-500">Total Income</p>
            <p className="text-2xl font-bold text-green-600">₹{summary.totalIncome}</p>
          </div>
          <div className="bg-white p-4 shadow rounded text-center">
            <p className="text-gray-500">Total Expenses</p>
            <p className="text-2xl font-bold text-red-600">₹{summary.totalExpenses}</p>
          </div>
          <div className="bg-white p-4 shadow rounded text-center">
            <p className="text-gray-500">Savings</p>
            <p className="text-2xl font-bold text-blue-600">₹{summary.savings}</p>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 shadow rounded h-[300px] sm:h-[350px]">
          <h3 className="text-lg sm:text-xl font-semibold mb-3">📅 Monthly Expenses</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="amount" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 shadow rounded h-[300px] sm:h-[350px]">
          <h3 className="text-lg sm:text-xl font-semibold mb-3">📊 Category-wise Breakdown</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >
                {categoryData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Expense Table */}
      <div className="overflow-x-auto">
        <h3 className="text-lg sm:text-xl font-semibold mb-2 mt-4">🧾 Expenses</h3>
        <table className="min-w-full bg-white border shadow rounded text-sm sm:text-base">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border">Title</th>
              <th className="py-2 px-4 border">Category</th>
              <th className="py-2 px-4 border">Amount</th>
              <th className="py-2 px-4 border">Date</th>
              <th className="py-2 px-4 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((exp) => (
              <tr key={exp.id}>
                <td className="py-2 px-4 border">{exp.title}</td>
                <td className="py-2 px-4 border">{exp.category}</td>
                <td className="py-2 px-4 border">₹{exp.amount}</td>
                <td className="py-2 px-4 border">{exp.date}</td>
                <td className="py-2 px-4 border">
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    onClick={() => deleteExpense(exp.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;
