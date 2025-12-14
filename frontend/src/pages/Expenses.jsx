import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiPlus, FiTrash2, FiFilter, FiList } from "react-icons/fi";

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [dateFilter, setDateFilter] = useState("All");

  const [openForm, setOpenForm] = useState(false);
  const [billFile, setBillFile] = useState(null);

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
    const res = await fetch("http://localhost:8080/api/expenses/all", {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    });
    if (res.ok) setExpenses(await res.json());
  };

  // ================= ADD EXPENSE =================
  const addExpense = async () => {
    const { title, amount, category, date } = newExpense;
    if (!title || !amount || !category || !date) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);
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
      setBillFile(null);
      setOpenForm(false);
      fetchExpenses();
    }
    setLoading(false);
  };

  // ================= OCR UPLOAD =================
  const uploadBillAndParse = async () => {
    if (!billFile) return alert("Select a bill first");

    const formData = new FormData();
    formData.append("file", billFile);
    

    setOcrLoading(true);
    try {
      const res = await fetch("http://localhost:8080/api/ocr/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();

        setNewExpense({
          title: data.finalTitle || data.title || "",
          amount: data.amount || "",
          category: data.finalCategory || data.category || "",
          date: data.finalDate || data.date || "",
        });
      } else {
        alert("OCR failed");
      }
    } catch {
      alert("OCR error");
    }
    setOcrLoading(false);
  };

  // ================= DELETE =================
  const deleteExpense = async (id) => {
    await fetch(`http://localhost:8080/api/expenses/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    });
    fetchExpenses();
  };

  const categories = [...new Set(expenses.map((e) => e.category))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-blue-100 p-6">
      <button onClick={() => navigate("/dashboard")} className="text-indigo-700 hover:underline">
        ← Back
      </button>

      <h1 className="text-4xl font-bold mt-4 mb-6">Expenses</h1>

      {/* ================= LIST ================= */}
      <div className="space-y-4">
        {expenses.map((e) => (
          <div key={e.id} className="bg-white p-4 rounded-xl flex justify-between shadow">
            <div>
              <p className="font-semibold">{e.title}</p>
              <p className="text-sm text-gray-600">
                ₹{e.amount} • {e.category} • {e.date}
              </p>
            </div>
            <button onClick={() => deleteExpense(e.id)} className="text-red-600">
              <FiTrash2 />
            </button>
          </div>
        ))}
      </div>

      {/* ================= ADD BUTTON ================= */}
      <button
        onClick={() => setOpenForm(true)}
        className="fixed bottom-8 right-8 bg-indigo-600 text-white p-4 rounded-full"
      >
        <FiPlus size={28} />
      </button>

      {/* ================= MODAL ================= */}
      {openForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white p-6 rounded-2xl w-[800px] grid grid-cols-2 gap-6"
          >
            {/* ===== LEFT FORM ===== */}
            <div className="space-y-3">
              <h3 className="text-xl font-bold">Expense Details</h3>

              <input
                placeholder="Title"
                className="w-full border px-3 py-2 rounded"
                value={newExpense.title}
                onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
              />

              <input
                type="number"
                placeholder="Amount"
                className="w-full border px-3 py-2 rounded"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
              />

              <input
                list="categories"
                placeholder="Category"
                className="w-full border px-3 py-2 rounded"
                value={newExpense.category}
                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
              />

              <input
                type="date"
                className="w-full border px-3 py-2 rounded"
                value={newExpense.date}
                onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
              />

              <button
                onClick={addExpense}
                className="w-full bg-indigo-600 text-white py-2 rounded"
              >
                {loading ? "Saving..." : "Save Expense"}
              </button>
            </div>

            {/* ===== RIGHT OCR ===== */}
            <div className="border-l pl-6 space-y-4">
              <h3 className="font-bold text-lg">Upload Bill (OCR)</h3>

              <input type="file" onChange={(e) => setBillFile(e.target.files[0])} />

              <button
                onClick={uploadBillAndParse}
                className="w-full bg-gray-800 text-white py-2 rounded"
              >
                {ocrLoading ? "Reading bill..." : "Scan Bill"}
              </button>

              <p className="text-sm text-gray-500">
                OCR will auto-fill fields. You can edit before saving.
              </p>
            </div>
          </motion.div>
        </div>
      )}

      <datalist id="categories">
        {categories.map((c, i) => (
          <option key={i} value={c} />
        ))}
      </datalist>
    </div>
  );
}

export default Expenses;
