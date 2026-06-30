import { useState, useEffect } from 'react'
import { createProject, getUsers } from '../api'
import { useRole } from '../data/RoleContext'
import * as Icons from 'lucide-react'

export function CreateProjectForm({ onClose, onCreated }) {
  const { currentUser } = useRole()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [deadline, setDeadline] = useState('')
  const [companyUsers, setCompanyUsers] = useState([])
  const [selectedTeam, setSelectedTeam] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    getUsers().then(all => {
      // Only show employees from the admin's company
      const companyEmployees = all.filter(
        u => u.company_id === currentUser?.company_id &&
        (u.role === 'employee' || u.role === 'company_admin')
      )
      setCompanyUsers(companyEmployees)
    }).catch(() => {})
  }, [currentUser?.company_id])

  const toggleTeamMember = (id) => {
    setSelectedTeam(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) { setError('Project name is required'); return }
    try {
      await createProject({
        name: name.trim(),
        description: description.trim(),
        deadline: deadline || null,
        company_id: currentUser?.company_id || 1,
        team_ids: selectedTeam,
      })
      onCreated()
      onClose()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl border border-gray-200">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-gray-900">Create New Project</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <Icons.X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="My Project" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="What is this project about?" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
            <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Team Members</label>
            <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
              {companyUsers.length === 0 ? (
                <div className="px-3 py-4 text-sm text-gray-400 text-center">No employees available</div>
              ) : companyUsers.map(u => (
                <label key={u.id} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                  <input type="checkbox" checked={selectedTeam.includes(u.id)}
                    onChange={() => toggleTeamMember(u.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <img src={u.avatar} alt="" className="w-7 h-7 rounded-full" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-700">{u.name}</div>
                    <div className="text-xs text-gray-400">{u.role === 'company_admin' ? 'Admin' : 'Employee'}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit"
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">Create Project</button>
          </div>
        </form>
      </div>
    </div>
  )
}
