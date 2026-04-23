import apiClient from './apiClient';

const EXPENSE_ENDPOINT = '/api/expense';

/**
 * Create a new expense entry
 * @param {Object} expenseData - Expense data
 * @param {string} expenseData.title - Title
 * @param {number} expenseData.amount - Amount
 * @param {string} expenseData.category - Category
 * @param {string} expenseData.payment_method - Payment method (Cash/Bank)
 * @param {string} expenseData.note - Optional note
 * @param {string} expenseData.date - Date (ISO format)
 * @returns {Promise<Object>} Created expense entry
 */
export const createExpense = async (expenseData) => {
  const response = await apiClient.post(`${EXPENSE_ENDPOINT}/`, expenseData);
  return response.data;
};

/**
 * Get all expense entries for the authenticated user
 * @returns {Promise<Array>} List of expense entries
 */
export const getAllExpenses = async () => {
  const response = await apiClient.get(`${EXPENSE_ENDPOINT}/`);
  return response.data;
};

/**
 * Get a specific expense entry by ID
 * @param {string} id - Expense ID
 * @returns {Promise<Object>} Expense entry
 */
export const getExpenseById = async (id) => {
  const response = await apiClient.get(`${EXPENSE_ENDPOINT}/${id}`);
  return response.data;
};

/**
 * Update an expense entry
 * @param {string} id - Expense ID
 * @param {Object} expenseData - Updated expense data
 * @returns {Promise<Object>} Updated expense entry
 */
export const updateExpense = async (id, expenseData) => {
  const response = await apiClient.put(`${EXPENSE_ENDPOINT}/${id}`, expenseData);
  return response.data;
};

/**
 * Delete an expense entry
 * @param {string} id - Expense ID
 * @returns {Promise<void>}
 */
export const deleteExpense = async (id) => {
  await apiClient.delete(`${EXPENSE_ENDPOINT}/${id}`);
};
