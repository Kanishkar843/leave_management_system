const BASE = '/api';

async function request(url: string, options?: RequestInit) {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const api = {
  // Auth
  login: (email: string, password: string) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  // Users
  getUsers: () => request('/users'),
  addUser: (data: any) => request('/users', { method: 'POST', body: JSON.stringify(data) }),

  // Leaves
  getLeaves: () => request('/leaves'),
  getMyLeaves: (userId: string) => request(`/leaves/user/${userId}`),
  getPendingLeaves: (role: string, department: string) => request(`/leaves/pending?role=${role}&department=${department}`),
  applyLeave: (data: any) => request('/leaves', { method: 'POST', body: JSON.stringify(data) }),
  approveLeave: (id: string, data: any) => request(`/leaves/${id}/approve`, { method: 'PUT', body: JSON.stringify(data) }),
  rejectLeave: (id: string, data: any) => request(`/leaves/${id}/reject`, { method: 'PUT', body: JSON.stringify(data) }),

  // Audit
  getAuditLogs: () => request('/audit'),

  // Notifications
  getNotifications: (userId: string) => request(`/notifications/${userId}`),
  markRead: (id: string) => request(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllRead: (userId: string) => request(`/notifications/${userId}/read-all`, { method: 'PUT' }),
};
