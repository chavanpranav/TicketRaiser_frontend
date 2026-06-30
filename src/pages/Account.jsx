import { useState, useEffect } from 'react'
import { useRole } from '../data/RoleContext'
import { getUser, updateUserProfile } from '../api'
import * as Icons from 'lucide-react'

const TIMEZONES = [
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Moscow',
  'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Kolkata', 'Asia/Dubai', 'Asia/Singapore',
  'Australia/Sydney', 'Pacific/Auckland', 'Africa/Cairo', 'America/Sao_Paulo',
]

function SkillsInput({ value, onChange }) {
  const [input, setInput] = useState('')
  const skills = Array.isArray(value) ? value : []

  const add = () => {
    const trimmed = input.trim()
    if (trimmed && !skills.includes(trimmed)) {
      onChange([...skills, trimmed])
    }
    setInput('')
  }

  const remove = (skill) => {
    onChange(skills.filter(s => s !== skill))
  }

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <input type="text" value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          placeholder="Type and press Enter"
          className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <button type="button" onClick={add}
          className="px-3 py-2 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">Add</button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {skills.map(skill => (
          <span key={skill} className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-md">
            {skill}
            <button type="button" onClick={() => remove(skill)} className="hover:text-red-500">
              <Icons.X size={12} />
            </button>
          </span>
        ))}
      </div>
    </div>
  )
}

export function Account() {
  const { currentUser, currentRole } = useRole()
  const [userData, setUserData] = useState(null)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [department, setDepartment] = useState('')
  const [position, setPosition] = useState('')
  const [bio, setBio] = useState('')
  const [skills, setSkills] = useState([])
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [address, setAddress] = useState('')
  const [emergencyContact, setEmergencyContact] = useState('')
  const [emergencyPhone, setEmergencyPhone] = useState('')
  const [timezone, setTimezone] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [pwForm, setPwForm] = useState(false)
  const [oldPw, setOldPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [pwMsg, setPwMsg] = useState('')

  const loadUser = () => {
    getUser(currentUser.id).then(u => {
      const s = typeof u.skills === 'string' ? JSON.parse(u.skills) : (u.skills || [])
      setUserData(u)
      setName(u.name)
      setEmail(u.email)
      setPhone(u.phone || '')
      setDepartment(u.department || '')
      setPosition(u.position || '')
      setBio(u.bio || '')
      setSkills(Array.isArray(s) ? s : [])
      setDateOfBirth(u.date_of_birth ? u.date_of_birth.split('T')[0] : '')
      setAddress(u.address || '')
      setEmergencyContact(u.emergency_contact || '')
      setEmergencyPhone(u.emergency_phone || '')
      setTimezone(u.timezone || '')
    }).catch(() => {})
  }

  useEffect(() => { loadUser() }, [currentUser.id])

  const handleEdit = () => {
    setEditing(true)
    loadUser()
  }

  const roleBadge = {
    saas_owner: 'SaaS Owner',
    company_admin: 'Company Admin',
    employee: 'Employee',
    client: 'Client',
  }

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    setMessage('')
    try {
      const body = {
        name: name.trim(), email: email.trim(),
        phone: phone.trim() || null, department: department.trim() || null,
        position: position.trim() || null, bio: bio.trim() || null, skills,
        date_of_birth: dateOfBirth || null, address: address.trim() || null,
        emergency_contact: emergencyContact.trim() || null,
        emergency_phone: emergencyPhone.trim() || null,
        timezone: timezone || null,
      }
      await updateUserProfile(currentUser.id, body)
      const stored = JSON.parse(localStorage.getItem('user') || '{}')
      localStorage.setItem('user', JSON.stringify({ ...stored, ...body }))
      setEditing(false)
      setMessage('Profile updated')
      loadUser()
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (!oldPw || !newPw) { setPwMsg('Both fields required'); return }
    setPwMsg('')
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ userId: currentUser.id, oldPassword: oldPw, newPassword: newPw }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed') }
      setPwMsg('Password changed successfully')
      setOldPw(''); setNewPw(''); setPwForm(false)
      setTimeout(() => setPwMsg(''), 3000)
    } catch (err) {
      setPwMsg(err.message)
    }
  }

  const user = userData || currentUser

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Profile</h2>
        <p className="text-sm text-gray-400 mt-1">Your personal and professional details</p>
      </div>

      {message && (
        <div className={`px-4 py-3 border rounded-lg text-sm flex items-center gap-2 ${
          message.includes('Failed') || message.includes('error') ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'
        }`}>
          <Icons.CheckCircle size={16} /> {message}
        </div>
      )}

      {pwMsg && (
        <div className={`px-4 py-3 border rounded-lg text-sm flex items-center gap-2 ${
          pwMsg.includes('success') ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {pwMsg.includes('success') ? <Icons.CheckCircle size={16} /> : <Icons.AlertCircle size={16} />} {pwMsg}
        </div>
      )}

      {/* Cover & Avatar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 relative">
          {user.cover_photo && (
            <img src={user.cover_photo} alt="" className="w-full h-full object-cover" />
          )}
          <div className="absolute -bottom-10 left-6">
            <img src={user.avatar} alt="" className="w-20 h-20 rounded-full border-4 border-white bg-white shadow-md" />
          </div>
        </div>
        <div className="pt-12 pb-5 px-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">{user.name}</h2>
              <p className="text-sm text-gray-400">{user.email}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                  {roleBadge[currentRole] || currentRole}
                </span>
                {user.department && (
                  <span className="inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                    {user.department}
                  </span>
                )}
                {user.position && (
                  <span className="inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                    {user.position}
                  </span>
                )}
              </div>
            </div>
            {!editing && (
              <button onClick={handleEdit}
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5">
                <Icons.Pencil size={14} /> Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Icons.UserCircle size={16} className="text-gray-400" /> About
          </h3>
        </div>
        <div className="p-6">
          {editing ? (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
                  <input type="text" value={phone} onChange={e => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="+1 555-0123" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Date of Birth</label>
                  <input type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Department</label>
                  <input type="text" value={department} onChange={e => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Engineering" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Position</label>
                  <input type="text" value={position} onChange={e => setPosition(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Senior Developer" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Timezone</label>
                  <select value={timezone} onChange={e => setTimezone(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="">Select timezone</option>
                    {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Emergency Contact</label>
                  <input type="text" value={emergencyContact} onChange={e => setEmergencyContact(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Jane Doe" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Emergency Phone</label>
                  <input type="text" value={emergencyPhone} onChange={e => setEmergencyPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="+1 555-9999" />
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Address</label>
                <textarea value={address} onChange={e => setAddress(e.target.value)} rows={2}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="123 Main St, City, Country" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Bio</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Tell us about yourself..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Skills</label>
                <SkillsInput value={skills} onChange={setSkills} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Cover Photo URL (optional)</label>
                <input type="text" value={userData?.cover_photo || ''} disabled
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-400"
                  placeholder="Cover photo not editable via this form" />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={handleSave} disabled={saving}
                  className="px-5 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2">
                  {saving && <Icons.Loader size={14} className="animate-spin" />}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button onClick={() => setEditing(false)}
                  className="px-5 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Bio */}
              <div>
                <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">
                  {user.bio || <span className="text-gray-300 italic">No bio yet</span>}
                </p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm pt-2 border-t border-gray-100">
                <InfoRow label="Email" value={user.email} icon={<Icons.Mail size={14} />} />
                <InfoRow label="Phone" value={user.phone} icon={<Icons.Phone size={14} />} />
                <InfoRow label="Department" value={user.department} icon={<Icons.Building2 size={14} />} />
                <InfoRow label="Position" value={user.position} icon={<Icons.Briefcase size={14} />} />
                <InfoRow label="Date of Birth" value={user.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString() : null} icon={<Icons.Cake size={14} />} />
                <InfoRow label="Timezone" value={user.timezone} icon={<Icons.Clock size={14} />} />
                <InfoRow label="Emergency Contact" value={user.emergency_contact} icon={<Icons.Heart size={14} />} />
                <InfoRow label="Emergency Phone" value={user.emergency_phone} icon={<Icons.PhoneCall size={14} />} />
              </div>

              {/* Address */}
              {user.address && (
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-start gap-2 text-sm">
                    <Icons.MapPin size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-xs text-gray-400">Address</span>
                      <p className="text-gray-700 mt-0.5">{user.address}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Skills */}
              {user.skills && Array.isArray(user.skills) && user.skills.length > 0 && (
                <div className="pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-400 flex items-center gap-1 mb-2">
                    <Icons.Award size={12} /> Skills
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {user.skills.map(skill => (
                      <span key={skill} className="px-3 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full">{skill}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Last Active */}
              {user.last_active && (
                <div className="pt-2 border-t border-gray-100 flex items-center gap-1.5 text-xs text-gray-400">
                  <Icons.Activity size={12} />
                  Last active: {new Date(user.last_active).toLocaleString()}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Security */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Icons.Lock size={16} className="text-gray-400" /> Security
          </h3>
          {!pwForm && (
            <button onClick={() => setPwForm(true)}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium">Change Password</button>
          )}
        </div>
        <div className="p-6">
          {pwForm ? (
            <div className="space-y-4 max-w-sm">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Current Password</label>
                <input type="password" value={oldPw} onChange={e => setOldPw(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">New Password</label>
                <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex gap-2">
                <button onClick={handleChangePassword}
                  className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">Update Password</button>
                <button onClick={() => { setPwForm(false); setOldPw(''); setNewPw(''); setPwMsg('') }}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">Manage your password and account security.</p>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value, icon }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-gray-400 mt-0.5 flex-shrink-0">{icon}</span>
      <div>
        <span className="text-xs text-gray-400">{label}</span>
        <p className="text-gray-900 mt-0.5">{value || <span className="text-gray-300 italic">Not set</span>}</p>
      </div>
    </div>
  )
}
