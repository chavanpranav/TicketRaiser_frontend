import { useState } from 'react'
import { registerUserWithInvite } from '../api'
import * as Icons from 'lucide-react'

export function JoinWithInvite({ onAuth, onSwitchToLogin }) {
  const [step, setStep] = useState(0)
  const [inviteCode, setInviteCode] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [department, setDepartment] = useState('')
  const [position, setPosition] = useState('')
  const [bio, setBio] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [address, setAddress] = useState('')
  const [emergencyContact, setEmergencyContact] = useState('')
  const [emergencyPhone, setEmergencyPhone] = useState('')
  const [timezone, setTimezone] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await registerUserWithInvite({
        invite_code: inviteCode.trim().toUpperCase(),
        name, email, password,
        phone: phone || undefined,
        department: department || undefined,
        position: position || undefined,
        bio: bio || undefined,
        date_of_birth: dateOfBirth || undefined,
        address: address || undefined,
        emergency_contact: emergencyContact || undefined,
        emergency_phone: emergencyPhone || undefined,
        timezone: timezone || undefined,
      })
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      if (data.company) localStorage.setItem('company', JSON.stringify(data.company))
      onAuth(data.user, data.company)
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white font-bold text-lg mx-auto mb-3">
            <Icons.UserPlus size={22} />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Join Your Company</h1>
          <p className="text-sm text-gray-400 mt-1">Enter your invite code to create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
          {error && <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg flex items-center gap-2">
            <Icons.AlertCircle size={14} /> {error}
          </div>}

          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Invite Code</label>
            <input type="text" required value={inviteCode} onChange={e => setInviteCode(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 font-mono tracking-wider text-center text-lg"
              placeholder="A1B2C3D4" maxLength={8} />
          </div>

          <div className="space-y-4 border-t border-gray-100 pt-4">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Full Name</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="John Doe" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Email</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="you@company.com" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Password</label>
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Min 6 chars" minLength={6} />
              </div>
            </div>
          </div>

          <details className="border-t border-gray-100 pt-4">
            <summary className="text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer select-none flex items-center gap-1.5">
              <Icons.ChevronDown size={14} /> Profile Details <span className="text-gray-300 font-normal normal-case">(optional)</span>
            </summary>
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Phone</label>
                  <input type="text" value={phone} onChange={e => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="+1 555-0123" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Date of Birth</label>
                  <input type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Department</label>
                  <input type="text" value={department} onChange={e => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Engineering" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Position</label>
                  <input type="text" value={position} onChange={e => setPosition(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Senior Developer" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Timezone</label>
                  <select value={timezone} onChange={e => setTimezone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
                    <option value="">Select timezone</option>
                    <option value="America/New_York">America/New_York (EST)</option>
                    <option value="America/Chicago">America/Chicago (CST)</option>
                    <option value="America/Denver">America/Denver (MST)</option>
                    <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                    <option value="Europe/London">Europe/London (GMT)</option>
                    <option value="Europe/Paris">Europe/Paris (CET)</option>
                    <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                    <option value="Asia/Shanghai">Asia/Shanghai (CST)</option>
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="Australia/Sydney">Australia/Sydney (AEST)</option>
                    <option value="Pacific/Auckland">Pacific/Auckland (NZST)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Emergency Contact</label>
                  <input type="text" value={emergencyContact} onChange={e => setEmergencyContact(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Jane Doe" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Emergency Phone</label>
                  <input type="text" value={emergencyPhone} onChange={e => setEmergencyPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="+1 555-9999" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-gray-500 block mb-1">Address</label>
                  <textarea value={address} onChange={e => setAddress(e.target.value)} rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    placeholder="123 Main St, City, Country" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-gray-500 block mb-1">Bio</label>
                  <textarea value={bio} onChange={e => setBio(e.target.value)} rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    placeholder="Tell us a little about yourself..." />
                </div>
              </div>
            </div>
          </details>

          <button type="submit" disabled={loading}
            className="w-full py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
            {loading && <Icons.Loader size={14} className="animate-spin" />}
            {loading ? 'Joining...' : 'Join Company'}
          </button>

          <p className="text-xs text-gray-400 text-center">
            Already have an account?{' '}
            <button type="button" onClick={onSwitchToLogin} className="text-green-600 hover:underline bg-transparent border-none p-0 text-xs cursor-pointer">Sign in</button>
          </p>
        </form>
      </div>
    </div>
  )
}
