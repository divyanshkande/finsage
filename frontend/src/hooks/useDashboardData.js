// src/hooks/useDashboardData.js
import { useState, useEffect } from "react";
import {
  getExpenses,
  deleteExpense,
  getMonthlySummary,
  getCategorySummary,
  getSummary,
} from "../services/expenseService";

export default function useDashboardData(navigate) {
  const [expenses, setExpenses] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const loadData = async () => {
    try {
      const [expensesRes, monthlyRes, categoryRes, summaryRes] =
        await Promise.all([
          getExpenses(),
          getMonthlySummary(),
          getCategorySummary(),
          getSummary(),
        ]);

      setExpenses(expensesRes);
      setMonthlyData(monthlyRes);
      setCategoryData(categoryRes);
      setSummary(summaryRes);
    } catch (err) {
      console.error("Error loading dashboard:", err);
      // Don't navigate here - let ProtectedRoute handle it
    } finally {
      setLoading(false);
    }
  };

  loadData();
}, []);

  const handleDelete = async (id) => {
    try {
      await deleteExpense(id);
      setExpenses((prev) => prev.filter((exp) => exp.id !== id)); // optimistic update
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return { expenses, monthlyData, categoryData, summary, loading, handleDelete };
}
