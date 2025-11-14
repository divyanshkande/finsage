// src/services/expenseService.js
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8080/api";

// Add auth header automatically
const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export const getExpenses = async () => {
  const res = await axios.get(`${API_BASE}/expenses/all`, authHeader());
  return res.data;
};

export const deleteExpense = async (id) => {
  await axios.delete(`${API_BASE}/expenses/${id}`, authHeader());
};

export const getMonthlySummary = async () => {
  const res = await axios.get(`${API_BASE}/expenses/summary/monthly`, authHeader());
  return Object.entries(res.data).map(([month, amount]) => ({ month, amount }));
};

export const getCategorySummary = async () => {
  const res = await axios.get(`${API_BASE}/expenses/summary/category`, authHeader());
  return Object.entries(res.data).map(([category, amount]) => ({
    name: category,
    value: amount,
  }));
};

export const getSummary = async () => {
  const res = await axios.get(`${API_BASE}/expenses/summary`, authHeader());
  return res.data;
};
