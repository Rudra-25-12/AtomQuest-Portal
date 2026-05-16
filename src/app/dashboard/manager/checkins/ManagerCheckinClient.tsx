'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4']

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

export default function ManagerCheckinClient({ goals, checkins, teamMembers }: {
  goals: any[], checkins: any[], teamMembers: any[]
}) {
  const [activeQuarter, setActiveQuarter] = useState('Q1')
  const [selectedEmployee, setSelectedEmployee] = useState('all')
  const [comments, setComments] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  const filtered = goals.filter(g =>
    selectedEmployee === 'all' || g.employee_id === selectedEmployee
  )

  const getCheckin = (goalId: string) =>
    checkins.find(c => c.goal_id === goalId && c.quarter === activeQuarter)

  const handleSaveComment = async (goalId: string) => {
    setSaving(goalId)
    const checkin = getCheckin(goalId)
    const comment = comments[goalId] ?? checkin?.manager_comment ?? ''

    if (checkin) {
      await supabase.from('checkins')
        .update({ manager_comment: comment })
        .eq('id', checkin.id)
    }

    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('audit_logs').insert({
      entity_type: 'checkin',
      entity_id: checkin?.id ?? goalId,
      changed_by: user?.id,
      change_description: `Manager added check-in comment for ${activeQuarter}`
    })

    setSaving(null)
    router.refresh()
  }

  // Group by employee
  const grouped = filtered.reduce<Record<string, any[]>>((acc, g) => {
    if (!acc[g.employee_name]) acc[g.employee_name] = []
    acc[g.employee_name].push(g)
    return acc
  }, {})

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Team Check-ins</h1>
        <p className="text-gray-500 text-sm mt-1">Review achievement and add structured feedback</p>
      </div>

      {/* Quarter + Employee filters */}
      <div className="flex gap-2 mb-4">
        {QUARTERS.map(q => (
          <button key={q} onClick={() => setActiveQuarter(q)}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition ${activeQuarter === q ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {q}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        <button onClick={() => setSelectedEmployee('all')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${selectedEmployee === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          All
        </button>
        {teamMembers.map(m => (
          <button key={m.id} onClick={() => setSelectedEmployee(m.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${selectedEmployee === m.id ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {m.name}
          </button>
        ))}
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400">
          <p className="text-4xl mb-3">📊</p>
          <p className="font-medium">No approved goals found</p>
          <p className="text-sm mt-1">Goals need to be approved before check-ins appear</p>
        </div>
      ) : (
        Object.entries(grouped).map(([name, empGoals]) => (
          <div key={name} className="bg-white border border-gray-200 rounded-2xl mb-6 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <p className="font-semibold text-gray-800">{name}</p>
              <p className="text-xs text-gray-500">{empGoals.length} approved goals · {activeQuarter} check-in</p>
            </div>

            <div className="divide-y divide-gray-100">
              {empGoals.map(goal => {
                const checkin = getCheckin(goal.id)
                const score = checkin ? computeScore(goal.uom_type, goal.target, checkin.actual_achievement) : null

                return (
                  <div key={goal.id} className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{goal.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{goal.thrust_area} · Weight: {goal.weightage}%</p>
                      </div>
                      {score !== null && (
                        <div className="text-right">
                          <p className="text-xs text-gray-400">Score</p>
                          <p className={`text-lg font-bold ${score >= 80 ? 'text-green-600' : score >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                            {score.toFixed(0)}%
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Planned vs Actual */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <p className="text-xs text-gray-400">Planned Target</p>
                        <p className="font-bold text-gray-700 mt-0.5">{goal.target}</p>
                      </div>
                      <div className={`rounded-xl p-3 text-center ${checkin ? 'bg-blue-50' : 'bg-gray-50'}`}>
                        <p className="text-xs text-gray-400">Actual</p>
                        <p className={`font-bold mt-0.5 ${checkin ? 'text-blue-700' : 'text-gray-400'}`}>
                          {checkin ? checkin.actual_achievement : '—'}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <p className="text-xs text-gray-400">Status</p>
                        <p className="font-medium text-gray-700 mt-0.5 capitalize text-xs">
                          {checkin?.progress_status?.replace('_', ' ') ?? '—'}
                        </p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    {score !== null && (
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-4">
                        <div
                          className={`h-full rounded-full ${score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-400' : 'bg-red-400'}`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    )}

                    {/* Manager comment */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Check-in Comment</label>
                      <div className="flex gap-2">
                        <input
                          value={comments[goal.id] ?? checkin?.manager_comment ?? ''}
                          onChange={e => setComments(c => ({ ...c, [goal.id]: e.target.value }))}
                          placeholder="Add structured feedback for this goal..."
                          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => handleSaveComment(goal.id)}
                          disabled={saving === goal.id || !checkin}
                          className="px-4 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition disabled:opacity-50 shrink-0">
                          {saving === goal.id ? '...' : 'Save'}
                        </button>
                      </div>
                      {!checkin && (
                        <p className="text-xs text-gray-400 mt-1">Employee hasn't submitted this check-in yet</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))
      )}
    </div>
  )
}