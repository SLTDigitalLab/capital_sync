import apiClient from './apiClient';

const INCOME_ENDPOINT = '/api/income';

/**
 * Create a new income entry
 * @param {Object} incomeData - Income data
 * @param {string} incomeData.title - Title/description
 * @param {number} incomeData.amount - Amount
 * @param {string} incomeData.category - Category
 * @param {string} incomeData.date - Date (ISO format)
 * @returns {Promise<Object>} Created income entry
 */
export const createIncome = async (incomeData) => {
  const response = await apiClient.post(`${INCOME_ENDPOINT}/`, incomeData);
  return response.data;
};

/**
 * Get all income entries for the authenticated user
 * @returns {Promise<Array>} List of income entries
 */
export const getAllIncomes = async () => {
  const response = await apiClient.get(`${INCOME_ENDPOINT}/`);
  return response.data;
};

/**
 * Get a specific income entry by ID
 * @param {string} id - Income ID
 * @returns {Promise<Object>} Income entry
 */
export const getIncomeById = async (id) => {
  const response = await apiClient.get(`${INCOME_ENDPOINT}/${id}`);
  return response.data;
};

/**
 * Update an income entry
 * @param {string} id - Income ID
 * @param {Object} incomeData - Updated income data
 * @returns {Promise<Object>} Updated income entry
 */
export const updateIncome = async (id, incomeData) => {
  const response = await apiClient.put(`${INCOME_ENDPOINT}/${id}`, incomeData);
  return response.data;
};

/**
 * Delete an income entry
 * @param {string} id - Income ID
 * @returns {Promise<void>}
 */
export const deleteIncome = async (id) => {
  await apiClient.delete(`${INCOME_ENDPOINT}/${id}`);
};

export const fetchIncomeSummary = async () => {
  const token = localStorage.getItem("token"); // Firebase token

  const response = await fetch("http://localhost:8000/income/summary", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch income summary");
  }

  return response.json();
};

