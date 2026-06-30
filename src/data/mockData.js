export const ROLES = {
  SAAS_OWNER: 'saas_owner',
  COMPANY_ADMIN: 'company_admin',
  EMPLOYEE: 'employee',
  CLIENT: 'client',
}

export const TICKET_STATUSES = {
  OPEN: 'OPEN',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN PROGRESS',
  TESTING: 'TESTING',
  DONE: 'DONE',
  CLOSED: 'CLOSED',
  REOPENED: 'REOPENED',
  ON_HOLD: 'ON HOLD',
}

export const PRIORITIES = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
}

export const users = [
  { id: 1, name: 'Pranav Chavan', email: 'pranav@bugtracker.com', role: ROLES.SAAS_OWNER, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pranav', company: 'BugTracker Inc.' },
  { id: 2, name: 'Varad Patil', email: 'varad@acmecorp.com', role: ROLES.COMPANY_ADMIN, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=varad', company: 'Acme Corp' },
  { id: 3, name: 'Rahul Sharma', email: 'rahul@acmecorp.com', role: ROLES.EMPLOYEE, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rahul', company: 'Acme Corp' },
  { id: 4, name: 'Neha Gupta', email: 'neha@acmecorp.com', role: ROLES.EMPLOYEE, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=neha', company: 'Acme Corp' },
  { id: 5, name: 'Amit Singh', email: 'amit@techclient.com', role: ROLES.CLIENT, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=amit', company: 'TechClient Ltd' },
  { id: 6, name: 'Priya Mehta', email: 'priya@designclient.com', role: ROLES.CLIENT, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya', company: 'DesignClient Co' },
  { id: 7, name: 'Vikram Joshi', email: 'vikram@acmecorp.com', role: ROLES.EMPLOYEE, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=vikram', company: 'Acme Corp' },
  { id: 8, name: 'Sneha Reddy', email: 'sneha@acmecorp.com', role: ROLES.EMPLOYEE, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sneha', company: 'Acme Corp' },
  { id: 9, name: 'Arjun Nair', email: 'arjun@techclient.com', role: ROLES.CLIENT, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=arjun', company: 'TechClient Ltd' },
  { id: 10, name: 'Rohan Desai', email: 'rohan@partnerfirm.com', role: ROLES.CLIENT, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rohan', company: 'Partner Firm' },
]

export const projects = [
  { id: 1, name: 'E-Commerce Platform', description: 'Full-stack e-commerce solution with payment integration', progress: 75, status: 'Active', team: [users[2], users[3], users[6]], ticketCount: 23, deadline: '2026-07-15' },
  { id: 2, name: 'Mobile App Redesign', description: 'Complete UI/UX overhaul of mobile application', progress: 45, status: 'Active', team: [users[3], users[7]], ticketCount: 15, deadline: '2026-08-01' },
  { id: 3, name: 'API Gateway Migration', description: 'Migrate legacy APIs to new gateway architecture', progress: 90, status: 'Active', team: [users[2], users[6]], ticketCount: 8, deadline: '2026-06-01' },
  { id: 4, name: 'Customer Portal', description: 'Self-service portal for client ticket management', progress: 30, status: 'Active', team: [users[2], users[3], users[6], users[7]], ticketCount: 12, deadline: '2026-09-15' },
  { id: 5, name: 'Analytics Dashboard', description: 'Real-time analytics and reporting dashboard', progress: 60, status: 'Active', team: [users[6], users[7]], ticketCount: 18, deadline: '2026-07-30' },
  { id: 6, name: 'Legacy System Support', description: 'Maintenance and support for legacy systems', progress: 100, status: 'Completed', team: [users[2]], ticketCount: 5, deadline: '2026-05-01' },
]

export const tickets = [
  { id: 'TKT-101', title: 'Login page returns 500 error on Safari', description: 'Users on Safari browser are experiencing a 500 error when attempting to log in. The issue appears to be related to cookie handling. We need to investigate the session middleware compatibility.', status: TICKET_STATUSES.OPEN, priority: PRIORITIES.CRITICAL, assignee: null, reporter: users[4], project: projects[0], createdAt: '2026-05-28', updatedAt: '2026-05-28', comments: [] },
  { id: 'TKT-102', title: 'Add dark mode support to dashboard', description: 'Implement dark mode toggle and theme switching across all dashboard components. Use CSS variables for theme management.', status: TICKET_STATUSES.ASSIGNED, priority: PRIORITIES.MEDIUM, assignee: users[2], reporter: users[5], project: projects[3], createdAt: '2026-05-25', updatedAt: '2026-05-27', comments: [{ id: 1, author: users[5], text: 'Please prioritize this, our team works late hours.', createdAt: '2026-05-26' }] },
  { id: 'TKT-103', title: 'Payment gateway timeout on checkout', description: 'Transactions are timing out when processing payments through Stripe. Need to review webhook handling and timeout settings.', status: TICKET_STATUSES.IN_PROGRESS, priority: PRIORITIES.HIGH, assignee: users[3], reporter: users[4], project: projects[0], createdAt: '2026-05-22', updatedAt: '2026-05-26', comments: [{ id: 2, author: users[3], text: 'Found the issue - Stripe webhook timeout is set too low. Increasing to 30s.', createdAt: '2026-05-26' }] },
  { id: 'TKT-104', title: 'User avatar upload not working', description: 'Users cannot upload profile pictures. The file upload component fails silently for images over 2MB.', status: TICKET_STATUSES.TESTING, priority: PRIORITIES.MEDIUM, assignee: users[6], reporter: users[4], project: projects[0], createdAt: '2026-05-20', updatedAt: '2026-05-25', comments: [{ id: 3, author: users[6], text: 'Fixed the file size validation. Ready for QA.', createdAt: '2026-05-25' }] },
  { id: 'TKT-105', title: 'Mobile navigation broken on iOS', description: 'The hamburger menu does not open on iOS devices. Touch event handling needs investigation.', status: TICKET_STATUSES.OPEN, priority: PRIORITIES.HIGH, assignee: null, reporter: users[7], project: projects[1], createdAt: '2026-05-27', updatedAt: '2026-05-27', comments: [] },
  { id: 'TKT-106', title: 'Export to PDF generates blank pages', description: 'When exporting reports to PDF, some pages come out blank. Issue seems to be with the print media CSS.', status: TICKET_STATUSES.ASSIGNED, priority: PRIORITIES.LOW, assignee: users[7], reporter: users[5], project: projects[4], createdAt: '2026-05-24', updatedAt: '2026-05-26', comments: [] },
  { id: 'TKT-107', title: 'Database connection pool exhaustion', description: 'Production database is hitting connection pool limits during peak hours. Need to implement connection pooling optimization.', status: TICKET_STATUSES.IN_PROGRESS, priority: PRIORITIES.CRITICAL, assignee: users[2], reporter: users[6], project: projects[2], createdAt: '2026-05-21', updatedAt: '2026-05-27', comments: [{ id: 4, author: users[2], text: 'Working on migrating to PgBouncer for connection pooling.', createdAt: '2026-05-27' }] },
  { id: 'TKT-108', title: 'Search results not sorting by relevance', description: 'Search functionality returns results in arbitrary order. Need to implement proper relevance scoring.', status: TICKET_STATUSES.DONE, priority: PRIORITIES.MEDIUM, assignee: users[6], reporter: users[3], project: projects[4], createdAt: '2026-05-18', updatedAt: '2026-05-24', comments: [{ id: 5, author: users[6], text: 'Implemented TF-IDF scoring. Results now ordered by relevance.', createdAt: '2026-05-24' }] },
  { id: 'TKT-109', title: 'Two-factor authentication setup flow', description: 'Implement 2FA setup flow with QR code generation and backup codes.', status: TICKET_STATUSES.OPEN, priority: PRIORITIES.HIGH, assignee: null, reporter: users[8], project: projects[3], createdAt: '2026-05-29', updatedAt: '2026-05-29', comments: [] },
  { id: 'TKT-110', title: 'Email notification delays in production', description: 'Transactional emails are being delayed by up to 30 minutes. Need to investigate the email queue worker.', status: TICKET_STATUSES.ON_HOLD, priority: PRIORITIES.MEDIUM, assignee: users[3], reporter: users[4], project: projects[0], createdAt: '2026-05-19', updatedAt: '2026-05-26', comments: [{ id: 6, author: users[3], text: 'Blocked on DevOps team for Redis queue access.', createdAt: '2026-05-26' }] },
  { id: 'TKT-111', title: 'Dashboard charts not rendering in IE11', description: 'Legacy browser support issue - charts using Canvas API fail silently.', status: TICKET_STATUSES.CLOSED, priority: PRIORITIES.LOW, assignee: users[7], reporter: users[9], project: projects[4], createdAt: '2026-05-15', updatedAt: '2026-05-22', comments: [{ id: 7, author: users[7], text: 'IE11 usage is below 0.1%. Closing as won\'t fix.', createdAt: '2026-05-22' }] },
  { id: 'TKT-112', title: 'Real-time sync between devices', description: 'User session should sync across devices in real-time using WebSockets.', status: TICKET_STATUSES.REOPENED, priority: PRIORITIES.MEDIUM, assignee: users[2], reporter: users[5], project: projects[3], createdAt: '2026-05-10', updatedAt: '2026-05-28', comments: [
    { id: 8, author: users[2], text: 'Initial implementation done but needs performance optimization.', createdAt: '2026-05-20' },
    { id: 9, author: users[5], text: 'Still seeing sync delays of 5-10 seconds. Reopening.', createdAt: '2026-05-28' }
  ] },
  { id: 'TKT-113', title: 'API rate limiting for public endpoints', description: 'Implement rate limiting middleware for public API endpoints to prevent abuse.', status: TICKET_STATUSES.ASSIGNED, priority: PRIORITIES.HIGH, assignee: users[6], reporter: users[2], project: projects[2], createdAt: '2026-05-26', updatedAt: '2026-05-28', comments: [] },
  { id: 'TKT-114', title: 'Homepage hero image loading slowly', description: 'The hero image on the homepage takes 5+ seconds to load. Need to optimize and implement lazy loading.', status: TICKET_STATUSES.IN_PROGRESS, priority: PRIORITIES.MEDIUM, assignee: users[7], reporter: users[5], project: projects[1], createdAt: '2026-05-23', updatedAt: '2026-05-27', comments: [{ id: 10, author: users[7], text: 'Converting to WebP format and adding responsive srcset.', createdAt: '2026-05-27' }] },
  { id: 'TKT-115', title: 'User permission cache not invalidating', description: 'When admin updates user permissions, the changes take up to 1 hour to propagate due to cache TTL.', status: TICKET_STATUSES.OPEN, priority: PRIORITIES.HIGH, assignee: null, reporter: users[2], project: projects[3], createdAt: '2026-05-28', updatedAt: '2026-05-28', comments: [] },
]

export const companies = [
  { id: 1, name: 'Acme Corp', plan: 'Enterprise', users: 45, projects: 5, status: 'Active', subscription: '$499/mo', since: '2024-03-01' },
  { id: 2, name: 'TechClient Ltd', plan: 'Pro', users: 12, projects: 2, status: 'Active', subscription: '$199/mo', since: '2024-06-15' },
  { id: 3, name: 'DesignClient Co', plan: 'Starter', users: 8, projects: 1, status: 'Active', subscription: '$99/mo', since: '2025-01-10' },
  { id: 4, name: 'Partner Firm', plan: 'Pro', users: 20, projects: 3, status: 'Suspended', subscription: '$199/mo', since: '2024-09-01' },
]

export const roleNavItems = {
  [ROLES.SAAS_OWNER]: [
    { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { id: 'companies', label: 'Companies', icon: 'Building2' },
    { id: 'plans', label: 'Plans', icon: 'Crown' },
    { id: 'account', label: 'Account', icon: 'Settings' },
  ],
  [ROLES.COMPANY_ADMIN]: [
    { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { id: 'projects', label: 'Projects', icon: 'FolderKanban' },
    { id: 'tickets', label: 'Tickets', icon: 'Ticket' },
    { id: 'users', label: 'Team', icon: 'Users' },
    { id: 'account', label: 'Account', icon: 'Settings' },
  ],
  [ROLES.EMPLOYEE]: [
    { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { id: 'tickets', label: 'My Tickets', icon: 'Ticket' },
    { id: 'projects', label: 'Projects', icon: 'FolderKanban' },
    { id: 'notifications', label: 'Notifications', icon: 'Bell' },
    { id: 'account', label: 'Account', icon: 'Settings' },
  ],
  [ROLES.CLIENT]: [
    { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { id: 'tickets', label: 'My Reports', icon: 'Bug' },
    { id: 'projects', label: 'Projects', icon: 'FolderKanban' },
    { id: 'notifications', label: 'Notifications', icon: 'Bell' },
    { id: 'account', label: 'Account', icon: 'Settings' },
  ],
}

export const getStatusColor = (status) => {
  const colors = {
    [TICKET_STATUSES.OPEN]: 'bg-red-100 text-red-800',
    [TICKET_STATUSES.ASSIGNED]: 'bg-blue-100 text-blue-800',
    [TICKET_STATUSES.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800',
    [TICKET_STATUSES.TESTING]: 'bg-purple-100 text-purple-800',
    [TICKET_STATUSES.DONE]: 'bg-green-100 text-green-800',
    [TICKET_STATUSES.CLOSED]: 'bg-gray-100 text-gray-800',
    [TICKET_STATUSES.REOPENED]: 'bg-orange-100 text-orange-800',
    [TICKET_STATUSES.ON_HOLD]: 'bg-slate-100 text-slate-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export const getPriorityColor = (priority) => {
  const colors = {
    [PRIORITIES.LOW]: 'bg-gray-100 text-gray-600',
    [PRIORITIES.MEDIUM]: 'bg-blue-100 text-blue-700',
    [PRIORITIES.HIGH]: 'bg-orange-100 text-orange-700',
    [PRIORITIES.CRITICAL]: 'bg-red-100 text-red-700',
  }
  return colors[priority] || 'bg-gray-100 text-gray-600'
}
