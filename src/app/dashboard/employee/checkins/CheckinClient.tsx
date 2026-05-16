'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4']

const STATUS_OPTIONS = [
  { value: 'not_started', label: '⚪ Not Started' },
  { value: 'on_track', label: '🟡 On Track' },
  { value: 'completed', label: '🟢 Completed' },
]

function computeScore(uom_type: string, target: number, actual: number): number {
  if (!actual || !target) return 0
  switch (uom_type) {
    case 'numeric_min': return Math.min((actual / target) * 100, 100)
    case 'numeric_max': return Math.min((target / actual) * 100, 100)
    case 'zero': return actual === 0 ? 100 : 0
    case 'timeline': return actual <= target ? 100 : Math.max(0, 100 - ((actual - target) / target) * 100)
    default: return 0
  }
}

interface Goal {
  id: string
  title: string
  thrust_area: string
  uom_type: string
  target: number
  weightage: number
  status: string
}

interface Checkin {
  id: string
  goal_id: string
  quarter: string
  actual_achievement: number
  progress_status: string
  manager_comment: string
}

export default function CheckinClient({ goals, existingCheckins }: {
  goals: Goal[]
  existingCheckins: Checkin[]
}) {
  const [activeQuarter, setActiveQuarter] = useState('Q1')
  const [actuals, setActuals] = useState<Record<string, string>>({})
  const [statuses, setStatuses] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const quarterCheckins = existingCheckins.filter(c => c.quarter === activeQuarter)

  const getExisting = (goalId: string) =>
    quarterCheckins.find(c => c.goal_id === goalId)

  const getActual = (goalId: string) =>
    actuals[goalId] ?? String(getExisting(goalId)?.actual_achievement ?? '')

  const getStatus = (goalId: string) =>
    statuses[goalId] ?? getExisting(goalId)?.progress_status ?? 'not_started'

  const handleSave = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    for (const goal of goals) {
      const actual = parseFloat(getActual(goal.id))
      const status = getStatus(goal.id)
      if (isNaN(actual)) continue

      const existing = getExisting(goal.id)
      if (existing) {
        await supabase.from('checkins').update({
          actual_achievement: actual,
          progress_status: status,
        }).eq('id', existing.id)
      } else {
        await supabase.from('checkins').insert({
          goal_id: goal.id,
          quarter: activeQuarter,
          actual_achievement: actual,
          progress_status: status,
        })
      }
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
    router.refresh()
  }

  const uomLabel: Record<string, string> = {
    numeric_min: 'Higher is better',
    numeric_max: 'Lower is better',
    timeline: 'Timeline (days)',
    zero: 'Zero-based'
  }

  if (goals.length === 0) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20 text-gray-400">
        <p className="text-4xl mb-3">🔒</p>
        <p className="font-medium text-gray-600">No approved goals yet</p>
        <p className="text-sm mt-1">Check-ins are available once your manager approves your goals</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quarterly Check-ins</h1>
        <p className="text-gray-500 text-sm mt-1">Log your actual achievement against each goal</p>
      </div>

      {/* Quarter selector */}
      <div className="flex gap-2 mb-6">
        {QUARTERS.map(q => (
          <button key={q} onClick={() => setActiveQuarter(q)}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition ${activeQuarter === q
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {q}
          </button>
        ))}
      </div>

      {/* Goals */}
      <div className="space-y-4">
        {goals.map(goal => {
          const actual = parseFloat(getActual(goal.id))
          const score = isNaN(actual) ? null : computeScore(goal.uom_type, goal.target, actual)
          const existing = getExisting(goal.id)
          const managerComment = existing?.manager_comment

          return (
            <div key={goal.id} className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-semibold text-gray-800">{goal.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {goal.thrust_area} · {uomLabel[goal.uom_type]} · Target: <strong>{goal.target}</strong> · Weight: <strong>{goal.weightage}%</strong>
                  </p>
                </div>
                {score !== null && (
                  <div className={`text-right shrink-0 ml-4`}>
                    <p className="text-xs text-gray-400">Progress Score</p>
                    <p className={`text-xl font-bold ${score >= 80 ? 'text-green-600' : score >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                      {score.toFixed(0)}%
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Actual Achievement</label>
                  <input
                    type="number"
                    value={getActual(goal.id)}
                    onChange={e => setActuals(a => ({ ...a, [goal.id]: e.target.value }))}
                    placeholder={`Target is ${goal.target}`}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                  <select
                    value={getStatus(goal.id)}
                    onChange={e => setStatuses(s => ({ ...s, [goal.id]: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {STATUS_OPTIONS.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Progress bar */}
              {score !== null && (
                <div className="mt-4">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-400' : 'bg-red-400'}`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Manager comment (read-only) */}
              {managerComment && (
                <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-3">
                  <p className="text-xs font-medium text-blue-700 mb-1">💬 Manager Comment</p>
                  <p className="text-xs text-blue-600">{managerComment}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Save */}
      <div className="mt-6 flex justify-end items-center gap-4">
        {saved && <p className="text-sm text-green-600 font-medium">✓ Saved successfully!</p>}
        <button onClick={handleSave} disabled={saving}
          className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition disabled:opacity-60">
          {saving ? 'Saving...' : `Save ${activeQuarter} Check-in`}
        </button>
      </div>
    </div>
  )
}