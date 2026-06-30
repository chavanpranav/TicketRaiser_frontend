import { useState, useEffect } from 'react'
import { getUsers, getProjects, addProjectTeamMember, removeProjectTeamMember, getInvites, createInvite, updateInvite, deleteInvite } from '../api'
import { useRole } from '../data/RoleContext'
import { ROLES } from '../data/mockData'
import * as Icons from 'lucide-react'

const roleLabels = {
  saas_owner: 'SaaS Owner',
  company_admin: 'Admin',
  employee: 'Employee',
  client: 'Client',
}

const roleColors = {
  saas_owner: 'bg-purple-100 text-purple-700',
  company_admin: 'bg-blue-100 text-blue-700',
  employee: 'bg-green-100 text-green-700',
  client: 'bg-orange-100 text-orange-700',
}

export function Users() {
  const { currentRole, currentUser } = useRole()
  const [users, setUsers] = useState([])
  const [projects, setProjects] = useState([])
  const [invites, setInvites] = useState([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [assignModal, setAssignModal] = useState(null)
  const [inviteModal, setInviteModal] = useState(false)
  const [newInviteRole, setNewInviteRole] = useState('employee')
  const [newInviteMaxUses, setNewInviteMaxUses] = useState(1)
  const [newInviteExpiry, setNewInviteExpiry] = useState('')
  const [inviteResult, setInviteResult] = useState(null)
  const [copied, setCopied] = useState(false)

  const isAdmin = currentRole === ROLES.SAAS_OWNER || currentRole === ROLES.COMPANY_ADMIN
  const companyId = currentUser?.company_id

  useEffect(() => {
    getUsers().then(setUsers).catch(console.error)
    getProjects(currentRole, currentUser?.id).then(setProjects).catch(console.error)
    if (companyId) getInvites(companyId).then(setInvites).catch(() => {})
  }, [currentRole, currentUser?.id, companyId])

  const handleCreateInvite = async (e) => {
    e.preventDefault()
    try {
      const data = await createInvite({
        company_id: companyId,
        role: newInviteRole,
        max_uses: newInviteMaxUses,
        expires_at: newInviteExpiry || null,
      })
      setInviteResult(data)
      const updated = await getInvites(companyId)
      setInvites(updated)
    } catch (err) {
      alert(err.message)
    }
  }

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {})
  }

  const handleToggleInvite = async (id, isActive) => {
    try {
      await updateInvite(id, { is_active: !isActive })
      const updated = await getInvites(companyId)
      setInvites(updated)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteInvite = async (id) => {
    if (!confirm('Delete this invite code?')) return
    try {
      await deleteInvite(id)
      const updated = await getInvites(companyId)
      setInvites(updated)
    } catch (err) {
      console.error(err)
    }
  }

  if (!isAdmin) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <Icons.ShieldAlert size={48} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-500 mb-2">Access Restricted</h3>
          <p className="text-sm text-gray-400">Only admins can view user management.</p>
        </div>
      </div>
    )
  }

  // Company admin sees only their company users; SaaS Owner sees all
  const scopedUsers = currentRole === ROLES.COMPANY_ADMIN
    ? users.filter(u => u.company_id === currentUser?.company_id)
    : users

  const filtered = scopedUsers.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === 'all' || u.role === roleFilter
    return matchesSearch && matchesRole
  })

  const handleAssignProject = async (userId, projectId) => {
    try {
      await addProjectTeamMember(projectId, userId)
      const updated = await getProjects(currentRole, currentUser?.id)
      setProjects(updated)
    } catch (err) {
      console.error(err)
    }
  }

  const handleRemoveProject = async (userId, projectId) => {
    try {
      await removeProjectTeamMember(projectId, userId)
      const updated = await getProjects(currentRole, currentUser?.id)
      setProjects(updated)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Team Members</h2>
          <p className="text-sm text-gray-400 mt-1">{scopedUsers.length} users</p>
        </div>
        {currentRole === ROLES.COMPANY_ADMIN && companyId && (
          <button onClick={() => setInviteModal(true)}
            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
            <Icons.UserPlus size={15} /> Invite
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Icons.Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search users..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">All Roles</option>
          {Object.entries(roleLabels).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 text-xs uppercase border-b border-gray-100">
              <th className="px-5 py-4 font-medium">User</th>
              <th className="px-5 py-4 font-medium">Role</th>
              <th className="px-5 py-4 font-medium">Projects</th>
              <th className="px-5 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => {
              const userProjects = projects.filter(p => p.team?.some(t => t.id === u.id))
              return (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <img src={u.avatar} alt="" className="w-9 h-9 rounded-full bg-gray-100" />
                      <div>
                        <div className="font-medium text-gray-900">{u.name}</div>
                        <div className="text-xs text-gray-400">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${roleColors[u.role]}`}>
                      {roleLabels[u.role]}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1">
                      {userProjects.length === 0 ? (
                        <span className="text-xs text-gray-400 italic">None</span>
                      ) : userProjects.slice(0, 3).map(p => (
                        <span key={p.id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                          {p.name}
                          {currentRole === ROLES.COMPANY_ADMIN && (
                            <button onClick={() => handleRemoveProject(u.id, p.id)}
                              className="hover:text-red-500 ml-0.5" title="Remove from project">
                              <Icons.X size={10} />
                            </button>
                          )}
                        </span>
                      ))}
                      {userProjects.length > 3 && (
                        <span className="text-xs text-gray-400">+{userProjects.length - 3} more</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {(u.role === 'employee' || u.role === 'company_admin') && currentRole === ROLES.COMPANY_ADMIN && (
                        <button onClick={() => setAssignModal(assignModal === u.id ? null : u.id)}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Assign Project">
                          <Icons.FolderKanban size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {assignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setAssignModal(null)} />
          <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Assign Project</h3>
              <button onClick={() => setAssignModal(null)} className="p-1 text-gray-400 hover:text-gray-600">
                <Icons.X size={20} />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-3">
              Assign a project to <strong>{scopedUsers.find(u => u.id === assignModal)?.name}</strong>
            </p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {projects.filter(p => !p.team?.some(t => t.id === assignModal)).map(p => (
                <button key={p.id} onClick={() => { handleAssignProject(assignModal, p.id); setAssignModal(null) }}
                  className="w-full text-left px-3 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center gap-2">
                  <Icons.FolderKanban size={16} className="text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-700">{p.name}</div>
                    <div className="text-xs text-gray-400">{p.status} · {p.progress}%</div>
                  </div>
                </button>
              ))}
              {projects.filter(p => !p.team?.some(t => t.id === assignModal)).length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">Already assigned to all projects</p>
              )}
            </div>
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Icons.Users size={48} className="mx-auto mb-3 opacity-50" />
          <p className="text-lg font-medium text-gray-500 mb-1">No users found</p>
          <p className="text-sm">Try adjusting your search</p>
        </div>
      )}

      {currentRole === ROLES.COMPANY_ADMIN && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Icons.Key size={15} className="text-gray-400" /> Invite Codes
            </h3>
            {copied && <span className="text-xs text-green-600 font-medium">Copied!</span>}
          </div>
          {invites.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-400 text-sm">No invite codes generated yet</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {invites.map(inv => (
                <div key={inv.id} className="px-6 py-3 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <code className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded text-xs font-mono font-bold tracking-wider text-gray-800">
                      {inv.code}
                    </code>
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${inv.role === 'employee' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {roleLabels[inv.role]}
                    </span>
                    <span className="text-xs text-gray-400">
                      {inv.use_count}/{inv.max_uses || '∞'} used
                    </span>
                    {inv.expires_at && (
                      <span className="text-xs text-gray-400">
                        Expires {new Date(inv.expires_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleCopyCode(inv.code)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Copy code">
                      <Icons.Copy size={14} />
                    </button>
                    <button onClick={() => handleToggleInvite(inv.id, inv.is_active)}
                      className={`p-1.5 rounded-lg transition-colors ${inv.is_active ? 'text-green-500 hover:text-red-500 hover:bg-red-50' : 'text-gray-300 hover:text-green-600 hover:bg-green-50'}`}
                      title={inv.is_active ? 'Deactivate' : 'Activate'}>
                      {inv.is_active ? <Icons.CheckCircle size={14} /> : <Icons.XCircle size={14} />}
                    </button>
                    <button onClick={() => handleDeleteInvite(inv.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                      <Icons.Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {inviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => { setInviteModal(false); setInviteResult(null) }} />
          <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Invite Team Member</h3>
              <button onClick={() => { setInviteModal(false); setInviteResult(null) }} className="p-1 text-gray-400 hover:text-gray-600">
                <Icons.X size={20} />
              </button>
            </div>
            {inviteResult ? (
              <div className="text-center py-4 space-y-4">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Icons.CheckCircle size={28} className="text-green-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">Invite Code Generated</p>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">Share this code with the person you're inviting:</p>
                  <p className="text-2xl font-mono font-bold tracking-widest text-green-700">{inviteResult.code}</p>
                </div>
                <p className="text-xs text-gray-400">
                  They can join at the login page using "Join Company"
                </p>
                <button onClick={() => handleCopyCode(inviteResult.code)}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 mx-auto">
                  <Icons.Copy size={14} /> {copied ? 'Copied!' : 'Copy Code'}
                </button>
                <button onClick={() => { setInviteModal(false); setInviteResult(null) }}
                  className="text-sm text-gray-500 hover:text-gray-700 underline mx-auto block">Done</button>
              </div>
            ) : (
              <form onSubmit={handleCreateInvite} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Role</label>
                  <select value={newInviteRole} onChange={e => setNewInviteRole(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
                    <option value="employee">Employee</option>
                    <option value="client">Client</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Max Uses (leave empty for unlimited)</label>
                  <input type="number" value={newInviteMaxUses} onChange={e => setNewInviteMaxUses(Number(e.target.value))} min={1}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Expires At (optional)</label>
                  <input type="date" value={newInviteExpiry} onChange={e => setNewInviteExpiry(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <button type="submit"
                  className="w-full py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors">
                  Generate Invite Code
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
