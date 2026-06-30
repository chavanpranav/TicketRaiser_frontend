import { useState, useEffect, useCallback } from 'react'
import { getNotifications, markNotificationRead, markAllNotificationsRead, getTicket } from '../api'
import { useRole } from '../data/RoleContext'
import { TicketDetailModal } from '../components/TicketDetailModal'
import * as Icons from 'lucide-react'

export function Notifications() {
  const { currentUser } = useRole()
  const [notifications, setNotifications] = useState([])
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [filter, setFilter] = useState('all')

  const load = useCallback(() => {
    getNotifications(currentUser.id).then(setNotifications).catch(console.error)
  }, [currentUser.id])

  useEffect(() => { load() }, [load])

  const unreadCount = notifications.filter(n => !n.is_read).length

  const handleMarkRead = async (n) => {
    if (!n.is_read) {
      await markNotificationRead(n.id)
      setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, is_read: true } : x))
    }
    if (n.ticket_id) {
      try {
        const t = await getTicket(n.ticket_id)
        setSelectedTicket(t)
      } catch { }
    }
  }

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead(currentUser.id)
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  const filtered = filter === 'all' ? notifications : notifications.filter(n => !n.is_read)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
          <p className="text-sm text-gray-400 mt-1">{unreadCount} unread</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">All</option>
            <option value="unread">Unread</option>
          </select>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
              <Icons.CheckCheck size={16} /> Mark all read
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Icons.BellOff size={48} className="mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium text-gray-500 mb-1">No notifications</p>
            <p className="text-sm">You're all caught up!</p>
          </div>
        ) : (
          filtered.map(n => (
            <div key={n.id}
              onClick={() => handleMarkRead(n)}
              className={`px-6 py-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors flex items-start gap-3 ${!n.is_read ? 'bg-blue-50/40' : ''}`}>
              <div className={`mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0 ${!n.is_read ? 'bg-blue-500' : 'bg-gray-300'}`} />
              <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                      n.type === 'ticket_assigned' ? 'bg-purple-100 text-purple-700' :
                      n.type === 'ticket_removed' ? 'bg-red-100 text-red-700' :
                      n.type === 'screenshot_added' ? 'bg-teal-100 text-teal-700' :
                      n.type === 'project_team_added' ? 'bg-indigo-100 text-indigo-700' :
                      n.type === 'project_sold' ? 'bg-emerald-100 text-emerald-700' :
                      n.type === 'project_status_changed' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {n.type === 'ticket_assigned' ? 'Assigned' :
                       n.type === 'ticket_removed' ? 'Removed' :
                       n.type === 'screenshot_added' ? 'Screenshot' :
                       n.type === 'project_team_added' ? 'Team' :
                       n.type === 'project_sold' ? 'Project Sold' :
                       n.type === 'project_status_changed' ? 'Project Update' :
                       'Status Update'}
                    </span>
                    {n.ticket_id && (
                      <span className="text-xs text-gray-400 font-mono">#{n.ticket_id}</span>
                    )}
                  </div>
                <p className="text-sm text-gray-700">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {n.created_at ? new Date(n.created_at).toLocaleString() : ''}
                </p>
              </div>
              {n.ticket_id && (
                <Icons.ExternalLink size={14} className="text-gray-300 flex-shrink-0 mt-1" />
              )}
            </div>
          ))
        )}
      </div>

      {selectedTicket && (
        <TicketDetailModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} onUpdated={() => { load(); setSelectedTicket(null) }} />
      )}
    </div>
  )
}
