// src/services/expenseService.js
import axios from 'axios';

export const filterExpenses = async (category, date, token) => {
  const params = new URLSearchParams();
  if (category) params.append("category", category);
  if (date) params.append("date", date);

  const res = await fetch(`http://localhost:8080/api/expenses/filter?${params.toString()}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    credentials: "include"
  });

  if (!res.ok) {
    throw new Error(`Request failed with status code ${res.status}`);
  }

  return res.json();
};
