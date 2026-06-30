import { useState, useEffect, useMemo } from 'react'
import { useRole } from '../data/RoleContext'
import { getTickets, getProjects, getUsers, getCompanies } from '../api'
import { ROLES, TICKET_STATUSES } from '../data/mockData'
import { MetricCard } from '../components/MetricCard'
import { StatusBadge, PriorityBadge } from '../components/StatusBadge'
import * as Icons from 'lucide-react'

function DashboardCharts({ tickets }) {
  const priorityCounts = useMemo(() => {
    const counts = { Low: 0, Medium: 0, High: 0, Critical: 0 }
    tickets.forEach(t => {
      if (counts[t.priority] !== undefined) counts[t.priority]++
    })
    return counts
  }, [tickets])

  const statusCounts = useMemo(() => {
    const counts = {}
    tickets.forEach(t => {
      counts[t.status] = (counts[t.status] || 0) + 1
    })
    return counts
  }, [tickets])

  const trendData = useMemo(() => {
    const data = []
    const dates = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      dates.push(dateStr)
      data.push({
        date: dateStr,
        count: 0,
        label: d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
      })
    }
    tickets.forEach(t => {
      const createdDate = t.createdAt ? t.createdAt.split('T')[0] : null
      const idx = dates.indexOf(createdDate)
      if (idx !== -1) {
        data[idx].count++
      }
    })
    return data
  }, [tickets])

  const avgResolutionTime = useMemo(() => {
    const resolvedTickets = tickets.filter(t => (t.status === 'DONE' || t.status === 'CLOSED') && t.createdAt)
    if (resolvedTickets.length === 0) return 'N/A'
    let totalMs = 0
    resolvedTickets.forEach(t => {
      const created = new Date(t.createdAt)
      const updated = new Date(t.updatedAt || t.createdAt)
      totalMs += (updated - created)
    })
    const avgHours = Math.round(totalMs / (1000 * 60 * 60))
    if (avgHours < 24) return `${avgHours}h`
    const avgDays = (avgHours / 24).toFixed(1)
    return `${avgDays}d`
  }, [tickets])

  const totalTickets = tickets.length

  // Donut chart calculations
  const donutSectors = useMemo(() => {
    const total = Object.values(priorityCounts).reduce((a, b) => a + b, 0)
    if (total === 0) return []
    let currentOffset = 0
    return Object.entries(priorityCounts).map(([priority, count]) => {
      const percentage = (count / total) * 100
      const strokeLength = (percentage / 100) * 251.327
      const strokeOffset = currentOffset
      currentOffset -= strokeLength

      let color = '#9CA3AF'
      if (priority === 'Medium') color = '#3B82F6'
      else if (priority === 'High') color = '#F59E0B'
      else if (priority === 'Critical') color = '#EF4444'

      return { priority, count, strokeLength, strokeOffset, color, percentage }
    })
  }, [priorityCounts])

  // Bar chart calculations
  const standardStatuses = ['OPEN', 'ASSIGNED', 'IN PROGRESS', 'TESTING', 'DONE']
  const displayStatuses = useMemo(() => {
    return standardStatuses.map(status => ({
      status,
      count: statusCounts[status] || 0
    }))
  }, [statusCounts])

  const maxBarCount = useMemo(() => {
    return Math.max(...displayStatuses.map(item => item.count), 1)
  }, [displayStatuses])

  // Line chart path calculations
  const maxTrendCount = useMemo(() => {
    return Math.max(...trendData.map(d => d.count), 1)
  }, [trendData])

  const points = useMemo(() => {
    return trendData.map((d, i) => ({
      x: 35 + i * 40,
      y: 110 - (d.count / maxTrendCount) * 80
    }))
  }, [trendData, maxTrendCount])

  const linePath = useMemo(() => {
    if (points.length === 0) return ''
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  }, [points])

  const fillPath = useMemo(() => {
    if (points.length === 0) return ''
    return `${linePath} L ${points[points.length - 1].x} 110 L ${points[0].x} 110 Z`
  }, [points, linePath])

  if (totalTickets === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 my-6">
      {/* Donut Chart - Priority Distribution */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-1.5">
            <Icons.PieChart size={16} className="text-blue-500" />
            Priority Distribution
          </h3>
          <p className="text-xs text-gray-400 mb-4">Ticket counts grouped by severity</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0 w-28 h-28 mx-auto lg:mx-0">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {donutSectors.length === 0 ? (
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#E5E7EB" strokeWidth="10" />
              ) : (
                <g transform="rotate(-90 50 50)">
                  {donutSectors.map((sector) => (
                    <circle
                      key={sector.priority}
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke={sector.color}
                      strokeWidth="10"
                      strokeDasharray={`${sector.strokeLength} 251.327`}
                      strokeDashoffset={sector.strokeOffset}
                      className="transition-all hover:stroke-[12]"
                    />
                  ))}
                </g>
              )}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-gray-800">{totalTickets}</span>
              <span className="text-[10px] text-gray-400 uppercase">Tickets</span>
            </div>
          </div>
          <div className="flex-1 space-y-1.5">
            {Object.keys(priorityCounts).map(priority => {
              const count = priorityCounts[priority]
              const pct = totalTickets > 0 ? Math.round((count / totalTickets) * 100) : 0
              let color = '#9CA3AF'
              if (priority === 'Medium') color = '#3B82F6'
              else if (priority === 'High') color = '#F59E0B'
              else if (priority === 'Critical') color = '#EF4444'

              return (
                <div key={priority} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-gray-500 font-medium">{priority}</span>
                  </div>
                  <span className="text-gray-800 font-bold">{count} <span className="text-[10px] text-gray-400 font-normal">({pct}%)</span></span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Bar Chart - Status Distribution */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-1.5">
            <Icons.BarChart3 size={16} className="text-blue-500" />
            Status Overview
          </h3>
          <p className="text-xs text-gray-400 mb-4">Tickets grouped by current status</p>
        </div>
        <div className="h-28 w-full">
          <svg viewBox="0 0 300 120" className="w-full h-full">
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#60A5FA" />
              </linearGradient>
            </defs>
            <line x1="20" y1="100" x2="290" y2="100" stroke="#E5E7EB" strokeWidth="1" />
            {displayStatuses.map((item, idx) => {
              const x = 30 + idx * 52
              const barHeight = (item.count / maxBarCount) * 75
              const y = 100 - barHeight
              return (
                <g key={item.status}>
                  <rect
                    x={x}
                    y={y}
                    width={22}
                    height={barHeight}
                    rx="3"
                    fill="url(#barGrad)"
                    className="transition-all duration-300 hover:opacity-85"
                  />
                  {item.count > 0 && (
                    <text x={x + 11} y={y - 4} textAnchor="middle" className="text-[10px] font-bold fill-gray-700">
                      {item.count}
                    </text>
                  )}
                  <text x={x + 11} y="112" textAnchor="middle" className="text-[8px] font-semibold fill-gray-400">
                    {item.status.substring(0, 5)}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>
      </div>

      {/* Line Chart & Performance - Ticket Trend */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
              <Icons.TrendingUp size={16} className="text-blue-500" />
              Weekly Activity
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 flex items-center gap-1">
              <Icons.Clock size={10} /> Avg Resolution: {avgResolutionTime}
            </span>
          </div>
          <p className="text-xs text-gray-400 mb-4">Tickets created in the last 7 days</p>
        </div>
        <div className="h-28 w-full">
          <svg viewBox="0 0 300 120" className="w-full h-full">
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path d={fillPath} fill="url(#areaGrad)" />
            <path d={linePath} fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" />
            {points.map((p, idx) => (
              <g key={idx}>
                <circle cx={p.x} cy={p.y} r="3.5" fill="#8B5CF6" stroke="white" strokeWidth="1.5" />
                {trendData[idx].count > 0 && (
                  <text x={p.x} y={p.y - 6} textAnchor="middle" className="text-[9px] font-bold fill-indigo-700">
                    {trendData[idx].count}
                  </text>
                )}
                <text x={p.x} y="116" textAnchor="middle" className="text-[8px] font-semibold fill-gray-400">
                  {trendData[idx].label.split(' ')[0]}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    </div>
  )
}

function SaasOwnerDashboard({ users, companies }) {
  const metrics = useMemo(() => ({
    totalCompanies: companies.length,
    totalUsers: users.length,
    activeSubscriptions: companies.filter(c => {
      const s = c.subscription_status || c.status
      return s === 'Active'
    }).length,
    expiredSubscriptions: companies.filter(c => {
      const s = c.subscription_status || c.status
      return s === 'Expired'
    }).length,
    expiringSoon: companies.filter(c =>
      c.days_remaining !== null && c.days_remaining !== undefined && c.days_remaining > 0 && c.days_remaining <= 7
    ).length,
    mrr: companies.reduce((sum, c) => {
      const match = String(c.subscription || '$0').match(/\$?(\d+)/)
      return sum + (match ? parseInt(match[1]) : 0)
    }, 0),
  }), [users, companies])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Platform Overview</h2>
        <p className="text-sm text-gray-400 mt-1">SaaS owner dashboard — all companies and subscriptions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={Icons.Building2} label="Companies" value={metrics.totalCompanies} color="bg-indigo-50 text-indigo-600" subtext={`${metrics.activeSubscriptions} active`} />
        <MetricCard icon={Icons.DollarSign} label="Monthly Revenue" value={`$${metrics.mrr}/mo`} color="bg-green-50 text-green-600" />
        <MetricCard icon={Icons.CheckCircle} label="Active Subs" value={metrics.activeSubscriptions} color="bg-green-50 text-green-600" subtext={`${metrics.expiredSubscriptions} expired`} />
        <MetricCard icon={Icons.AlertTriangle} label="Expiring Soon" value={metrics.expiringSoon} color="bg-orange-50 text-orange-600" subtext="Within 7 days" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Subscription Overview</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 text-xs uppercase">
              <th className="pb-3 font-medium">Company</th>
              <th className="pb-3 font-medium">Plan</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Days Left</th>
              <th className="pb-3 font-medium">Revenue</th>
              <th className="pb-3 font-medium">Expires</th>
            </tr>
          </thead>
          <tbody>
            {companies.map(c => {
              const subStatus = c.subscription_status || c.status
              const isExpired = subStatus === 'Expired'
              return (
                <tr key={c.id} className={`border-t border-gray-100 ${isExpired ? 'bg-red-50/50' : ''}`}>
                  <td className="py-3 font-medium text-gray-900">{c.name}</td>
                  <td className="py-3 text-gray-500">{c.plan}</td>
                  <td className="py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${isExpired ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {subStatus}
                    </span>
                  </td>
                  <td className={`py-3 font-medium ${
                    c.days_remaining === null || c.days_remaining === undefined ? 'text-gray-400' :
                    c.days_remaining <= 0 ? 'text-red-600' :
                    c.days_remaining <= 7 ? 'text-orange-600' :
                    c.days_remaining <= 30 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {c.days_remaining !== null && c.days_remaining !== undefined ? `${c.days_remaining}d` : '∞'}
                  </td>
                  <td className="py-3 text-right font-medium text-gray-900">{c.subscription}</td>
                  <td className="py-3 text-gray-500">
                    {c.subscription_expires ? new Date(c.subscription_expires).toISOString().split('T')[0] : 'No expiry'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function CompanyAdminDashboard({ tickets, projects, users, currentUser, companies }) {
  const companyUsers = users.filter(u => u.company_id === currentUser?.company_id)
  const myCompany = companies.find(c => c.id === currentUser?.company_id)

  const metrics = useMemo(() => ({
    openTickets: tickets.filter(t => t.status === TICKET_STATUSES.OPEN).length,
    activeProjects: projects.filter(p => p.status === 'Active').length,
    teamSize: companyUsers.length,
    inProgress: tickets.filter(t => t.status === TICKET_STATUSES.IN_PROGRESS).length,
  }), [tickets, projects, companyUsers])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Company Dashboard</h2>
        <p className="text-sm text-gray-400 mt-1">Acme Corp — manage your team and projects</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={Icons.Ticket} label="Open Tickets" value={metrics.openTickets} color="bg-red-50 text-red-600" subtext="Needs attention" />
        <MetricCard icon={Icons.FolderKanban} label="Active Projects" value={metrics.activeProjects} color="bg-blue-50 text-blue-600" />
        <MetricCard icon={Icons.Users} label="Team Members" value={metrics.teamSize} color="bg-teal-50 text-teal-600" />
        <MetricCard icon={Icons.Loader} label="In Progress" value={metrics.inProgress} color="bg-purple-50 text-purple-600" />
      </div>

      <DashboardCharts tickets={tickets} />

      {myCompany && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Icons.CreditCard size={16} className="text-indigo-600" />
            Subscription Status
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-gray-400 mb-1">Plan</div>
              <div className="font-semibold text-gray-900">{myCompany.plan}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">Status</div>
              <span className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full ${
                myCompany.subscription_status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {myCompany.subscription_status}
              </span>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">Subscription</div>
              <div className="font-semibold text-gray-900">{myCompany.subscription}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">Days Remaining</div>
              <div className={`font-semibold ${
                myCompany.days_remaining === null || myCompany.days_remaining === undefined ? 'text-gray-900' :
                myCompany.days_remaining <= 0 ? 'text-red-600' :
                myCompany.days_remaining <= 7 ? 'text-orange-600' :
                myCompany.days_remaining <= 30 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {myCompany.days_remaining !== null && myCompany.days_remaining !== undefined
                  ? `${myCompany.days_remaining} days`
                  : 'No expiry'}
              </div>
            </div>
          </div>
        </div>
      )}



      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Recent Tickets</h3>
        <div className="space-y-3">
          {tickets.slice(0, 5).map(t => (
            <div key={t.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-gray-400">{t.display_id}</span>
                  <span className="text-sm font-medium text-gray-900 truncate">{t.title}</span>
                </div>
                <div className="text-xs text-gray-400 mt-0.5">{t.project?.name}</div>
              </div>
              <div className="flex items-center gap-2 ml-3">
                <PriorityBadge priority={t.priority} />
                <StatusBadge status={t.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function EmployeeDashboard({ tickets, projects, currentUser }) {
  const myTickets = tickets.filter(t => t.assignee?.id === currentUser.id)

  const metrics = useMemo(() => ({
    assigned: myTickets.length,
    inProgress: myTickets.filter(t => t.status === TICKET_STATUSES.IN_PROGRESS).length,
    done: myTickets.filter(t => t.status === TICKET_STATUSES.DONE).length,
    open: myTickets.filter(t => t.status === TICKET_STATUSES.OPEN || t.status === TICKET_STATUSES.ASSIGNED).length,
  }), [myTickets])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">My Dashboard</h2>
        <p className="text-sm text-gray-400 mt-1">Your assigned tickets and projects</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={Icons.Ticket} label="Assigned to me" value={metrics.assigned} color="bg-blue-50 text-blue-600" />
        <MetricCard icon={Icons.Clock} label="Pending" value={metrics.open} color="bg-orange-50 text-orange-600" subtext="Not started" />
        <MetricCard icon={Icons.Loader} label="In Progress" value={metrics.inProgress} color="bg-purple-50 text-purple-600" />
        <MetricCard icon={Icons.CheckCircle} label="Completed" value={metrics.done} color="bg-green-50 text-green-600" />
      </div>

      <DashboardCharts tickets={myTickets} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">My Assigned Tickets</h3>
          {myTickets.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Icons.Inbox size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No tickets assigned</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myTickets.map(t => (
                <div key={t.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{t.title}</div>
                    <div className="text-xs text-gray-400">{t.display_id} · {t.project?.name}</div>
                  </div>
                  <StatusBadge status={t.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">My Projects</h3>
          {projects.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Icons.FolderKanban size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No projects assigned</p>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{p.name}</div>
                    <div className="text-xs text-gray-400">{p.ticketCount} tickets</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${p.progress}%` }} />
                    </div>
                    <span className="text-xs text-gray-500">{p.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ClientDashboard({ tickets, projects, currentUser }) {
  const myTickets = tickets.filter(t => t.reporter?.id === currentUser.id)

  const metrics = useMemo(() => ({
    total: myTickets.length,
    open: myTickets.filter(t => [TICKET_STATUSES.OPEN, TICKET_STATUSES.ASSIGNED, TICKET_STATUSES.REOPENED].includes(t.status)).length,
    resolved: myTickets.filter(t => [TICKET_STATUSES.DONE, TICKET_STATUSES.CLOSED].includes(t.status)).length,
    inProgress: myTickets.filter(t => [TICKET_STATUSES.IN_PROGRESS, TICKET_STATUSES.TESTING].includes(t.status)).length,
  }), [myTickets])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">My Dashboard</h2>
        <p className="text-sm text-gray-400 mt-1">Your reported bugs and company projects</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={Icons.Bug} label="Total Reports" value={metrics.total} color="bg-blue-50 text-blue-600" />
        <MetricCard icon={Icons.Clock} label="Open" value={metrics.open} color="bg-orange-50 text-orange-600" subtext="Awaiting action" />
        <MetricCard icon={Icons.Loader} label="In Progress" value={metrics.inProgress} color="bg-purple-50 text-purple-600" />
        <MetricCard icon={Icons.CheckCircle} label="Resolved" value={metrics.resolved} color="bg-green-50 text-green-600" />
      </div>

      <DashboardCharts tickets={myTickets} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">My Bug Reports</h3>
          {myTickets.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Icons.Bug size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No reports submitted</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myTickets.map(t => (
                <div key={t.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-gray-400">{t.display_id}</span>
                      <span className="text-sm font-medium text-gray-900 truncate">{t.title}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">{t.project?.name}</div>
                  </div>
                  <StatusBadge status={t.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Company Projects</h3>
          {projects.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Icons.FolderKanban size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No projects available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{p.name}</div>
                    <div className="text-xs text-gray-400">{p.status} · {p.ticketCount} tickets</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${p.progress}%` }} />
                    </div>
                    <span className="text-xs text-gray-500">{p.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function Dashboard() {
  const { currentRole, currentUser } = useRole()
  const [tickets, setTickets] = useState([])
  const [projects, setProjects] = useState([])
  const [users, setUsers] = useState([])
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const isSaasOwner = currentRole === ROLES.SAAS_OWNER
    Promise.all([
      isSaasOwner ? Promise.resolve([]) : getTickets(currentRole, currentUser?.id).catch(() => []),
      isSaasOwner ? Promise.resolve([]) : getProjects(currentRole, currentUser?.id).catch(() => []),
      getUsers().catch(() => []),
      getCompanies().catch(() => []),
    ]).then(([t, p, u, c]) => {
      setTickets(t)
      setProjects(p)
      setUsers(u)
      setCompanies(c)
      setLoading(false)
    })
  }, [currentRole, currentUser?.id])

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-gray-400 text-sm">Loading dashboard...</div>
      </div>
    )
  }

  switch (currentRole) {
    case ROLES.SAAS_OWNER:
      return <div className="p-6"><SaasOwnerDashboard users={users} companies={companies} /></div>
    case ROLES.COMPANY_ADMIN:
      return <div className="p-6"><CompanyAdminDashboard tickets={tickets} projects={projects} users={users} currentUser={currentUser} companies={companies} /></div>
    case ROLES.EMPLOYEE:
      return <div className="p-6"><EmployeeDashboard tickets={tickets} projects={projects} currentUser={currentUser} /></div>
    case ROLES.CLIENT:
      return <div className="p-6"><ClientDashboard tickets={tickets} projects={projects} currentUser={currentUser} /></div>
    default:
      return <div className="p-6"><SaasOwnerDashboard tickets={tickets} projects={projects} users={users} companies={companies} /></div>
  }
}
