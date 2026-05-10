import { getAdminSession } from './adminSession';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const adminFetch = async (endpoint, options = {}) => {
  const session = getAdminSession();
  const token = session?.token;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Token hết hạn hoặc không hợp lệ - có thể điều hướng về trang login
    // window.location.href = '/admin/login';
  }

  return response;
};
