import { useState } from 'react'
import { login } from '../api'

export function Login({ onAuth, onSwitchToRegister, onSwitchToJoin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await login(email, password)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      if (data.company) {
        localStorage.setItem('company', JSON.stringify(data.company))
      }
      onAuth(data.user, data.company)
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-lg mx-auto mb-3">BT</div>
          <h1 className="text-xl font-bold text-gray-900">Bug Ticket Manager</h1>
          <p className="text-sm text-gray-400 mt-1">Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
          {error && <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</div>}
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@company.com" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="password123" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
          <p className="text-xs text-gray-400 text-center">
            Don't have an account?{' '}
            <button type="button" onClick={onSwitchToRegister} className="text-blue-600 hover:underline bg-transparent border-none p-0 text-xs cursor-pointer">Register Company</button>
          </p>
          <p className="text-xs text-gray-400 text-center -mt-2">
            Have an invite code?{' '}
            <button type="button" onClick={onSwitchToJoin} className="text-green-600 hover:underline bg-transparent border-none p-0 text-xs cursor-pointer">Join Company</button>
          </p>
          <details className="text-xs text-gray-400">
            <summary className="cursor-pointer hover:text-gray-600">Demo accounts (password: password123)</summary>
            <div className="mt-2 space-y-1">
              <div>pranav@bugtracker.com - SaaS Owner</div>
              <div>varad@acmecorp.com - Company Admin</div>
              <div>rahul@acmecorp.com - Employee</div>
              <div>amit@techclient.com - Client</div>
            </div>
          </details>
        </form>
      </div>
    </div>
  )
}
