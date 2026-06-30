import { useState, useEffect } from 'react'
import { RoleProvider, useRole } from './data/RoleContext'
import { Sidebar } from './components/Sidebar'
import { Header } from './components/Header'
import { Dashboard } from './pages/Dashboard'
import { Projects } from './pages/Projects'
import { Tickets } from './pages/Tickets'
import { Users } from './pages/Users'
import { Companies } from './pages/Companies'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { JoinWithInvite } from './pages/JoinWithInvite'
import { Notifications } from './pages/Notifications'
import { Account } from './pages/Account'
import { Plans } from './pages/Plans'
import { ROLES } from './data/mockData'
import * as Icons from 'lucide-react'

function SubscriptionBanner({ companyName, status }) {
  return (
    <div className="bg-red-500 text-white text-sm text-center py-2 px-4 flex items-center justify-center gap-2">
      <Icons.AlertTriangle size={14} />
      <span><strong>{companyName}</strong>'s subscription is <strong>{status}</strong>. Viewing data only — contact the SaaS owner to renew.</span>
    </div>
  )
}

function AppContent({ onLogout, subscriptionBlock }) {
  const [activeView, setActiveView] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const pages = {
    dashboard: <Dashboard />,
    projects: <Projects />,
    tickets: <Tickets />,
    users: <Users />,
    companies: <Companies />,
    notifications: <Notifications />,
    plans: <Plans />,
    account: <Account />,
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        activeView={activeView}
        onNavigate={setActiveView}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        {subscriptionBlock && (
          <SubscriptionBanner companyName={subscriptionBlock.companyName} status={subscriptionBlock.status} />
        )}
        <Header onLogout={onLogout} onNavigate={setActiveView} />
        <main className="flex-1 overflow-y-auto">
          {pages[activeView] || <Dashboard />}
        </main>
      </div>
    </div>
  )
}

export default function App() {
  const [user, setUser] = useState(null)
  const [authView, setAuthView] = useState('login')
  const [subscriptionBlock, setSubscriptionBlock] = useState(null)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) {
      try {
        const u = JSON.parse(stored)
        setUser(u)

        const block = localStorage.getItem('subscriptionBlock')
        if (block) {
          try {
            const parsed = JSON.parse(block)
            setSubscriptionBlock(parsed)
            return
          } catch { localStorage.removeItem('subscriptionBlock') }
        }

        const companyData = localStorage.getItem('company')
        if (companyData && u.role !== ROLES.SAAS_OWNER && u.company_id) {
          try {
            const company = JSON.parse(companyData)
            const subStatus = company.subscription_status || company.status
            if (subStatus !== 'Active') {
              setSubscriptionBlock({ companyName: company.name, status: subStatus })
            }
          } catch { /* ignore parse error */ }
        }
      } catch { setUser(null) }
    }
  }, [])

  if (!user) {
    const handleAuth = (u, company) => {
      setUser(u)
      if (u.role !== ROLES.SAAS_OWNER && company) {
        const subStatus = company.subscription_status || company.status
        if (subStatus !== 'Active') {
          setSubscriptionBlock({ companyName: company.name, status: subStatus })
        }
      }
    }
    if (authView === 'register') {
      return <Register onAuth={handleAuth} onSwitchToLogin={() => setAuthView('login')} />
    }
    if (authView === 'join') {
      return <JoinWithInvite onAuth={handleAuth} onSwitchToLogin={() => setAuthView('login')} />
    }
    return <Login onAuth={handleAuth} onSwitchToRegister={() => setAuthView('register')} onSwitchToJoin={() => setAuthView('join')} />
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('company')
    localStorage.removeItem('subscriptionBlock')
    setUser(null)
    setSubscriptionBlock(null)
  }

  return (
    <RoleProvider user={user}>
      <AppContent onLogout={handleLogout} subscriptionBlock={subscriptionBlock} />
    </RoleProvider>
  )
}
