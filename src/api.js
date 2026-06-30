const API_BASE = import.meta.env.VITE_API_URL || '';
const API = `${API_BASE}/api`;
export const UPLOADS_BASE = `${API_BASE}/uploads`;

function getHeaders() {
  const headers = { 'Content-Type': 'application/json' }
  const token = localStorage.getItem('token')
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

async function fetchJSON(url, options = {}) {
  const res = await fetch(`${API}${url}`, {
    headers: getHeaders(),
    ...options,
  })
  if (res.status === 401 && !url.startsWith('/auth/')) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
    throw new Error('Unauthorized')
  }
  if (res.status === 403) {
    const body = await res.json().catch(() => ({}))
    if (body.subscriptionStatus) {
      localStorage.setItem('subscriptionBlock', JSON.stringify({
        companyName: body.companyName,
        status: body.subscriptionStatus
      }))
    }
    throw new Error(body.error || `API error: ${res.status}`)
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `API error: ${res.status}`)
  }
  return res.json()
}

export const login = (email, password) => fetchJSON('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
export const register = (data) => fetchJSON('/auth/register', { method: 'POST', body: JSON.stringify(data) })

export const getTickets = (role, userId) => {
  const params = new URLSearchParams()
  if (role && userId) { params.set('role', role); params.set('userId', userId) }
  const qs = params.toString()
  return fetchJSON(`/tickets${qs ? '?' + qs : ''}`)
}
export const getTicket = (id) => fetchJSON(`/tickets/${id}`)
export const createTicket = (data) => fetchJSON('/tickets', { method: 'POST', body: JSON.stringify(data) })
export const updateTicket = (id, data) => fetchJSON(`/tickets/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
export const deleteTicket = (id) => fetchJSON(`/tickets/${id}`, { method: 'DELETE' })

export const getProjects = (role, userId) => {
  const params = new URLSearchParams()
  if (role && userId) { params.set('role', role); params.set('userId', userId) }
  const qs = params.toString()
  return fetchJSON(`/projects${qs ? '?' + qs : ''}`)
}
export const getProject = (id) => fetchJSON(`/projects/${id}`)
export const createProject = (data) => fetchJSON('/projects', { method: 'POST', body: JSON.stringify(data) })
export const updateProject = (id, data) => fetchJSON(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
export const addProjectTeamMember = (projectId, userId) => fetchJSON(`/projects/${projectId}/team`, { method: 'POST', body: JSON.stringify({ user_id: userId }) })
export const removeProjectTeamMember = (projectId, userId) => fetchJSON(`/projects/${projectId}/team/${userId}`, { method: 'DELETE' })
export const addProjectClient = (projectId, companyId) => fetchJSON(`/projects/${projectId}/clients`, { method: 'POST', body: JSON.stringify({ company_id: companyId }) })
export const removeProjectClient = (projectId, companyId) => fetchJSON(`/projects/${projectId}/clients/${companyId}`, { method: 'DELETE' })

export const getUsers = () => fetchJSON('/users')
export const getUser = (id) => fetchJSON(`/users/${id}`)

export const getCompanies = () => fetchJSON('/companies')
export const getCompany = (id) => fetchJSON(`/companies/${id}`)
export const updateCompany = (id, data) => fetchJSON(`/companies/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
export const createCompany = (data) => fetchJSON('/companies', { method: 'POST', body: JSON.stringify(data) })

export const getComments = (ticketId) => fetchJSON(`/comments/ticket/${ticketId}`)
export const addComment = (data) => fetchJSON('/comments', { method: 'POST', body: JSON.stringify(data) })

export const getNotifications = (userId) => fetchJSON(`/notifications/${userId}`)
export const markNotificationRead = (id) => fetchJSON(`/notifications/${id}/read`, { method: 'PATCH' })
export const markAllNotificationsRead = (userId) => fetchJSON(`/notifications/read-all/${userId}`, { method: 'PATCH' })

export const getAttachments = (ticketId) => fetchJSON(`/attachments/ticket/${ticketId}`)
export function uploadAttachment(ticketId, file, userId) {
  const formData = new FormData()
  formData.append('screenshot', file)
  formData.append('uploaded_by', userId)
  const headers = { Authorization: getHeaders().Authorization }
  return fetch(`${API}/attachments/ticket/${ticketId}`, {
    method: 'POST',
    headers,
    body: formData,
  }).then(async (res) => {
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error || 'Upload failed')
    }
    return res.json()
  })
}

export const getPlans = () => fetchJSON('/plans')
export const createPlan = (data) => fetchJSON('/plans', { method: 'POST', body: JSON.stringify(data) })
export const updatePlan = (id, data) => fetchJSON(`/plans/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
export const deletePlan = (id) => fetchJSON(`/plans/${id}`, { method: 'DELETE' })

export const getInvites = (companyId) => fetchJSON(`/invites/company/${companyId}`)
export const createInvite = (data) => fetchJSON('/invites', { method: 'POST', body: JSON.stringify(data) })
export const updateInvite = (id, data) => fetchJSON(`/invites/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
export const deleteInvite = (id) => fetchJSON(`/invites/${id}`, { method: 'DELETE' })

export const registerUserWithInvite = (data) => fetchJSON('/auth/register-user', { method: 'POST', body: JSON.stringify(data) })

export const updateUserProfile = (id, data) => fetchJSON(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) })

export const getTags = (companyId) => fetchJSON(`/tags/company/${companyId}`)
export const createTag = (data) => fetchJSON('/tags', { method: 'POST', body: JSON.stringify(data) })
export const deleteTag = (id) => fetchJSON(`/tags/${id}`, { method: 'DELETE' })
