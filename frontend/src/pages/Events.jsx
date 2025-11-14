// imports
import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#3B82F6'];

function Events() {
  const [events, setEvents] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editCategories, setEditCategories] = useState([]);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    date: '',
    totalBudget: '',
    categories: [{ name: '', amount: '' }]
  });

  const fetchEvents = async () => {
    const res = await fetch("http://localhost:8080/api/events", {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include'
    });

    const data = await res.json();
    const sorted = data.sort((a, b) => new Date(b.date) - new Date(a.date));
    setEvents(sorted);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleChange = (index, field, value) => {
    const updated = [...formData.categories];
    updated[index][field] = value;
    setFormData({ ...formData, categories: updated });
  };

  const addCategory = () => {
    setFormData({
      ...formData,
      categories: [...formData.categories, { name: '', amount: '' }]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const breakdown = {};
    formData.categories.forEach(cat => {
      if (cat.name && cat.amount)
        breakdown[cat.name] = parseFloat(cat.amount);
    });

    const payload = {
      title: formData.title,
      date: formData.date,
      totalBudget: parseFloat(formData.totalBudget),
      categoryBreakdown: breakdown
    };

    await fetch("http://localhost:8080/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      credentials: "include",
      body: JSON.stringify(payload)
    });

    fetchEvents();
    setFormData({
      title: '',
      date: '',
      totalBudget: '',
      categories: [{ name: '', amount: '' }]
    });
  };

  const handleDeleteEvent = async (id) => {
    await fetch(`http://localhost:8080/api/events/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include"
    });

    setEvents(events.filter(ev => ev.id !== id));
  };

  const handleEditCategory = (eventIndex) => {
    const currentEvent = events[eventIndex];
    const categoryList = Object.entries(currentEvent.categoryBreakdown).map(
      ([name, amount]) => ({ name, amount })
    );

    setEditIndex(eventIndex);
    setEditCategories(categoryList);
  };

  const updateCategory = (i, field, value) => {
    const copy = [...editCategories];
    copy[i][field] = value;
    setEditCategories(copy);
  };

  const addEditCategory = () => {
    setEditCategories([...editCategories, { name: '', amount: '' }]);
  };

  const saveUpdatedEvent = async (eventId) => {
    const breakdown = {};
    editCategories.forEach(c => {
      if (c.name && c.amount)
        breakdown[c.name] = parseFloat(c.amount);
    });

    const res = await fetch(`http://localhost:8080/api/events/${eventId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      credentials: "include",
      body: JSON.stringify(breakdown)
    });

    const updatedEvent = await res.json();

    updatedEvent.totalSpent = Object.values(updatedEvent.categoryBreakdown)
      .reduce((sum, val) => sum + val, 0);

    const updatedEvents = events.map(ev =>
      ev.id === eventId ? updatedEvent : ev
    );

    setEvents(updatedEvents);
    setEditIndex(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6">
      <button
        onClick={() => navigate('/dashboard')}
        className="mb-6 text-blue-600 hover:text-blue-800 font-medium"
      >
        ← Back to Dashboard
      </button>

      <h2 className="text-3xl font-bold text-gray-800 mb-6">🎉 Plan an Event</h2>

      {/* FORM CARD */}
      <form
        onSubmit={handleSubmit}
        className="backdrop-blur-xl bg-white/70 shadow-xl rounded-2xl p-6 mb-10 max-w-3xl space-y-4 border border-white/40"
      >
        <input
          type="text"
          required
          placeholder="Event Title"
          value={formData.title}
          onChange={e => setFormData({ ...formData, title: e.target.value })}
          className="input"
        />

        <input
          type="date"
          required
          value={formData.date}
          onChange={e => setFormData({ ...formData, date: e.target.value })}
          className="input"
        />

        <input
          type="number"
          required
          placeholder="Total Budget"
          value={formData.totalBudget}
          onChange={e => setFormData({ ...formData, totalBudget: e.target.value })}
          className="input"
        />

        <h4 className="font-semibold text-gray-700">📊 Category Breakdown</h4>

        {formData.categories.map((cat, i) => (
          <div key={i} className="grid sm:grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Category"
              value={cat.name}
              onChange={e => handleChange(i, 'name', e.target.value)}
              className="input"
            />

            <input
              type="number"
              placeholder="Amount"
              value={cat.amount}
              onChange={e => handleChange(i, 'amount', e.target.value)}
              className="input"
            />
          </div>
        ))}

        <button
          type="button"
          onClick={addCategory}
          className="text-sm text-blue-600"
        >
          + Add Category
        </button>

        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-2 rounded-lg shadow hover:bg-green-700"
        >
          ✅ Save Event
        </button>
      </form>

      <h2 className="text-2xl font-bold mb-4">📋 Your Events</h2>

      {/* EVENTS GRID */}
      <div className="grid md:grid-cols-2 gap-6">
        {events.map((ev, idx) => {
          const data = Object.entries(ev.categoryBreakdown).map(([name, value]) => ({ name, value }));
          const totalSpent = data.reduce((sum, d) => sum + d.value, 0);

          const saved = ev.totalBudget - totalSpent;
          const percentage = Math.min((totalSpent / ev.totalBudget) * 100, 100);

          return (
            <div
              key={idx}
              className="rounded-2xl bg-white/70 backdrop-blur-xl shadow-lg border border-white/40 p-5 transition-all hover:shadow-2xl hover:scale-[1.02]"
            >
              <h3 className="text-xl font-semibold text-gray-800">
                {ev.title}
              </h3>

              <p className="text-sm text-gray-500 mt-1">📅 {ev.date}</p>

              <div className="mt-3 text-sm text-gray-700 space-y-1">
                <p>💰 Total Budget: ₹{ev.totalBudget}</p>
                <p>🧾 Spent: ₹{totalSpent}</p>
              </div>

              {/* PROGRESS BAR */}
              <div className="w-full bg-gray-300 rounded-full h-3 mt-3">
                <div
                  className={`h-3 rounded-full ${percentage < 80 ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>

              <p
                className={`mt-2 font-bold ${
                  saved >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {saved >= 0
                  ? `🎉 Saved ₹${saved}`
                  : `⚠️ Overspent ₹${-saved}`}
              </p>

              {/* EDIT MODE */}
              {editIndex === idx ? (
                <div className="space-y-2 mt-4">
                  <h4 className="font-semibold">✏️ Edit Categories</h4>

                  {editCategories.map((cat, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        value={cat.name}
                        placeholder="Category"
                        onChange={e => updateCategory(i, 'name', e.target.value)}
                        className="input"
                      />

                      <input
                        type="number"
                        value={cat.amount}
                        placeholder="Amount"
                        onChange={e => updateCategory(i, 'amount', e.target.value)}
                        className="input"
                      />
                    </div>
                  ))}

                  <button
                    onClick={addEditCategory}
                    className="text-blue-600 text-sm"
                  >
                    + Add More
                  </button>

                  <div className="flex justify-end space-x-3 mt-2">
                    <button
                      onClick={() => saveUpdatedEvent(ev.id)}
                      className="bg-blue-600 text-white px-4 py-1 rounded"
                    >
                      💾 Save
                    </button>
                    <button
                      onClick={() => setEditIndex(null)}
                      className="text-red-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* HORIZONTAL BAR CHART */}
                  <div className="mt-4 bg-gray-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-700 mb-2">
                      Expense Breakdown
                    </h4>

                    <div className="w-full h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={80} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="value">
                            {data.map((entry, index) => (
                              <Cell
                                key={index}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="flex justify-between mt-3">
                    <button
                      onClick={() => handleEditCategory(idx)}
                      className="text-blue-600 text-sm hover:underline"
                    >
                      ✏️ Edit
                    </button>

                    <button
                      onClick={() => handleDeleteEvent(ev.id)}
                      className="text-red-600 text-sm hover:underline"
                    >
                      🗑 Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Events;
