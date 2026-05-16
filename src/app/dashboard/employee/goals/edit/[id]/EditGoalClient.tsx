'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const THRUST_AREAS = [
  'Revenue Growth', 'Cost Optimization', 'Customer Satisfaction',
  'People Development', 'Process Improvement', 'Innovation',
  'Compliance & Risk', 'Digital Transformation'
]

const UOM_TYPES = [
  { value: 'numeric_min', label: 'Numeric (Higher is better)' },
  { value: 'numeric_max', label: 'Numeric (Lower is better)' },
  { value: 'timeline', label: 'Timeline (Date-based)' },
  { value: 'zero', label: 'Zero-based (0 = Success)' },
]

export default function EditGoalClient({ goal }: { goal: any }) {
  const [title, setTitle] = useState(goal.title)
  const [description, setDescription] = useState(goal.description ?? '')
  const [thrustArea, setThrustArea] = useState(goal.thrust_area)
  const [uomType, setUomType] = useState(goal.uom_type)
  const [target, setTarget] = useState(String(goal.target))
  const [weightage, setWeightage] = useState(String(goal.weightage))
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleResubmit = async () => {
    if (!title.trim()) return setError('Title is required')
    const w = parseFloat(weightage)
    if (isNaN(w) || w < 10) return setError('Weightage must be at least 10%')
    if (!target.trim()) return setError('Target is required')

    setSaving(true)
    setError('')

    await supabase.from('goals').update({
      title: title.trim(),
      description: description.trim(),
      thrust_area: thrustArea,
      uom_type: uomType,
      target: parseFloat(target),
      weightage: w,
      status: 'submitted'
    }).eq('id', goal.id)

    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('audit_logs').insert({
      entity_type: 'goal',
      entity_id: goal.id,
      changed_by: user?.id,
      change_description: 'Employee edited and resubmitted rejected goal'
    })

    router.push('/dashboard/employee')
    router.refresh()
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <span className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded-full font-medium">Rejected — Edit & Resubmit</span>
        <h1 className="text-2xl font-bold text-gray-800 mt-3">Edit Goal</h1>
        <p className="text-gray-500 text-sm mt-1">Fix the goal and resubmit for manager approval</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Goal Title *</label>
          <input value={title} onChange={e => setTitle(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)}
            rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Thrust Area</label>
            <select value={thrustArea} onChange={e => setThrustArea(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              {THRUST_AREAS.map(a => <option key={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">UoM Type</label>
            <select value={uomType} onChange={e => setUomType(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              {UOM_TYPES.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Target *</label>
            <input type="number" value={target} onChange={e => setTarget(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Weightage % *</label>
            <input type="number" value={weightage} onChange={e => setWeightage(e.target.value)}
              min={10} max={100}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3">{error}</div>
        )}

        <div className="flex gap-3 justify-end pt-2">
          <button onClick={() => router.back()}
            className="px-5 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
            Cancel
          </button>
          <button onClick={handleResubmit} disabled={saving}
            className="px-6 py-2.5 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-60 font-medium">
            {saving ? 'Resubmitting...' : 'Resubmit for Approval'}
          </button>
        </div>
      </div>
    </div>
  )
}