import axios from 'axios'

const PROD_API_BASE_URL = 'https://annatha-esates-backend-production.up.railway.app/api'
const apiBaseURL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : PROD_API_BASE_URL)

const api = axios.create({
  baseURL: apiBaseURL,
  headers: { 'Content-Type': 'application/json' },
})

// Auth storage helpers — persistent (localStorage, "remember me") or
// session-only (sessionStorage, cleared when the browser closes).
export const authStorage = {
  getToken: () => sessionStorage.getItem('token') || localStorage.getItem('token'),
  getUser: () => sessionStorage.getItem('user') || localStorage.getItem('user'),
  isRemembered: () => localStorage.getItem('remember') === '1',
  set: (token, user, remember) => {
    const store = remember ? localStorage : sessionStorage
    const other = remember ? sessionStorage : localStorage
    store.setItem('token', token)
    store.setItem('user', JSON.stringify(user))
    other.removeItem('token')
    other.removeItem('user')
    localStorage.setItem('remember', remember ? '1' : '0')
  },
  clear: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('remember')
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user')
  },
  // Email prefill (kept across logout for convenience when "remember me" is on)
  getRememberedEmail: () => localStorage.getItem('rememberedEmail') || '',
  setRememberedEmail: (email) => localStorage.setItem('rememberedEmail', email),
  clearRememberedEmail: () => localStorage.removeItem('rememberedEmail'),
}

api.interceptors.request.use((config) => {
  const token = authStorage.getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      authStorage.clear()
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
  changePassword: (data) => api.put('/auth/change-password', data),
}

export const projectsAPI = {
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
}

export const phasesAPI = {
  getAll: (params) => api.get('/phases', { params }),
  getByProject: (projectId) => api.get(`/phases/project/${projectId}`),
  create: (data) => api.post('/phases', data),
  update: (id, data) => api.put(`/phases/${id}`, data),
  delete: (id) => api.delete(`/phases/${id}`),
}

export const plotsAPI = {
  getPublishedLayouts: () => api.get('/plots', { params: { status: 'published' } }),
  getAll: (params) => api.get('/plots', { params }),
  getById: (id) => api.get(`/plots/${id}`),
  create: (data) => api.post('/plots', data),
  update: (id, data) => api.put(`/plots/${id}`, data),
  updateStatus: (id, data) => api.patch(`/plots/${id}/status`, data),
  createBooking: (id, data) => api.patch(`/plots/${id}/book`, data),
  updateBookingStatus: (id, data) => api.patch(`/plots/${id}/booking-status`, data),
  transfer: (id, data) => api.patch(`/plots/${id}/transfer`, data),
  updatePosition: (id, data) => api.patch(`/plots/${id}/position`, data),
  bulkPositions: (updates) => api.patch('/plots/positions/bulk', { updates }),
  delete: (id) => api.delete(`/plots/${id}`),
}

export const employeesAPI = {
  getDropdown: () => api.get('/employees/dropdown'),
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
  convert: (id) => api.post(`/leads/${id}/convert`),
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

export const layoutsAPI = {
  getByPhase: (phaseId, params) => api.get(`/layouts/phase/${phaseId}`, { params }),
  getById: (layoutId) => api.get(`/layouts/${layoutId}`),
  create: (data) => api.post('/layouts', data),
  save: (layoutId, data) => api.put(`/layouts/${layoutId}`, data),
  duplicate: (layoutId) => api.post(`/layouts/${layoutId}/duplicate`),
  delete: (layoutId) => api.delete(`/layouts/${layoutId}`),
  /** @deprecated */
  getByProject: (projectId) => api.get(`/layouts/project/${projectId}`),
  /** @deprecated */
  saveByProject: (projectId, data) => api.put(`/layouts/project/${projectId}`, data),
}

export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
}

export default api
