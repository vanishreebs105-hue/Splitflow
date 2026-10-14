import api from './client';

// ============ AUTH ============
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  getMySummary: () => api.get('/auth/me/summary'),
  updateProfile: (data) => api.put('/auth/me', data),
  changePassword: (data) => api.put('/auth/me/password', data),
  deleteAccount: (data) => api.delete('/auth/me', { data }),
};

// ============ WORKSPACES ============
export const workspaceAPI = {
  create: (data) => api.post('/workspaces', data),
  getAll: (params) => api.get('/workspaces', { params }),
  getOne: (id) => api.get(`/workspaces/${id}`),
  update: (id, data) => api.put(`/workspaces/${id}`, data),
  archive: (id) => api.patch(`/workspaces/${id}/archive`),
  delete: (id) => api.delete(`/workspaces/${id}`),
  inviteMember: (id, data) => api.post(`/workspaces/${id}/members`, data),
  updateMemberRole: (workspaceId, memberId, role) =>
    api.patch(`/workspaces/${workspaceId}/members/${memberId}`, { role }),
  removeMember: (workspaceId, memberId) =>
    api.delete(`/workspaces/${workspaceId}/members/${memberId}`),
};

// ============ EXPENSES ============
export const expenseAPI = {
  create: (workspaceId, data) => api.post(`/workspaces/${workspaceId}/expenses`, data),
  getAll: (workspaceId, params) =>
    api.get(`/workspaces/${workspaceId}/expenses`, { params }),
  getOne: (workspaceId, expenseId) =>
    api.get(`/workspaces/${workspaceId}/expenses/${expenseId}`),
  update: (workspaceId, expenseId, data) =>
    api.put(`/workspaces/${workspaceId}/expenses/${expenseId}`, data),
  delete: (workspaceId, expenseId) =>
    api.delete(`/workspaces/${workspaceId}/expenses/${expenseId}`),
};

// ============ SETTLEMENTS ============
export const settlementAPI = {
  getBalances: (workspaceId) => api.get(`/workspaces/${workspaceId}/settlements/balances`),
  getSuggestions: (workspaceId) =>
    api.get(`/workspaces/${workspaceId}/settlements/suggestions`),
  create: (workspaceId, data) => api.post(`/workspaces/${workspaceId}/settlements`, data),
  getAll: (workspaceId, params) =>
    api.get(`/workspaces/${workspaceId}/settlements`, { params }),
  delete: (workspaceId, settlementId) =>
    api.delete(`/workspaces/${workspaceId}/settlements/${settlementId}`),
};

// ============ ANALYTICS ============
export const analyticsAPI = {
  overview: (workspaceId) => api.get(`/workspaces/${workspaceId}/analytics/overview`),
  activity: (workspaceId, params) =>
    api.get(`/workspaces/${workspaceId}/analytics/activity`, { params }),
  exportCSV: (workspaceId) =>
    api.get(`/workspaces/${workspaceId}/analytics/export`, { responseType: 'blob' }),
};