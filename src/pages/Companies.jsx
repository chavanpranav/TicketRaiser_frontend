import { useState, useEffect } from 'react'
import { getCompanies, updateCompany, createCompany } from '../api'
import { useRole } from '../data/RoleContext'
import { ROLES } from '../data/mockData'
import * as Icons from 'lucide-react'

function ManageSubscriptionModal({ company, onClose, onSave }) {
  const [plan, setPlan] = useState(company.plan || 'Starter')
  const [subscription, setSubscription] = useState(company.subscription || '$0/mo')
  const [status, setStatus] = useState(company.status || 'Active')
  const [expires, setExpires] = useState(
    company.subscription_expires
      ? new Date(company.subscription_expires).toISOString().split('T')[0]
      : ''
  )
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateCompany(company.id, {
        plan,
        subscription,
        status,
        subscription_expires: expires || null
      })
      onSave()
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Icons.Settings size={20} className="text-indigo-600" />
            Manage Subscription — {company.name}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <Icons.X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
            <select value={plan} onChange={e => setPlan(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Starter</option>
              <option>Pro</option>
              <option>Enterprise</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subscription Price</label>
            <input type="text" value={subscription} onChange={e => setSubscription(e.target.value)}
              placeholder="$99/mo"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Active</option>
              <option>Suspended</option>
              <option>Expired</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subscription Expiry</label>
            <input type="date" value={expires} onChange={e => setExpires(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <p className="text-xs text-gray-400 mt-1">Leave empty for lifetime / no expiry</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
          <button onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2">
            {saving && <Icons.Loader size={14} className="animate-spin" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

function AddCompanyModal({ onClose, onSave }) {
  const [name, setName] = useState('')
  const [plan, setPlan] = useState('Starter')
  const [subscription, setSubscription] = useState('$0/mo')
  const [expires, setExpires] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Company name is required')
      return
    }
    setLoading(true)
    setError('')
    try {
      await createCompany({
        name: name.trim(),
        plan,
        subscription,
        subscription_expires: expires || null
      })
      onSave()
    } catch (err) {
      setError(err.message || 'Failed to create company')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 border border-gray-100" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2.5">
            <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <Icons.Building2 size={18} />
            </div>
            <span>Add New Company</span>
          </h3>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Icons.X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 px-3.5 py-2.5 rounded-xl flex items-center gap-2">
              <Icons.AlertCircle size={15} /> {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Company Name *</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Innovative Labs"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Plan</label>
              <select value={plan} onChange={e => setPlan(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white transition-all">
                <option value="Starter">Starter</option>
                <option value="Pro">Pro</option>
                <option value="Enterprise">Enterprise</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Subscription Price</label>
              <input type="text" value={subscription} onChange={e => setSubscription(e.target.value)}
                placeholder="e.g. $99/mo"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Subscription Expiry Date</label>
            <input type="date" value={expires} onChange={e => setExpires(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
            <p className="text-[11px] text-gray-400 mt-1">Leave empty for lifetime / no expiry date</p>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 transition-all flex items-center gap-2 shadow-md hover:shadow-lg">
              {loading && <Icons.Loader size={14} className="animate-spin" />}
              {loading ? 'Creating...' : 'Create Company'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function Companies() {
  const { currentRole } = useRole()
  const [companies, setCompanies] = useState([])
  const [search, setSearch] = useState('')
  const [manageCompany, setManageCompany] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    loadCompanies()
  }, [])

  const loadCompanies = () => {
    getCompanies().then(setCompanies).catch(console.error)
  }

  const filtered = companies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  const getSubscriptionStatus = (c) => {
    return c.subscription_status || c.status
  }

  const isExpired = (c) => getSubscriptionStatus(c) === 'Expired'
  const isSaasOwner = currentRole === ROLES.SAAS_OWNER

  const statusColor = (c) => {
    const s = getSubscriptionStatus(c)
    if (s === 'Active') return 'bg-green-100 text-green-700'
    if (s === 'Expired') return 'bg-red-100 text-red-700'
    return 'bg-gray-100 text-gray-700'
  }

  const daysRemainingColor = (days) => {
    if (days === null || days === undefined) return 'text-gray-400'
    if (days <= 0) return 'text-red-600'
    if (days <= 7) return 'text-orange-600'
    if (days <= 30) return 'text-yellow-600'
    return 'text-green-600'
  }

  const daysRemainingBg = (days) => {
    if (days === null || days === undefined) return 'bg-gray-50 text-gray-500'
    if (days <= 0) return 'bg-red-50 text-red-700'
    if (days <= 7) return 'bg-orange-50 text-orange-700'
    if (days <= 30) return 'bg-yellow-50 text-yellow-700'
    return 'bg-green-50 text-green-700'
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Companies</h2>
          <p className="text-sm text-gray-400 mt-1">{companies.length} registered companies</p>
        </div>
        {isSaasOwner && (
          <button onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold rounded-xl hover:from-indigo-700 hover:to-violet-700 transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
            <Icons.Plus size={16} /> Add Company
          </button>
        )}
      </div>

      <div className="relative max-w-xs">
        <Icons.Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search companies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(c => {
          const days = c.days_remaining
          const expired = isExpired(c)
          return (
            <div key={c.id} className={`bg-white rounded-xl border p-5 shadow-sm hover:shadow-md transition-shadow ${expired ? 'border-red-200' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center">
                  <Icons.Building2 size={22} className="text-indigo-600" />
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor(c)}`}>
                  {getSubscriptionStatus(c)}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{c.name}</h3>
              <div className="space-y-2 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-2">
                  <Icons.Crown size={14} className="text-gray-400" />
                  <span>{c.plan} Plan</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icons.Users size={14} className="text-gray-400" />
                  <span>{c.users_count} users</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icons.Calendar size={14} className="text-gray-400" />
                  <span>Since {c.since ? new Date(c.since).toISOString().split('T')[0] : 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icons.Clock size={14} className="text-gray-400" />
                  <span>Expires: {c.subscription_expires ? new Date(c.subscription_expires).toISOString().split('T')[0] : 'No expiry'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icons.Hourglass size={14} className="text-gray-400" />
                  <span>Days remaining: <span className={`font-semibold ${daysRemainingColor(days)}`}>{days !== null && days !== undefined ? days : '∞'}</span></span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-sm font-semibold text-gray-900">{c.subscription}</span>
                <div className="flex items-center gap-2">
                  {days !== null && days !== undefined && (
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${daysRemainingBg(days)}`}>
                      {days <= 0 ? 'Overdue' : `${days}d left`}
                    </span>
                  )}
                  {isSaasOwner && (
                    <button onClick={() => setManageCompany(c)}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1">
                      <Icons.Settings size={12} /> Manage
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Icons.Building2 size={48} className="mx-auto mb-3 opacity-50" />
          <p className="text-lg font-medium text-gray-500 mb-1">No companies found</p>
          <p className="text-sm">Try adjusting your search</p>
        </div>
      )}

      {manageCompany && (
        <ManageSubscriptionModal
          company={manageCompany}
          onClose={() => setManageCompany(null)}
          onSave={() => {
            setManageCompany(null)
            loadCompanies()
          }}
        />
      )}

      {showAddModal && (
        <AddCompanyModal
          onClose={() => setShowAddModal(false)}
          onSave={() => {
            setShowAddModal(false)
            loadCompanies()
          }}
        />
      )}
    </div>
  )
}
