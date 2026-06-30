import * as Icons from 'lucide-react'
import { useRole } from '../data/RoleContext'

export function Sidebar({ activeView, onNavigate, collapsed, onToggle }) {
  const { navItems, currentUser } = useRole()

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-60'} bg-gray-900 text-white flex flex-col transition-all duration-300`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center text-xs font-bold">BT</div>
            <span className="font-semibold text-sm">BugTracker</span>
          </div>
        )}
        <button onClick={onToggle} className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400">
          {collapsed ? <Icons.PanelRight size={18} /> : <Icons.PanelLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 py-3 px-2 space-y-1">
        {navItems.map((item) => {
          const Icon = Icons[item.icon]
          const isActive = activeView === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
              title={collapsed ? item.label : undefined}
            >
              {Icon && <Icon size={18} />}
              {!collapsed && <span>{item.label}</span>}
            </button>
          )
        })}
      </nav>

      <div className="p-3 border-t border-gray-800">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <button onClick={() => onNavigate('account')} className="hover:opacity-80 transition-opacity">
            <img src={currentUser.avatar} alt="" className="w-8 h-8 rounded-full bg-gray-700" />
          </button>
          {!collapsed && (
            <div className="text-xs">
              <button onClick={() => onNavigate('account')} className="font-medium text-white hover:underline text-left">
                {currentUser.name}
              </button>
              <div className="text-gray-400 capitalize">{currentUser.role.replace('_', ' ')}</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
