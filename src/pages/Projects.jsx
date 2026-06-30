import { useState, useEffect, useCallback } from 'react'
import { getProjects, getCompanies, addProjectClient, removeProjectClient, getUsers, addProjectTeamMember, removeProjectTeamMember } from '../api'
import { useRole } from '../data/RoleContext'
import { ROLES } from '../data/mockData'
import { CreateProjectForm } from '../components/CreateProjectForm'
import * as Icons from 'lucide-react'

export function Projects() {
  const { currentRole, currentUser } = useRole()
  const [projects, setProjects] = useState([])
  const [companies, setCompanies] = useState([])
  const [users, setUsers] = useState([])
  const [view, setView] = useState('grid')
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [assignProject, setAssignProject] = useState(null)

  const canManage = currentRole === ROLES.COMPANY_ADMIN || currentRole === ROLES.SAAS_OWNER
  const isCompanyAdmin = currentRole === ROLES.COMPANY_ADMIN

  const loadProjects = useCallback(() => {
    getProjects(currentRole, currentUser.id).then(setProjects).catch(console.error)
  }, [currentRole, currentUser.id])

  const loadCompanies = useCallback(() => {
    getCompanies().then(setCompanies).catch(console.error)
  }, [])

  useEffect(() => {
    loadProjects()
    if (isCompanyAdmin) {
      loadCompanies()
      getUsers().then(setUsers).catch(console.error)
    }
  }, [loadProjects, loadCompanies, isCompanyAdmin])

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Projects</h2>
          <p className="text-sm text-gray-400 mt-1">{projects.length} total projects</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Icons.Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
          </div>
          <div className="flex bg-gray-50 rounded-lg p-1 border border-gray-200">
            <button
              onClick={() => setView('grid')}
              className={`p-1.5 rounded-md ${view === 'grid' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400'}`}
            >
              <Icons.LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-1.5 rounded-md ${view === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400'}`}
            >
              <Icons.List size={16} />
            </button>
          </div>
          {canManage && (
            <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
              <Icons.Plus size={16} />
              New Project
            </button>
          )}
        </div>
      </div>

      {view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(p => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Icons.FolderKanban size={20} className="text-blue-600" />
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  p.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>{p.status}</span>
              </div>

              <h3 className="font-semibold text-gray-900 mb-1">{p.name}</h3>
              <p className="text-sm text-gray-400 mb-4 line-clamp-2">{p.description}</p>

              {(p.clients || []).length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {(p.clients || []).map(c => {
                    const comp = companies.find(comp => comp.id === c.company_id)
                    return (
                      <span key={c.id} className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md" title={c.email}>
                        <Icons.User size={10} />
                        {c.name}{comp ? ` (${comp.name})` : ''}
                      </span>
                    )
                  })}
                </div>
              )}

              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">Progress</span>
                  <span className="font-medium text-gray-700">{p.progress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${p.progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                    style={{ width: `${p.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {(p.team || []).slice(0, 4).map(m => (
                    <img key={m.id} src={m.avatar} alt={m.name} title={m.name}
                      className="w-7 h-7 rounded-full border-2 border-white" />
                  ))}
                  {p.team && p.team.length > 4 && (
                    <div className="w-7 h-7 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs text-gray-500 font-medium">
                      +{p.team.length - 4}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  {isCompanyAdmin && (
                    <button onClick={(e) => { e.stopPropagation(); setAssignProject(p) }}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors">
                      <Icons.User size={14} /> Assign Client
                    </button>
                  )}
                  <span className="flex items-center gap-1"><Icons.Ticket size={14} />{p.ticketCount}</span>
                  <span className="flex items-center gap-1"><Icons.Calendar size={14} />{p.deadline || 'N/A'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 text-xs uppercase border-b border-gray-100">
                <th className="px-5 py-4 font-medium">Project</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium">Progress</th>
                <th className="px-5 py-4 font-medium">Team</th>
                {isCompanyAdmin && <th className="px-5 py-4 font-medium">Client</th>}
                <th className="px-5 py-4 font-medium">Tickets</th>
                <th className="px-5 py-4 font-medium">Deadline</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-medium text-gray-900">{p.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{p.description}</div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      p.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>{p.status}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-gray-100 rounded-full h-2">
                        <div className={`h-2 rounded-full ${p.progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                          style={{ width: `${p.progress}%` }}></div>
                      </div>
                      <span className="text-xs text-gray-500">{p.progress}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex -space-x-2">
                      {(p.team || []).slice(0, 3).map(m => (
                        <img key={m.id} src={m.avatar} alt={m.name} title={m.name}
                          className="w-7 h-7 rounded-full border-2 border-white" />
                      ))}
                    </div>
                  </td>
                  {isCompanyAdmin && (
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        {(p.clients || []).length > 0 ? (
                          (p.clients || []).map(c => {
                            const comp = companies.find(comp => comp.id === c.company_id)
                            return (
                              <span key={c.id} className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded" title={c.email}>
                                {c.name}{comp ? ` (${comp.name})` : ''}
                              </span>
                            )
                          })
                        ) : (
                          <span className="text-xs text-gray-400 italic">None</span>
                        )}
                        <button onClick={() => setAssignProject(p)}
                          className="text-blue-500 hover:text-blue-700 transition-colors" title="Assign to client">
                          <Icons.User size={14} />
                        </button>
                      </div>
                    </td>
                  )}
                  <td className="px-5 py-4 text-gray-500">{p.ticketCount}</td>
                  <td className="px-5 py-4 text-gray-500">{p.deadline || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Icons.FolderKanban size={48} className="mx-auto mb-3 opacity-50" />
          <p className="text-lg font-medium text-gray-500 mb-1">No projects found</p>
          <p className="text-sm">Try adjusting your search</p>
        </div>
      )}

      {showCreate && (
        <CreateProjectForm onClose={() => setShowCreate(false)} onCreated={loadProjects} />
      )}

      {assignProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setAssignProject(null)} />
          <div className="relative bg-white rounded-2xl w-full max-w-xl p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Icons.UserPlus size={20} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Assign Client</h3>
                  <p className="text-sm text-gray-500">{assignProject.name}</p>
                </div>
              </div>
              <button onClick={() => setAssignProject(null)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <Icons.X size={20} />
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Client Contacts</h4>
              <p className="text-xs text-gray-500 mb-3">Select which client contacts get access to this project. Only assigned clients can view and report tickets.</p>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {users.filter(u => u.role === ROLES.CLIENT).map(u => {
                  const isSold = (assignProject.clients || []).some(cc => cc.id === u.id)
                  const userCompany = companies.find(comp => comp.id === u.company_id)
                  return (
                    <div key={u.id}
                      onClick={async () => {
                        try {
                          if (isSold) {
                            await removeProjectTeamMember(assignProject.id, u.id)
                            const otherClients = (assignProject.clients || []).filter(c => c.id !== u.id && c.company_id === u.company_id)
                            if (otherClients.length === 0) {
                              await removeProjectClient(assignProject.id, u.company_id)
                            }
                          } else {
                            await addProjectTeamMember(assignProject.id, u.id)
                            await addProjectClient(assignProject.id, u.company_id)
                          }
                          const updated = await getProjects(currentRole, currentUser.id)
                          setProjects(updated)
                          const updatedProj = updated.find(proj => proj.id === assignProject.id)
                          if (updatedProj) {
                            setAssignProject(updatedProj)
                          }
                        } catch (err) {
                          console.error(err)
                        }
                      }}
                      className={`flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-all ${isSold ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50/30'}`}>
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${isSold ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                        {isSold && <Icons.Check size={12} className="text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">{u.name}</span>
                          {userCompany && (
                            <span className="text-xs text-gray-500">({userCompany.name})</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                          <span>{u.email}</span>
                          {userCompany && (
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                              userCompany.subscription_status === 'Expired' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                            }`}>{userCompany.subscription_status || userCompany.status}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">{(assignProject.clients || []).length} client(s) currently assigned</span>
              <button onClick={() => setAssignProject(null)}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
