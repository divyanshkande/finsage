import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiPlus, FiTrash2, FiFilter, FiList } from "react-icons/fi";

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [dateFilter, setDateFilter] = useState("All");

  const [openForm, setOpenForm] = useState(false);

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
        headers: { Authorization: `Bearer ${token}` },
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
        setOpenForm(false);
      } else {
        const errText = await res.text();
        alert("❌ Failed to add expense: " + errText);
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteExpense = async (id) => {
    await fetch(`http://localhost:8080/api/expenses/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
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
      selectedCategory === "" ||
      e.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const dateMatch = isWithinDateRange(e.date);
    return categoryMatch && dateMatch;
  });

  const categories = [...new Set(expenses.map((e) => e.category))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-blue-100 p-6 relative">
      {/* 🔙 Back */}
      <button
        onClick={() => navigate("/dashboard")}
        className="text-indigo-700 hover:underline font-medium"
      >
        ← Back to Dashboard
      </button>

      {/* Header */}
      <div className="mt-4 mb-6">
        <h1 className="text-4xl font-extrabold text-gray-900 drop-shadow-sm">Expenses</h1>
        <p className="text-gray-600">Track and manage all your expenses</p>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/60 backdrop-blur-xl shadow-lg p-4 rounded-xl mb-8 flex flex-col md:flex-row gap-4 border border-white"
      >
        <div className="flex-1">
          <label className="text-gray-700 font-semibold text-sm flex gap-1 items-center">
            <FiFilter /> Category
          </label>
          <input
            list="category-list"
            type="text"
            placeholder="Search category..."
            className="w-full mt-1 px-3 py-2 border rounded-lg bg-white"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          />
        </div>

        <div className="flex-1">
          <label className="text-gray-700 font-semibold text-sm flex gap-1 items-center">
            <FiList /> Date Range
          </label>
          <select
            className="w-full mt-1 px-3 py-2 border rounded-lg bg-white"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option>All</option>
            <option>Past 7 Days</option>
            <option>Past 1 Month</option>
            <option>Past 1 Year</option>
          </select>
        </div>
      </motion.div>

      <datalist id="category-list">
        {categories.map((cat, idx) => (
          <option key={idx} value={cat} />
        ))}
      </datalist>

      {/* Expense List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4"
      >
        {filteredExpenses.map((expense) => (
          <motion.div
            key={expense.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/70 backdrop-blur-md shadow-lg p-4 rounded-xl flex justify-between items-center border border-white"
          >
            <div>
              <p className="font-semibold text-gray-900 text-lg">{expense.title}</p>
              <p className="text-gray-600 text-sm">
                ₹{expense.amount} • {expense.category} • {expense.date}
              </p>
            </div>
            <button
              onClick={() => deleteExpense(expense.id)}
              className="text-red-600 hover:text-red-800"
            >
              <FiTrash2 size={22} />
            </button>
          </motion.div>
        ))}
      </motion.div>

      {/* Floating Add Button */}
      <button
        onClick={() => setOpenForm(true)}
        className="fixed bottom-8 right-8 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-xl"
      >
        <FiPlus size={28} />
      </button>

      {/* Add Expense Modal */}
      {openForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-6 rounded-2xl shadow-xl w-96 space-y-4"
          >
            <h3 className="text-xl font-bold text-gray-900">Add Expense</h3>

            <input
              type="text"
              placeholder="Title"
              className="w-full px-3 py-2 border rounded-lg"
              value={newExpense.title}
              onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
            />

            <input
              type="number"
              placeholder="Amount"
              className="w-full px-3 py-2 border rounded-lg"
              value={newExpense.amount}
              onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
            />

            <input
              list="category-list"
              type="text"
              placeholder="Category"
              className="w-full px-3 py-2 border rounded-lg"
              value={newExpense.category}
              onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
            />

            <input
              type="date"
              className="w-full px-3 py-2 border rounded-lg"
              value={newExpense.date}
              onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
            />

            <button
              onClick={addExpense}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
            >
              {loading ? "Adding..." : "Add Expense"}
            </button>

            <button
              onClick={() => setOpenForm(false)}
              className="w-full py-2 text-gray-600 hover:underline"
            >
              Cancel
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

export default Expenses;
