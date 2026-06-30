import { useState, useEffect } from 'react'
import { updateTicket, deleteTicket, getComments, addComment, getUsers, getAttachments, uploadAttachment, getTags, createTag, deleteTag, UPLOADS_BASE } from '../api'
import { useRole } from '../data/RoleContext'
import { TICKET_STATUSES } from '../data/mockData'
import { StatusBadge, PriorityBadge } from './StatusBadge'
import * as Icons from 'lucide-react'

export function TicketDetailModal({ ticket, onClose, onUpdated }) {
  const { currentUser, currentRole, ROLES } = useRole()
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [statusMenu, setStatusMenu] = useState(false)
  const [assignMenu, setAssignMenu] = useState(false)
  const [allUsers, setAllUsers] = useState([])
  const [attachments, setAttachments] = useState([])
  const [uploading, setUploading] = useState(false)
  const [lightbox, setLightbox] = useState(null)

  const [ticketTags, setTicketTags] = useState(ticket.tags || [])
  const [companyTags, setCompanyTags] = useState([])
  const [showTagDropdown, setShowTagDropdown] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState('#6366F1')

  const isEmployee = currentRole === ROLES.EMPLOYEE && ticket.assignee?.id === currentUser.id
  const isAdmin = currentRole === ROLES.COMPANY_ADMIN || currentRole === ROLES.SAAS_OWNER
  const isClient = currentRole === ROLES.CLIENT
  const canChangeStatus = isEmployee
  const canAssign = isAdmin
  const canDelete = isAdmin
  const canComment = !isClient

  const projectTeam = ticket.projectTeam || []

  useEffect(() => {
    getComments(ticket.id).then(setComments).catch(() => setComments([]))
    getAttachments(ticket.id).then(setAttachments).catch(() => setAttachments([]))
  }, [ticket.id])

  useEffect(() => {
    if (currentUser?.company_id) {
      getTags(currentUser.company_id).then(setCompanyTags).catch(console.error)
    }
  }, [currentUser?.company_id])

  const handleToggleTag = async (tagId, isAssigned) => {
    try {
      let nextTagIds = []
      if (isAssigned) {
        nextTagIds = ticketTags.filter(t => t.id !== tagId).map(t => t.id)
      } else {
        nextTagIds = [...ticketTags.map(t => t.id), tagId]
      }
      await updateTicket(ticket.id, { tag_ids: nextTagIds })
      const nextTags = companyTags.filter(t => nextTagIds.includes(t.id))
      setTicketTags(nextTags)
      onUpdated()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return
    try {
      await createTag({
        company_id: currentUser.company_id,
        name: newTagName.trim(),
        color: newTagColor,
      })
      setNewTagName('')
      const updatedTags = await getTags(currentUser.company_id)
      setCompanyTags(updatedTags)
    } catch (err) {
      alert(err.message)
    }
  }

  const handleDeleteTag = async (tagId) => {
    if (!confirm('Delete this tag company-wide? This will unassign it from all tickets.')) return
    try {
      await deleteTag(tagId)
      setTicketTags(ticketTags.filter(t => t.id !== tagId))
      const updatedTags = await getTags(currentUser.company_id)
      setCompanyTags(updatedTags)
      onUpdated()
    } catch (err) {
      alert(err.message)
    }
  }

  useEffect(() => {
    if (isAdmin) getUsers().then(setAllUsers).catch(() => {})
  }, [isAdmin])

  // For company admin: show company employees plus any project team members from other companies
  const assignableUsers = isAdmin && currentRole === ROLES.COMPANY_ADMIN
    ? allUsers.filter(u =>
        u.role === ROLES.EMPLOYEE &&
        (u.company_id === currentUser.company_id || projectTeam.some(pt => pt.id === u.id))
      )
    : projectTeam

  const handleAssign = async (userId) => {
    try {
      await updateTicket(ticket.id, { assignee_id: userId })
      onUpdated()
      onClose()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleStatus = async (status) => {
    try {
      await updateTicket(ticket.id, { status })
      setStatusMenu(false)
      onUpdated()
      onClose()
    } catch (err) {
      alert(err.message)
      setStatusMenu(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this ticket?')) return
    try {
      await deleteTicket(ticket.id)
      onUpdated()
      onClose()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    try {
      await addComment({ ticket_id: ticket.id, author_id: currentUser.id, text: newComment.trim() })
      setNewComment('')
      getComments(ticket.id).then(setComments).catch(() => {})
    } catch (err) {
      alert(err.message)
    }
  }

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      await uploadAttachment(ticket.id, file, currentUser.id)
      getAttachments(ticket.id).then(setAttachments).catch(() => {})
    } catch (err) {
      alert(err.message)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const STATUS_OPTIONS = Object.values(TICKET_STATUSES)

  const currentAssignee = ticket.assignee

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 pb-10">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono bg-gray-100 text-gray-500 px-2 py-1 rounded">{ticket.display_id}</span>
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Icons.X size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-0">
          <div className="col-span-2 p-6 space-y-6 border-r border-gray-100">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">{ticket.title}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{ticket.description}</p>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Icons.Image size={14} />
                Screenshots ({attachments.length})
              </h4>
              {isClient && (
                <div className="mb-3">
                  <label className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg cursor-pointer transition-colors ${uploading ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}>
                    <Icons.Upload size={14} />
                    {uploading ? 'Uploading...' : 'Upload screenshot'}
                    <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
                  </label>
                </div>
              )}
              {attachments.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {attachments.map(a => (
                    <div key={a.id} className="relative group">
                      <img src={`${UPLOADS_BASE}/${a.filename}`} alt={a.original_name}
                        className="w-full h-20 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setLightbox(`${UPLOADS_BASE}/${a.filename}`)} />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-1 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-[10px] text-white truncate">{a.original_name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                !isClient && <p className="text-sm text-gray-400 italic">No screenshots uploaded yet</p>
              )}
            </div>

            {!isClient && (
              <div>
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Comments ({comments.length})
                </h4>
                <div className="space-y-4 mb-4">
                  {comments.map(c => (
                    <div key={c.id} className="flex gap-3">
                      <img src={c.author?.avatar} alt="" className="w-8 h-8 rounded-full flex-shrink-0" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">{c.author?.name}</span>
                          <span className="text-xs text-gray-400">{c.created_at?.split('T')[0]}</span>
                        </div>
                        <p className="text-sm text-gray-600">{c.text}</p>
                      </div>
                    </div>
                  ))}
                  {comments.length === 0 && (
                    <p className="text-sm text-gray-400 italic">No comments yet</p>
                  )}
                </div>
                {canComment && (
                  <div className="flex gap-2">
                    <img src={currentUser.avatar} alt="" className="w-8 h-8 rounded-full flex-shrink-0" />
                    <div className="flex-1 flex gap-2">
                      <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..." className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment() }} />
                      <button onClick={handleAddComment} disabled={!newComment.trim()}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Send</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-6 space-y-5">
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Assignee</h4>
              {currentAssignee ? (
                <div className="flex items-center gap-2 mb-2">
                  <img src={currentAssignee.avatar} alt="" className="w-8 h-8 rounded-full" />
                  <span className="text-sm font-medium text-gray-900">{currentAssignee.name}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                  <Icons.HelpCircle size={16} />
                  <span>Unassigned</span>
                </div>
              )}
              {canAssign && assignableUsers.length > 0 && (
                <div className="relative">
                  <button onClick={() => setAssignMenu(!assignMenu)}
                    className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-500 flex items-center gap-1">
                    <Icons.UserPlus size={12} /> Assign team member
                  </button>
                  {assignMenu && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-40 overflow-y-auto">
                      {assignableUsers.filter(m => m.id !== currentAssignee?.id).map(m => (
                        <button key={m.id} onClick={() => { handleAssign(m.id); setAssignMenu(false) }}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 transition-colors flex items-center gap-2">
                          <img src={m.avatar} alt="" className="w-5 h-5 rounded-full" />
                          <span>{m.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Tags Widget */}
            <div className="border-t border-gray-100 pt-4">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Tags</span>
                {(isAdmin || isEmployee) && (
                  <button onClick={() => setShowTagDropdown(!showTagDropdown)}
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-0.5 text-[10px] font-medium transition-colors cursor-pointer">
                    <Icons.Plus size={10} /> Manage
                  </button>
                )}
              </h4>

              <div className="flex flex-wrap gap-1 mb-2">
                {ticketTags.map(tag => (
                  <span key={tag.id} className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
                    style={{ backgroundColor: `${tag.color}15`, color: tag.color, border: `1px solid ${tag.color}30` }}>
                    {tag.name}
                    {(isAdmin || isEmployee) && (
                      <button onClick={() => handleToggleTag(tag.id, true)} className="hover:opacity-60 cursor-pointer text-gray-400 hover:text-red-500">
                        <Icons.X size={10} />
                      </button>
                    )}
                  </span>
                ))}
                {ticketTags.length === 0 && (
                  <span className="text-xs text-gray-400 italic">No tags assigned</span>
                )}
              </div>

              {showTagDropdown && (
                <div className="relative mt-2 p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-3 shadow-sm z-30">
                  <div className="flex items-center justify-between pb-1.5 border-b border-gray-200">
                    <span className="text-xs font-semibold text-gray-500">Select tags</span>
                    <button onClick={() => setShowTagDropdown(false)} className="text-gray-400 hover:text-gray-600">
                      <Icons.X size={12} />
                    </button>
                  </div>

                  <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
                    {companyTags.map(tag => {
                      const isAssigned = ticketTags.some(t => t.id === tag.id)
                      return (
                        <div key={tag.id} onClick={() => handleToggleTag(tag.id, isAssigned)}
                          className="w-full flex items-center justify-between px-2 py-1 text-xs rounded hover:bg-gray-200/50 transition-colors cursor-pointer">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tag.color }} />
                            <span className="font-medium text-gray-700">{tag.name}</span>
                          </span>
                          <span className="text-[10px] text-gray-400 flex items-center gap-1">
                            {isAssigned ? <Icons.Check size={12} className="text-green-600" /> : <Icons.Plus size={10} />}
                            {isAdmin && (
                              <button type="button" onClick={(e) => { e.stopPropagation(); handleDeleteTag(tag.id) }}
                                className="text-gray-400 hover:text-red-600 p-0.5 ml-1">
                                <Icons.Trash2 size={10} />
                              </button>
                            )}
                          </span>
                        </div>
                      )
                    })}
                    {companyTags.length === 0 && (
                      <p className="text-[11px] text-gray-400 italic text-center py-2">No tags created yet</p>
                    )}
                  </div>

                  {isAdmin && (
                    <div className="pt-2 border-t border-gray-200 space-y-2">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase">Create custom tag</p>
                      <div className="flex gap-1">
                        <input type="text" placeholder="Tag name..." value={newTagName} onChange={(e) => setNewTagName(e.target.value)}
                          className="flex-1 text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white" />
                        <input type="color" value={newTagColor} onChange={(e) => setNewTagColor(e.target.value)}
                          className="w-6 h-6 border border-gray-200 p-0.5 rounded cursor-pointer bg-transparent" />
                        <button type="button" onClick={handleCreateTag} disabled={!newTagName.trim()}
                          className="px-2.5 py-1 bg-blue-600 text-white text-[11px] font-medium rounded hover:bg-blue-700 disabled:opacity-50 transition-colors">Add</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Reporter</h4>
              <div className="flex items-center gap-2">
                <img src={ticket.reporter?.avatar} alt="" className="w-8 h-8 rounded-full" />
                <span className="text-sm font-medium text-gray-900">{ticket.reporter?.name}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Project</h4>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Icons.FolderKanban size={16} className="text-gray-400" />
                <span>{ticket.project?.name}</span>
              </div>
              {projectTeam.length > 0 && (
                <div className="mt-2">
                  <p className="text-[10px] text-gray-400 uppercase mb-1">Project Team</p>
                  <div className="flex -space-x-1.5">
                    {projectTeam.slice(0, 5).map(m => (
                      <img key={m.id} src={m.avatar} alt={m.name} title={m.name}
                        className="w-6 h-6 rounded-full border-2 border-white" />
                    ))}
                    {projectTeam.length > 5 && (
                      <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[9px] text-gray-500">
                        +{projectTeam.length - 5}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Dates</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Icons.Calendar size={14} className="text-gray-400" />
                  <span>Created: {ticket.createdAt?.split('T')[0] || ticket.createdAt}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Icons.Clock size={14} className="text-gray-400" />
                  <span>Updated: {ticket.updatedAt?.split('T')[0] || ticket.updatedAt}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Quick Actions</h4>
              <div className="space-y-2">
                {canChangeStatus && (
                  <div className="relative">
                    <button onClick={() => setStatusMenu(!statusMenu)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-gray-600">
                      <Icons.ArrowRightCircle size={14} /> Change status
                    </button>
                    {statusMenu && (
                      <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
                        {STATUS_OPTIONS.filter(s => s !== ticket.status).map(s => (
                          <button key={s} onClick={() => handleStatus(s)}
                            className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 transition-colors">{s}</button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {canDelete && (
                  <button onClick={handleDelete}
                    className="w-full px-3 py-2 text-sm border border-red-200 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2 text-red-600">
                    <Icons.Trash2 size={14} /> Delete ticket
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="Screenshot" className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl" onClick={e => e.stopPropagation()} />
          <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/40 rounded-full p-2">
            <Icons.X size={24} />
          </button>
        </div>
      )}
    </div>
  )
}
