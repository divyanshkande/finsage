import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [dateFilter, setDateFilter] = useState("All");

  const [newExpense, setNewExpense] = useState({
    title: "",
    amount: "",
    category: "",
    date: "",
  });

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/expenses/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setExpenses(data);
      }
    } catch (err) {
      console.error("Failed to fetch expenses", err);
    }
  };

  const addExpense = async () => {
    const { title, amount, category, date } = newExpense;
    if (!title || !amount || !category || !date) {
      alert("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({ ...newExpense, amount: parseFloat(amount) }),
      });

      if (res.ok) {
        setNewExpense({ title: "", amount: "", category: "", date: "" });
        fetchExpenses();
      } else {
        const errText = await res.text();
        alert("❌ Failed to add expense: " + errText);
      }
    } catch (err) {
      console.error("Error adding expense:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteExpense = async (id) => {
    await fetch(`http://localhost:8080/api/expenses/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });
    fetchExpenses();
  };

  const isWithinDateRange = (dateString) => {
    const today = new Date();
    const expenseDate = new Date(dateString);

    if (dateFilter === "Past 7 Days") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(today.getDate() - 7);
      return expenseDate >= sevenDaysAgo;
    }

    if (dateFilter === "Past 1 Month") {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(today.getMonth() - 1);
      return expenseDate >= oneMonthAgo;
    }

    if (dateFilter === "Past 1 Year") {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(today.getFullYear() - 1);
      return expenseDate >= oneYearAgo;
    }

    return true;
  };

  const filteredExpenses = expenses.filter((e) => {
    const categoryMatch =
      selectedCategory === "" || e.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const dateMatch = isWithinDateRange(e.date);
    return categoryMatch && dateMatch;
  });

  const categories = [...new Set(expenses.map((e) => e.category))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6 space-y-10">
      {/* 🔙 Back */}
      <button
        onClick={() => navigate("/dashboard")}
        className="text-blue-600 hover:underline font-medium"
      >
        ← Back to Dashboard
      </button>

      {/* ➕ Add Expense */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white p-6 rounded-xl shadow-md max-w-2xl mx-auto space-y-4"
      >
        <h2 className="text-2xl font-bold text-gray-800">➕ Add Expense</h2>

        <input
          type="text"
          placeholder="Expense Title"
          value={newExpense.title}
          onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
          className="w-full px-3 py-2 border rounded"
        />

        <input
          type="number"
          placeholder="Amount (₹)"
          value={newExpense.amount}
          onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
          className="w-full px-3 py-2 border rounded"
        />

        <input
          list="category-list"
          type="text"
          placeholder="Enter or select category"
          value={newExpense.category}
          onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
          className="w-full px-3 py-2 border rounded"
        />
        <datalist id="category-list">
          {categories.map((cat, idx) => (
            <option key={idx} value={cat} />
          ))}
        </datalist>

        <input
          type="date"
          value={newExpense.date}
          onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
          className="w-full px-3 py-2 border rounded"
        />

        <button
          onClick={addExpense}
          disabled={loading}
          className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700 transition disabled:opacity-60"
        >
          {loading ? "Adding..." : "Add Expense"}
        </button>
      </motion.div>

      {/* 🔍 Filters */}
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
        <div>
          <label className="block mb-1 font-medium text-sm text-gray-600">📁 Category</label>
          <input
            list="category-list"
            type="text"
            placeholder="Filter by category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium text-sm text-gray-600">📅 Date Range</label>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          >
            <option>All</option>
            <option>Past 7 Days</option>
            <option>Past 1 Month</option>
            <option>Past 1 Year</option>
          </select>
        </div>
      </div>

      {/* 📋 Expense List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white p-6 rounded-xl shadow max-w-4xl mx-auto"
      >
        <h3 className="text-xl font-semibold mb-4 text-gray-800">📋 Expense History</h3>

        {filteredExpenses.length === 0 ? (
          <p className="text-gray-500">No expenses found.</p>
        ) : (
          <ul className="space-y-4">
            {filteredExpenses.map((expense) => (
              <motion.li
                key={expense.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-50 p-4 rounded flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{expense.title}</p>
                  <p className="text-sm text-gray-600">
                    ₹{expense.amount} • {expense.category} • {expense.date}
                  </p>
                </div>
                <button
                  onClick={() => deleteExpense(expense.id)}
                  className="text-red-500 hover:underline text-sm"
                >
                  Delete
                </button>
              </motion.li>
            ))}
          </ul>
        )}
      </motion.div>
    </div>
  );
}

export default Expenses;
