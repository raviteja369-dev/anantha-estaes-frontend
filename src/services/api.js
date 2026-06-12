import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
}

export const projectsAPI = {
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
}

export const phasesAPI = {
  getByProject: (projectId) => api.get(`/phases/project/${projectId}`),
  create: (data) => api.post('/phases', data),
  update: (id, data) => api.put(`/phases/${id}`, data),
  delete: (id) => api.delete(`/phases/${id}`),
}

export const plotsAPI = {
  getAll: (params) => api.get('/plots', { params }),
  getById: (id) => api.get(`/plots/${id}`),
  create: (data) => api.post('/plots', data),
  update: (id, data) => api.put(`/plots/${id}`, data),
  updateStatus: (id, data) => api.patch(`/plots/${id}/status`, data),
  transfer: (id, data) => api.patch(`/plots/${id}/transfer`, data),
  updatePosition: (id, data) => api.patch(`/plots/${id}/position`, data),
  bulkPositions: (updates) => api.patch('/plots/positions/bulk', { updates }),
  delete: (id) => api.delete(`/plots/${id}`),
}

export const employeesAPI = {
  getAll: () => api.get('/employees'),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
  assignPlots: (id, plotIds) => api.post(`/employees/${id}/assign-plots`, { plotIds }),
  assignCustomers: (id, customerIds) => api.post(`/employees/${id}/assign-customers`, { customerIds }),
  assignLeads: (id, leadIds) => api.post(`/employees/${id}/assign-leads`, { leadIds }),
}

export const customersAPI = {
  getAll: () => api.get('/customers'),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
}

export const paymentsAPI = {
  getAll: () => api.get('/payments'),
  getById: (id) => api.get(`/payments/${id}`),
  create: (data) => api.post('/payments', data),
  addTransaction: (id, data) => api.post(`/payments/${id}/transaction`, data),
  downloadPDF: (id, type) => api.get(`/payments/${id}/pdf/${type}`, { responseType: 'blob' }),
}

export const leadsAPI = {
  getAll: () => api.get('/leads'),
  create: (data) => api.post('/leads', data),
  update: (id, data) => api.put(`/leads/${id}`, data),
  delete: (id) => api.delete(`/leads/${id}`),
}

export const siteVisitsAPI = {
  getAll: () => api.get('/site-visits'),
  create: (data) => api.post('/site-visits', data),
  update: (id, data) => api.put(`/site-visits/${id}`, data),
}

export const reportsAPI = {
  dashboard: () => api.get('/reports/dashboard'),
  revenue: () => api.get('/reports/revenue'),
  employeePerformance: () => api.get('/reports/employee-performance'),
  employeeDashboard: () => api.get('/reports/employee-dashboard'),
}

export default api
