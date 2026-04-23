import apiClient from './apiClient';

export const getAllTransactions = async (page = 1, limit = 50, filters = {}) => {
  // Remove empty string / null / undefined values so backend receives clean params
  const cleanedFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, v]) => v !== '' && v !== null && v !== undefined && v !== 0)
  );

  const params = { page, limit, ...cleanedFilters };

  console.log('Fetching transactions with params:', params); // helpful for debugging

  const response = await apiClient.get('/api/transactions/', { params });
  return response.data;
};