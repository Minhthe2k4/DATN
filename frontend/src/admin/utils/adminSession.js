// Admin session management utilities
export const getAdminSession = () => {
  const session = localStorage.getItem('adminSession');
  return session ? JSON.parse(session) : null;
};

export const setAdminSession = (sessionData) => {
  localStorage.setItem('adminSession', JSON.stringify(sessionData));
};

export const clearAdminSession = () => {
  localStorage.removeItem('adminSession');
};

export const isAdminLoggedIn = () => {
  const session = getAdminSession();
  return session !== null && session.role === 'ADMIN';
};
