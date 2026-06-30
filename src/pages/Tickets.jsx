import { useState, useEffect, useMemo, useCallback } from 'react'
import { getTickets, getTags } from '../api'
import { useRole } from '../data/RoleContext'
import { TICKET_STATUSES, PRIORITIES, ROLES } from '../data/mockData'
import { StatusBadge, PriorityBadge } from '../components/StatusBadge'
import { TicketDetailModal } from '../components/TicketDetailModal'
import { CreateTicketForm } from '../components/CreateTicketForm'
import * as Icons from 'lucide-react'

const STATUS_COLUMNS = [
  TICKET_STATUSES.OPEN, TICKET_STATUSES.ASSIGNED, TICKET_STATUSES.IN_PROGRESS,
  TICKET_STATUSES.TESTING, TICKET_STATUSES.DONE, TICKET_STATUSES.CLOSED,
  TICKET_STATUSES.REOPENED, TICKET_STATUSES.ON_HOLD,
]

export function Tickets() {
  const { currentRole, currentUser } = useRole()
  const [tickets, setTickets] = useState([])
  const [view, setView] = useState('board')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [tagFilter, setTagFilter] = useState('all')
  const [tagsList, setTagsList] = useState([])
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [showCreate, setShowCreate] = useState(false)

  const canCreate = currentRole === ROLES.CLIENT

  const loadTickets = useCallback(() => {
    getTickets(currentRole, currentUser.id).then(setTickets).catch(console.error)
  }, [currentRole, currentUser.id])

  useEffect(() => { loadTickets() }, [loadTickets])

  useEffect(() => {
    if (currentUser?.company_id) {
      getTags(currentUser.company_id).then(setTagsList).catch(console.error)
    }
  }, [currentUser?.company_id])

  const filtered = useMemo(() => {
    return tickets.filter(t => {
      const matchesSearch = (t.title || '').toLowerCase().includes(search.toLowerCase()) ||
        (t.display_id || '').toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === 'all' || t.status === statusFilter
      const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter
      const matchesTag = tagFilter === 'all' || (t.tags && t.tags.some(tag => tag.id === Number(tagFilter)))
      return matchesSearch && matchesStatus && matchesPriority && matchesTag
    })
  }, [tickets, search, statusFilter, priorityFilter, tagFilter])

  const groupedByStatus = useMemo(() => {
    const groups = {}
    STATUS_COLUMNS.forEach(s => { groups[s] = [] })
    filtered.forEach(t => {
      if (groups[t.status]) groups[t.status].push(t)
    })
    return groups
  }, [filtered])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Tickets</h2>
          <p className="text-sm text-gray-400 mt-1">{tickets.length} total tickets</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-50 rounded-lg p-1 border border-gray-200">
            <button onClick={() => setView('board')}
              className={`p-1.5 rounded-md ${view === 'board' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400'}`}>
              <Icons.Columns3 size={16} />
            </button>
            <button onClick={() => setView('list')}
              className={`p-1.5 rounded-md ${view === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400'}`}>
              <Icons.List size={16} />
            </button>
          </div>
          {canCreate && (
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
              <Icons.Plus size={16} /> New Ticket
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Icons.Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search tickets..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">All Status</option>
          {STATUS_COLUMNS.map(s => (<option key={s} value={s}>{s}</option>))}
        </select>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">All Priority</option>
          {Object.values(PRIORITIES).map(p => (<option key={p} value={p}>{p}</option>))}
        </select>
        <select value={tagFilter} onChange={(e) => setTagFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">All Tags</option>
          {tagsList.map(tag => (<option key={tag.id} value={tag.id}>{tag.name}</option>))}
        </select>
        <span className="text-xs text-gray-400">{filtered.length} results</span>
      </div>

      {view === 'board' ? (
        <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: '500px' }}>
          {STATUS_COLUMNS.map(status => {
            const columnTickets = groupedByStatus[status] || []
            return (
              <div key={status} className="flex-shrink-0 w-72 bg-gray-50 rounded-xl p-3">
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={status} />
                    <span className="text-xs text-gray-400 font-medium">{columnTickets.length}</span>
                  </div>
                  <button className="text-gray-300 hover:text-gray-500"><Icons.Plus size={14} /></button>
                </div>
                <div className="space-y-2">
                  {columnTickets.map(ticket => (
                    <div key={ticket.id} onClick={() => setSelectedTicket(ticket)}
                      className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 hover:shadow-md cursor-pointer transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono text-gray-400">{ticket.display_id}</span>
                        <PriorityBadge priority={ticket.priority} />
                      </div>
                      {ticket.tags && ticket.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {ticket.tags.map(tag => (
                            <span key={tag.id} className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-nowrap"
                              style={{ backgroundColor: `${tag.color}15`, color: tag.color, border: `1px solid ${tag.color}30` }}>
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">{ticket.title}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-1.5">
                          {ticket.assignee ? (
                            <img src={ticket.assignee.avatar} alt={ticket.assignee.name}
                              title={ticket.assignee.name} className="w-6 h-6 rounded-full border-2 border-white" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center" title="Unassigned">
                              <Icons.HelpCircle size={10} className="text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-400">{ticket.project?.name}</span>
                          {(ticket.projectTeam || []).length > 0 && (
                            <div className="flex -space-x-1 ml-1" title="Project team">
                              {ticket.projectTeam.slice(0, 3).map(m => (
                                <img key={m.id} src={m.avatar} alt={m.name} title={m.name}
                                  className="w-4 h-4 rounded-full border border-white" />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {columnTickets.length === 0 && (
                    <div className="text-center py-8 text-gray-300 text-xs">
                      <Icons.Inbox size={24} className="mx-auto mb-1 opacity-50" />
                      No tickets
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 text-xs uppercase border-b border-gray-100">
                <th className="px-5 py-4 font-medium">ID</th>
                <th className="px-5 py-4 font-medium">Title</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium">Priority</th>
                <th className="px-5 py-4 font-medium">Assignee</th>
                <th className="px-5 py-4 font-medium">Project</th>
                <th className="px-5 py-4 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id} onClick={() => setSelectedTicket(t)}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer">
                  <td className="px-5 py-4 font-mono text-xs text-gray-400">{t.display_id}</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-1.5">
                      <span className="font-medium text-gray-900">{t.title}</span>
                      {t.tags && t.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {t.tags.map(tag => (
                            <span key={tag.id} className="text-[9px] font-semibold px-1.5 py-0.5 rounded text-nowrap"
                              style={{ backgroundColor: `${tag.color}15`, color: tag.color, border: `1px solid ${tag.color}30` }}>
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4"><StatusBadge status={t.status} /></td>
                  <td className="px-5 py-4"><PriorityBadge priority={t.priority} /></td>
                  <td className="px-5 py-4">
                    {t.assignee ? (
                      <div className="flex items-center gap-2">
                        <img src={t.assignee.avatar} alt="" className="w-6 h-6 rounded-full" />
                        <span className="text-gray-600">{t.assignee.name}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-gray-500">
                    <div className="flex items-center gap-2">
                      <span>{t.project?.name}</span>
                      {(t.projectTeam || []).length > 0 && (
                        <div className="flex -space-x-1">
                          {t.projectTeam.slice(0, 3).map(m => (
                            <img key={m.id} src={m.avatar} alt={m.name} title={m.name}
                              className="w-5 h-5 rounded-full border-2 border-white" />
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-400 text-xs">{t.updatedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <Icons.Inbox size={48} className="mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium text-gray-500 mb-1">No tickets found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          )}
        </div>
      )}

      {selectedTicket && (
        <TicketDetailModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} onUpdated={loadTickets} />
      )}
      {showCreate && (
        <CreateTicketForm onClose={() => setShowCreate(false)} onCreated={loadTickets} />
      )}
    </div>
  )
}
