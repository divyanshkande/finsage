// imports
import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#00bcd4'];

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
    setFormData({ ...formData, categories: [...formData.categories, { name: '', amount: '' }] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const breakdown = {};
    formData.categories.forEach(cat => {
      if (cat.name && cat.amount) breakdown[cat.name] = parseFloat(cat.amount);
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

    fetchEvents(); // ✅ Refresh without reload
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
    setEvents(events.filter(e => e.id !== id));
  };

  const handleEditCategory = (eventIndex) => {
    const currentEvent = events[eventIndex];
    const categoryList = Object.entries(currentEvent.categoryBreakdown).map(([name, amount]) => ({
      name,
      amount
    }));
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
    if (c.name && c.amount) breakdown[c.name] = parseFloat(c.amount);
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

  // ✅ Patch totalSpent if not returned
  updatedEvent.totalSpent = Object.values(updatedEvent.categoryBreakdown).reduce(
    (sum, val) => sum + val,
    0
  );

  const updatedEvents = events.map((ev) =>
    ev.id === eventId ? updatedEvent : ev
  );

  setEvents(updatedEvents);
  setEditIndex(null);
};



  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <button
        onClick={() => navigate('/dashboard')}
        className="mb-6 text-blue-600 hover:text-blue-800 font-medium"
      >
        ← Back to Dashboard
      </button>

      <h2 className="text-2xl font-bold text-gray-800 mb-6">🎉 Plan an Event</h2>

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-xl p-6 mb-10 max-w-2xl space-y-4">
        <input type="text" placeholder="Event Title" required value={formData.title}
          onChange={e => setFormData({ ...formData, title: e.target.value })}
          className="input" />

        <input type="date" required value={formData.date}
          onChange={e => setFormData({ ...formData, date: e.target.value })}
          className="input" />

        <input type="number" placeholder="Total Budget" required value={formData.totalBudget}
          onChange={e => setFormData({ ...formData, totalBudget: e.target.value })}
          className="input" />

        <h4 className="font-semibold text-gray-700">📊 Category Breakdown</h4>
        {formData.categories.map((cat, i) => (
          <div key={i} className="grid sm:grid-cols-2 gap-2">
            <input type="text" placeholder="Category" value={cat.name}
              onChange={e => handleChange(i, 'name', e.target.value)} className="input" />
            <input type="number" placeholder="Amount" value={cat.amount}
              onChange={e => handleChange(i, 'amount', e.target.value)} className="input" />
          </div>
        ))}

        <button type="button" onClick={addCategory} className="text-sm text-blue-600">+ Add Category</button>

        <button type="submit" className="bg-green-500 text-white px-6 py-2 rounded mt-3 hover:bg-green-600">✅ Save Event</button>
      </form>

      <h2 className="text-xl font-bold mb-4">📋 Your Events</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {events.map((ev, idx) => {
          const data = Object.entries(ev.categoryBreakdown).map(([name, value]) => ({ name, value }));
          const totalSpent = data.reduce((sum, d) => sum + d.value, 0);
          const saved = ev.totalBudget - totalSpent;

          return (
            <div key={idx} className="bg-white rounded-xl shadow-md p-5 flex flex-col space-y-3">
              <h3 className="text-lg font-semibold text-gray-800">{ev.title}</h3>
              <p className="text-sm text-gray-500">📅 {ev.date}</p>
              <p className="text-gray-700 text-sm">Total Budget: ₹{ev.totalBudget}</p>
              <p className="text-gray-700 text-sm">Spent: ₹{totalSpent}</p>
              <p className={`text-sm font-bold ${saved >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {saved >= 0 ? `🎉 Saved ₹${saved}` : `⚠️ Overspent ₹${-saved}`}
              </p>

              {editIndex === idx ? (
                <div className="space-y-2 mt-2">
                  <h4 className="font-semibold text-gray-700">✏️ Edit Categories</h4>
                  {editCategories.map((cat, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        value={cat.name}
                        onChange={e => updateCategory(i, 'name', e.target.value)}
                        placeholder="Category"
                        className="input"
                      />
                      <input
                        type="number"
                        value={cat.amount}
                        onChange={e => updateCategory(i, 'amount', e.target.value)}
                        placeholder="Amount"
                        className="input"
                      />
                    </div>
                  ))}
                  <button onClick={addEditCategory} className="text-sm text-blue-600">+ Add More</button>
                  <div className="flex justify-end space-x-3 mt-2">
                    <button onClick={() => saveUpdatedEvent(ev.id)} className="bg-blue-600 text-white px-4 py-1 rounded">💾 Save</button>
                    <button onClick={() => setEditIndex(null)} className="text-red-500">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <PieChart width={240} height={240}>
                    <Pie data={data} dataKey="value" nameKey="name" outerRadius={80} label>
                      {data.map((entry, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                  <div className="flex justify-between">
                    <button onClick={() => handleEditCategory(idx)} className="text-sm text-blue-600 hover:underline">✏️ Edit</button>
                    <button onClick={() => handleDeleteEvent(ev.id)} className="text-sm text-red-600 hover:underline">🗑️ Delete</button>
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
