import { useState, useEffect, useRef } from 'react'
import { useRole } from '../data/RoleContext'
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../api'
import * as Icons from 'lucide-react'

export function Header({ onLogout, onNavigate }) {
  const { currentUser } = useRole()
  const [notifications, setNotifications] = useState([])
  const [showNotifs, setShowNotifs] = useState(false)
  const notifRef = useRef()

  const unreadCount = notifications.filter(n => !n.is_read).length

  useEffect(() => {
    const handler = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    getNotifications(currentUser.id).then(setNotifications).catch(console.error)
    const interval = setInterval(() => {
      getNotifications(currentUser.id).then(setNotifications).catch(() => {})
    }, 10000)
    return () => clearInterval(interval)
  }, [currentUser.id])

  const handleMarkRead = async (id) => {
    await markNotificationRead(id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
  }

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead(currentUser.id)
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  const roleBadge = {
    saas_owner: 'SaaS Owner',
    company_admin: 'Admin',
    employee: 'Employee',
    client: 'Client',
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">Bug Ticket Manager</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative" ref={notifRef}>
          <button onClick={() => setShowNotifs(!showNotifs)}
            className="relative p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <Icons.Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900">Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                    Mark all read
                  </button>
                )}
              </div>
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-400 text-sm">No notifications</div>
              ) : (
                notifications.slice(0, 5).map(n => (
                  <div key={n.id}
                    className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${!n.is_read ? 'bg-blue-50/50' : ''}`}
                    onClick={() => { handleMarkRead(n.id); onNavigate('notifications') }}>
                    <div className="flex items-start gap-2">
                      <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${!n.is_read ? 'bg-blue-500' : 'bg-transparent'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className={`text-[10px] font-medium px-1 py-0.5 rounded ${
                            n.type === 'ticket_removed' ? 'bg-red-100 text-red-600' :
                            n.type === 'screenshot_added' ? 'bg-teal-100 text-teal-600' :
                            n.type === 'ticket_assigned' ? 'bg-purple-100 text-purple-600' :
                            n.type === 'project_team_added' ? 'bg-indigo-100 text-indigo-600' :
                            n.type === 'project_sold' ? 'bg-emerald-100 text-emerald-600' :
                            n.type === 'project_status_changed' ? 'bg-amber-100 text-amber-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            {n.type === 'ticket_removed' ? 'Removed' :
                             n.type === 'screenshot_added' ? 'Screenshot' :
                             n.type === 'ticket_assigned' ? 'Assigned' :
                             n.type === 'project_team_added' ? 'Team' :
                             n.type === 'project_sold' ? 'Sold' :
                             n.type === 'project_status_changed' ? 'Project' :
                             'Update'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{n.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {n.created_at ? new Date(n.created_at).toLocaleDateString() : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
              {notifications.length > 5 && (
                <div className="px-4 py-2 text-center border-t border-gray-100">
                  <button onClick={() => { setShowNotifs(false); onNavigate('notifications') }}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                    View all ({notifications.length})
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
          <button onClick={() => onNavigate('account')} className="hover:opacity-80 transition-opacity">
            <img src={currentUser.avatar} alt="" className="w-7 h-7 rounded-full bg-gray-200" />
          </button>
          <div className="text-xs">
            <div className="font-medium text-gray-700">{currentUser.name}</div>
            <div className="text-gray-400 flex items-center gap-1">
              {currentUser.email}
              <span className="inline-flex px-1.5 py-0.5 text-[10px] font-medium rounded bg-gray-100 text-gray-500">
                {roleBadge[currentUser.role] || currentUser.role}
              </span>
            </div>
          </div>
        </div>

        <button onClick={onLogout}
          className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 transition-colors" title="Sign out">
          <Icons.LogOut size={16} />
        </button>
      </div>
    </header>
  )
}
