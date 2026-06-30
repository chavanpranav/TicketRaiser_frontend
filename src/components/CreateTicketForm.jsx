import { useState, useEffect } from 'react'
import { createTicket, getProjects, getTags } from '../api'
import { useRole } from '../data/RoleContext'
import * as Icons from 'lucide-react'

export function CreateTicketForm({ onClose, onCreated }) {
  const { currentUser, currentRole, ROLES } = useRole()
  const [projects, setProjects] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [projectId, setProjectId] = useState('')
  const [error, setError] = useState('')
  const [companyTags, setCompanyTags] = useState([])
  const [selectedTagIds, setSelectedTagIds] = useState([])

  useEffect(() => {
    getProjects(currentRole, currentUser.id).then(setProjects).catch(console.error)
  }, [currentRole, currentUser.id])

  useEffect(() => {
    if (currentUser?.company_id) {
      getTags(currentUser.company_id).then(setCompanyTags).catch(console.error)
    }
  }, [currentUser?.company_id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) { setError('Title is required'); return }
    if (!projectId) { setError('Project is required'); return }
    try {
      await createTicket({
        title: title.trim(),
        description: description.trim(),
        priority,
        project_id: Number(projectId),
        reporter_id: currentUser?.id,
        tag_ids: selectedTagIds,
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
          <h3 className="text-lg font-semibold text-gray-900">Create New Ticket</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <Icons.X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief summary of the issue" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Detailed description..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project *</label>
              <select value={projectId} onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select project</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>

          {companyTags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tags</label>
              <div className="flex flex-wrap gap-1.5 p-2 border border-gray-100 rounded-lg bg-gray-50/50">
                {companyTags.map(tag => {
                  const isSelected = selectedTagIds.includes(tag.id)
                  return (
                    <button key={tag.id} type="button"
                      onClick={() => {
                        if (isSelected) {
                          setSelectedTagIds(selectedTagIds.filter(id => id !== tag.id))
                        } else {
                          setSelectedTagIds([...selectedTagIds, tag.id])
                        }
                      }}
                      className="text-xs px-2.5 py-1 rounded-full border transition-all font-medium cursor-pointer"
                      style={{
                        backgroundColor: isSelected ? tag.color : 'white',
                        color: isSelected ? 'white' : tag.color,
                        borderColor: tag.color,
                      }}>
                      {tag.name}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit"
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">Create Ticket</button>
          </div>
        </form>
      </div>
    </div>
  )
}
