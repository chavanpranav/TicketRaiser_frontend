import { createContext, useContext, useEffect, useState } from 'react'
import { roleNavItems, ROLES } from './mockData'

function getStoredUser() {
  try {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

const RoleContext = createContext()

export function RoleProvider({ children, user }) {
  const initial = user || getStoredUser()
  const [currentRole, setCurrentRole] = useState(initial?.role || ROLES.SAAS_OWNER)
  const [currentUser, setCurrentUser] = useState(initial)

  useEffect(() => {
    if (user) {
      setCurrentUser(user)
      setCurrentRole(user.role || ROLES.SAAS_OWNER)
    }
  }, [user])

  const navItems = currentUser ? (roleNavItems[currentRole] || []) : []

  return (
    <RoleContext.Provider value={{ currentRole, currentUser, navItems, ROLES }}>
      {children}
    </RoleContext.Provider>
  )
}

export const useRole = () => useContext(RoleContext)
