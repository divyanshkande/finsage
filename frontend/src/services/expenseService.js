// src/services/expenseService.js
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8080/api";

// ✅ Cookie-based auth config (no Authorization header needed)
const config = {
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  }
};

export const getExpenses = async () => {
  const res = await axios.get(`${API_BASE}/expenses/all`, config);
  return res.data;
};

export const deleteExpense = async (id) => {
  await axios.delete(`${API_BASE}/expenses/${id}`, config);
};

export const getMonthlySummary = async () => {
  const res = await axios.get(`${API_BASE}/expenses/summary/monthly`, config);
  return Object.entries(res.data).map(([month, amount]) => ({ month, amount }));
};

export const getCategorySummary = async () => {
  const res = await axios.get(`${API_BASE}/expenses/summary/category`, config);
  return Object.entries(res.data).map(([category, amount]) => ({
    name: category,
    value: amount,
  }));
};

export const getSummary = async () => {
  const res = await axios.get(`${API_BASE}/expenses/summary`, config);
  return res.data;
};