'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function SharedWeightageClient({ goal }: { goal: any }) {
  const [weightage, setWeightage] = useState(String(goal.weightage))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()
  const router = useRouter()

  const handleSave = async () => {
    const w = parseFloat(weightage)
    if (isNaN(w) || w < 10) return setError('Weightage must be at least 10%')
    if (w > 100) return setError('Weightage cannot exceed 100%')

    setSaving(true)
    await supabase.from('goals').update({ weightage: w }).eq('id', goal.id)
    router.push('/dashboard/employee')
    router.refresh()
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <span className="text-xs bg-purple-100 text-purple-600 px-3 py-1 rounded-full font-medium">Shared Goal</span>
        <h1 className="text-2xl font-bold text-gray-800 mt-3">Adjust Weightage</h1>
        <p className="text-gray-500 text-sm mt-1">You can only adjust the weightage for this shared goal</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
        {/* Read-only fields */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
          <div>
            <p className="text-xs text-gray-400">Goal Title (read-only)</p>
            <p className="text-sm font-medium text-gray-800 mt-0.5">{goal.title}</p>
          </div>
          {goal.description && (
            <div>
              <p className="text-xs text-gray-400">Description (read-only)</p>
              <p className="text-sm text-gray-600 mt-0.5">{goal.description}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4 pt-1">
            <div>
              <p className="text-xs text-gray-400">Target (read-only)</p>
              <p className="text-sm font-medium text-gray-800 mt-0.5">{goal.target}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Thrust Area (read-only)</p>
              <p className="text-sm font-medium text-gray-800 mt-0.5">{goal.thrust_area}</p>
            </div>
          </div>
        </div>

        {/* Editable weightage */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Your Weightage % <span className="text-gray-400">(min 10%)</span>
          </label>
          <input
            type="number" value={weightage}
            onChange={e => setWeightage(e.target.value)}
            min={10} max={100}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3">{error}</div>
        )}

        <div className="flex gap-3 justify-end pt-2">
          <button onClick={() => router.back()}
            className="px-5 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="px-6 py-2.5 text-sm bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition disabled:opacity-60 font-medium">
            {saving ? 'Saving...' : 'Save Weightage'}
          </button>
        </div>
      </div>
    </div>
  )
}