// imports
import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#3B82F6'];

function Events() {
  const [events, setEvents] = useState([]);
  const [editId, setEditId] = useState(null); // Use event ID instead of index
  const [editCategories, setEditCategories] = useState([]);
  
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    date: '',
    totalBudget: '',
    categories: [{ name: '', amount: '' }]
  });

  const fetchEvents = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/events", {
        credentials: 'include'
      });

      if (!res.ok) {
        throw new Error('Failed to fetch events');
      }

      const data = await res.json();
      const sorted = data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setEvents(sorted);
    } catch (err) {
      console.error("Error fetching events:", err);
      
      alert("Failed to load events. Please try again.");
    }
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
      if (cat.name && cat.amount && !isNaN(cat.amount)) {
        breakdown[cat.name] = parseFloat(cat.amount);
      }
    });

    const payload = {
      title: formData.title,
      date: formData.date,
      totalBudget: parseFloat(formData.totalBudget),
      categoryBreakdown: breakdown
    };

    try {
      const res = await fetch("http://localhost:8080/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to create event');

      await fetchEvents(); // Refresh list

      setFormData({
        title: '',
        date: '',
        totalBudget: '',
        categories: [{ name: '', amount: '' }]
      });
    } catch (err) {
      console.error(err);
      alert("Failed to save event.");
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      const res = await fetch(`http://localhost:8080/api/events/${id}`, {
        method: "DELETE",
        credentials: "include"
      });

      if (!res.ok) throw new Error('Delete failed');

      setEvents(events.filter(ev => ev.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete event.");
    }
  };

  const handleEditCategory = (eventId) => {
    const currentEvent = events.find(ev => ev.id === eventId);
    if (!currentEvent) return;

    const categoryList = Object.entries(currentEvent.categoryBreakdown || {}).map(
      ([name, amount]) => ({ name, amount: amount.toString() })
    );

    setEditId(eventId);
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
      if (c.name && c.amount && !isNaN(c.amount)) {
        breakdown[c.name] = parseFloat(c.amount);
      }
    });

    try {
      const res = await fetch(`http://localhost:8080/api/events/${eventId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ categoryBreakdown: breakdown })
      });

      if (!res.ok) throw new Error('Update failed');

      const updatedEvent = await res.json();

      // Recalculate total spent
      const totalSpent = Object.values(updatedEvent.categoryBreakdown || {})
        .reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0);

      const updatedEvents = events.map(ev =>
        ev.id === eventId
          ? { ...updatedEvent, totalSpent }
          : ev
      );

      setEvents(updatedEvents);
      setEditId(null);
      setEditCategories([]);
    } catch (err) {
      console.error(err);
      alert("Failed to update event.");
    }
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
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="date"
          required
          value={formData.date}
          onChange={e => setFormData({ ...formData, date: e.target.value })}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="number"
          required
          placeholder="Total Budget"
          value={formData.totalBudget}
          onChange={e => setFormData({ ...formData, totalBudget: e.target.value })}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <h4 className="font-semibold text-gray-700">📊 Category Breakdown</h4>

        {formData.categories.map((cat, i) => (
          <div key={i} className="grid sm:grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Category (e.g. Food)"
              value={cat.name}
              onChange={e => handleChange(i, 'name', e.target.value)}
              className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="number"
              placeholder="Amount"
              value={cat.amount}
              onChange={e => handleChange(i, 'amount', e.target.value)}
              className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}

        <button
          type="button"
          onClick={addCategory}
          className="text-sm text-blue-600 hover:underline"
        >
          + Add Another Category
        </button>

        <div className="pt-4">
          <button
            type="submit"
            className="bg-green-600 text-white px-8 py-3 rounded-lg shadow hover:bg-green-700 transition"
          >
            ✅ Save Event
          </button>
        </div>
      </form>

      <h2 className="text-2xl font-bold mb-6 text-gray-800">📋 Your Events</h2>

      {/* EVENTS GRID */}
      {events.length === 0 ? (
        <p className="text-gray-600 text-center">No events yet. Create one above!</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((ev) => {
            const data = Object.entries(ev.categoryBreakdown || {}).map(([name, value]) => ({
              name,
              value: typeof value === 'number' ? value : 0
            }));
            const totalSpent = data.reduce((sum, d) => sum + d.value, 0);
            const saved = ev.totalBudget - totalSpent;
            const percentage = ev.totalBudget > 0 ? (totalSpent / ev.totalBudget) * 100 : 0;

            return (
              <div
                key={ev.id}
                className="rounded-2xl bg-white/70 backdrop-blur-xl shadow-lg border border-white/40 p-6 transition-all hover:shadow-2xl hover:scale-[1.02]"
              >
                <h3 className="text-xl font-semibold text-gray-800">
                  {ev.title}
                </h3>

                <p className="text-sm text-gray-500 mt-1">📅 {new Date(ev.date).toLocaleDateString()}</p>

                <div className="mt-3 text-sm text-gray-700 space-y-1">
                  <p>💰 Budget: ₹{ev.totalBudget.toLocaleString()}</p>
                  <p>🧾 Spent: ₹{totalSpent.toLocaleString()}</p>
                </div>

                {/* PROGRESS BAR */}
                <div className="w-full bg-gray-300 rounded-full h-4 mt-4 overflow-hidden">
                  <div
                    className={`h-4 rounded-full transition-all ${
                      percentage < 80 ? 'bg-green-500' : percentage < 100 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  ></div>
                </div>

                <p
                  className={`mt-3 font-bold text-lg ${
                    saved >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {saved >= 0
                    ? `🎉 Saved ₹${saved.toLocaleString()}`
                    : `⚠️ Overspent ₹${Math.abs(saved).toLocaleString()}`}
                </p>

                {/* EDIT MODE */}
                {editId === ev.id ? (
                  <div className="space-y-3 mt-5">
                    <h4 className="font-semibold text-gray-700">✏️ Edit Categories</h4>

                    {editCategories.map((cat, i) => (
                      <div key={i} className="grid grid-cols-2 gap-2">
                        <input
                          value={cat.name}
                          placeholder="Category"
                          onChange={e => updateCategory(i, 'name', e.target.value)}
                          className="px-3 py-2 rounded border border-gray-300"
                        />
                        <input
                          type="number"
                          value={cat.amount}
                          placeholder="Amount"
                          onChange={e => updateCategory(i, 'amount', e.target.value)}
                          className="px-3 py-2 rounded border border-gray-300"
                        />
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addEditCategory}
                      className="text-blue-600 text-sm hover:underline"
                    >
                      + Add Category
                    </button>

                    <div className="flex justify-end space-x-3 mt-4">
                      <button
                        onClick={() => saveUpdatedEvent(ev.id)}
                        className="bg-blue-600 text-white px-5 py-2 rounded shadow hover:bg-blue-700"
                      >
                        💾 Save Changes
                      </button>
                      <button
                        onClick={() => {
                          setEditId(null);
                          setEditCategories([]);
                        }}
                        className="text-red-600 hover:underline"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* BAR CHART */}
                    {data.length > 0 && (
                      <div className="mt-5 bg-gray-50 rounded-xl p-4">
                        <h4 className="font-semibold text-gray-700 mb-3">
                          Expense Breakdown
                        </h4>

                        <div className="w-full h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data} layout="vertical" margin={{ left: 30, right: 20 }}>
                              <XAxis type="number" />
                              <YAxis dataKey="name" type="category" width={90} />
                              <Tooltip formatter={(value) => `₹${value}`} />
                              <Bar dataKey="value">
                                {data.map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                  />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between mt-5 text-sm">
                      <button
                        onClick={() => handleEditCategory(ev.id)}
                        className="text-blue-600 hover:underline"
                      >
                        ✏️ Edit Categories
                      </button>

                      <button
                        onClick={() => handleDeleteEvent(ev.id)}
                        className="text-red-600 hover:underline"
                      >
                        🗑 Delete Event
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Events;