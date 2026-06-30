import { useState, useEffect } from 'react'
import { getPlans, createPlan, updatePlan, deletePlan } from '../api'
import * as Icons from 'lucide-react'

function PlanModal({ plan, onClose, onSave }) {
  const [name, setName] = useState(plan?.name || '')
  const [price, setPrice] = useState(plan?.price || '')
  const [durationDays, setDurationDays] = useState(plan?.duration_days || 30)
  const [features, setFeatures] = useState(
    plan?.features ? (Array.isArray(plan.features) ? plan.features.join('\n') : '') : ''
  )
  const [status, setStatus] = useState(plan?.status || 'Active')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!name || !price || !durationDays) return alert('Name, price and duration are required')
    setSaving(true)
    try {
      const featuresArr = features.split('\n').map(f => f.trim()).filter(Boolean)
      const data = { name, price: parseFloat(price), duration_days: parseInt(durationDays), features: featuresArr, status }
      if (plan) {
        await updatePlan(plan.id, data)
      } else {
        await createPlan(data)
      }
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
            <Icons.Crown size={20} className="text-indigo-600" />
            {plan ? 'Edit Plan' : 'Create Plan'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><Icons.X size={20} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Pro Plan"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
              <input type="number" step="0.01" min="0" value={price} onChange={e => setPrice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (days)</label>
              <input type="number" min="1" value={durationDays} onChange={e => setDurationDays(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Features (one per line)</label>
            <textarea value={features} onChange={e => setFeatures(e.target.value)} rows={5} placeholder="Unlimited projects&#10;Priority support&#10;Custom branding"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2">
            {saving && <Icons.Loader size={14} className="animate-spin" />}
            {plan ? 'Save Changes' : 'Create Plan'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function Plans() {
  const [plans, setPlans] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editPlan, setEditPlan] = useState(null)

  useEffect(() => { loadPlans() }, [])

  const loadPlans = () => getPlans().then(setPlans).catch(console.error)

  const handleDelete = async (plan) => {
    if (!confirm(`Delete plan "${plan.name}"?`)) return
    try {
      await deletePlan(plan.id)
      loadPlans()
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Subscription Plans</h2>
          <p className="text-sm text-gray-400 mt-1">{plans.length} plans defined</p>
        </div>
        <button onClick={() => { setEditPlan(null); setShowModal(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
          <Icons.Plus size={16} /> Create Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {plans.map(p => (
          <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center">
                <Icons.Crown size={22} className="text-indigo-600" />
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${p.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {p.status}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 text-lg mb-1">{p.name}</h3>
            <div className="text-2xl font-bold text-gray-900 mb-1">${parseFloat(p.price).toFixed(2)}<span className="text-sm font-normal text-gray-400">/{p.duration_days}d</span></div>
            <p className="text-xs text-gray-400 mb-4">{p.duration_days} days duration</p>
            {Array.isArray(p.features) && p.features.length > 0 && (
              <div className="space-y-2 mb-4">
                {p.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <Icons.Check size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2 pt-3 border-t border-gray-100">
              <button onClick={() => { setEditPlan(p); setShowModal(true) }}
                className="flex-1 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors flex items-center justify-center gap-1">
                <Icons.Edit size={12} /> Edit
              </button>
              <button onClick={() => handleDelete(p)}
                className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-1">
                <Icons.Trash2 size={12} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {plans.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Icons.Crown size={48} className="mx-auto mb-3 opacity-50" />
          <p className="text-lg font-medium text-gray-500 mb-1">No plans yet</p>
          <p className="text-sm">Create your first subscription plan</p>
        </div>
      )}

      {showModal && (
        <PlanModal
          plan={editPlan}
          onClose={() => { setShowModal(false); setEditPlan(null) }}
          onSave={() => { setShowModal(false); setEditPlan(null); loadPlans() }}
        />
      )}
    </div>
  )
}
