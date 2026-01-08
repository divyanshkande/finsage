import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiPlus, FiTrash2, FiX, FiUpload } from "react-icons/fi";

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true); // Initial load
  const [saving, setSaving] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);

  const [openForm, setOpenForm] = useState(false);
  const [billFile, setBillFile] = useState(null);

  const [newExpense, setNewExpense] = useState({
    title: "",
    amount: "",
    category: "",
    date: "",
  });

  const navigate = useNavigate();

  // Fetch all expenses
  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/api/expenses/all", {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        // Sort by date descending
        const sorted = data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setExpenses(sorted);
      } else {
        alert("Failed to load expenses. Please try again.");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      alert("Network error. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // Add new expense
  const addExpense = async () => {
    const { title, amount, category, date } = newExpense;

    if (!title.trim() || !amount || !category.trim() || !date) {
      alert("Please fill in all fields.");
      return;
    }

    if (isNaN(amount) || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("http://localhost:8080/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title: title.trim(),
          amount: parseFloat(amount),
          category: category.trim(),
          date,
        }),
      });

      if (res.ok) {
        resetForm();
        fetchExpenses();
      } else {
        alert("Failed to save expense.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving expense.");
    } finally {
      setSaving(false);
    }
  };

  // OCR Bill Upload
  const uploadBillAndParse = async () => {
    if (!billFile) {
      alert("Please select a bill image or PDF first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", billFile);

    setOcrLoading(true);
    try {
      const res = await fetch("http://localhost:8080/api/ocr/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();

        setNewExpense({
          title: data.finalTitle || data.title || "",
          amount: data.amount || "",
          category: data.finalCategory || data.category || "",
          date: data.finalDate || data.date || "",
        });

        alert("Bill scanned successfully! Review and edit if needed.");
      } else {
        const error = await res.text();
        alert("OCR failed: " + (error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Upload failed. Please try again.");
    } finally {
      setOcrLoading(false);
    }
  };

  // Delete expense
  const deleteExpense = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;

    try {
      const res = await fetch(`http://localhost:8080/api/expenses/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        setExpenses(expenses.filter((e) => e.id !== id));
      } else {
        alert("Failed to delete expense.");
      }
    } catch (err) {
      alert("Delete failed.");
    }
  };

  // Reset form and close modal
  const resetForm = () => {
    setNewExpense({ title: "", amount: "", category: "", date: "" });
    setBillFile(null);
    setOpenForm(false);
  };

  // Get unique sorted categories for datalist
  const categories = [...new Set(expenses.map((e) => e.category))]
    .filter(Boolean)
    .sort();

  // Format date 
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-6">
      <button
        onClick={() => navigate("/dashboard")}
        className="mb-6 text-indigo-700 hover:text-indigo-900 font-medium flex items-center gap-2"
      >
        ← Back to Dashboard
      </button>

      <h1 className="text-4xl font-bold text-gray-800 mb-8">Your Expenses</h1>

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading expenses...</p>
        </div>
      ) : expenses.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-xl text-gray-600">No expenses recorded yet.</p>
          <p className="text-gray-500 mt-2">Click the + button to add your first one!</p>
        </div>
      ) : (
        /* Expenses List */
        <div className="grid gap-4 max-w-4xl mx-auto">
          {expenses.map((e) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow p-6 flex justify-between items-center"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{e.title}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">₹{e.amount.toLocaleString("en-IN")}</span> •{" "}
                  <span className="text-indigo-600">{e.category}</span> •{" "}
                  {formatDate(e.date)}
                </p>
              </div>

              <button
                onClick={() => deleteExpense(e.id)}
                className="text-red-600 hover:text-red-700 p-3 rounded-full hover:bg-red-50 transition"
                aria-label="Delete expense"
              >
                <FiTrash2 size={20} />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Floating Add Button */}
      <button
        onClick={() => setOpenForm(true)}
        className="fixed bottom-8 right-8 bg-indigo-600 hover:bg-indigo-700 text-white p-5 rounded-full shadow-2xl transition transform hover:scale-110"
        aria-label="Add new expense"
      >
        <FiPlus size={32} />
      </button>

      {/* Add Expense Modal */}
      {openForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-8">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Add New Expense</h2>
                <button
                  onClick={resetForm}
                  className="text-gray-500 hover:text-gray-800 text-3xl"
                >
                  <FiX />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Left: Manual Form */}
                <div className="space-y-5">
                  <h3 className="text-lg font-semibold text-gray-700">Enter Details</h3>

                  <input
                    type="text"
                    placeholder="Expense Title (e.g. Grocery Shopping)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newExpense.title}
                    onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                  />

                  <input
                    type="number"
                    placeholder="Amount (₹)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  />

                  <input
                    list="category-options"
                    placeholder="Category (e.g. Food, Transport)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                  />

                  <input
                    type="date"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                  />

                  <button
                    onClick={addExpense}
                    disabled={saving}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white font-medium py-4 rounded-xl transition"
                  >
                    {saving ? "Saving Expense..." : "Save Expense"}
                  </button>
                </div>

                {/* Right: OCR Upload */}
                <div className="space-y-5 border-l pl-8">
                  <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                    <FiUpload /> Upload Bill for Auto-Fill (OCR)
                  </h3>

                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setBillFile(e.target.files[0])}
                      className="block w-full text-sm text-gray-600 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                    {billFile && (
                      <p className="mt-3 text-sm text-green-600">✓ {billFile.name}</p>
                    )}
                  </div>

                  <button
                    onClick={uploadBillAndParse}
                    disabled={!billFile || ocrLoading}
                    className="w-full bg-gray-900 hover:bg-black disabled:opacity-60 text-white font-medium py-4 rounded-xl transition flex items-center justify-center gap-2"
                  >
                    {ocrLoading ? (
                      <>Scanning bill...</>
                    ) : (
                      <>Scan Bill with OCR</>
                    )}
                  </button>

                  <p className="text-sm text-gray-500">
                    Upload a clear photo or PDF of your bill. The system will try to extract
                    title, amount, category, and date automatically.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Datalist for categories */}
      <datalist id="category-options">
        {categories.map((cat, i) => (
          <option key={i} value={cat} />
        ))}
      </datalist>
    </div>
  );
}

export default Expenses;