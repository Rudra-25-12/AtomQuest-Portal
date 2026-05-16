'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface Goal {
  id: string
  employee_id: string
  employee_name: string
  title: string
  description: string
  thrust_area: string
  uom_type: string
  target: number
  weightage: number
  status: string
}

interface TeamMember {
  id: string
  name: string
  department: string
}

export default function ApprovalClient({ goals, teamMembers }: {
  goals: Goal[]
  teamMembers: TeamMember[]
}) {
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all')
  const [editingGoal, setEditingGoal] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<{ target: string; weightage: string }>({ target: '', weightage: '' })
  const [rejectNote, setRejectNote] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  const filtered = selectedEmployee === 'all'
    ? goals
    : goals.filter(g => g.employee_id === selectedEmployee)

  // Group by employee
  const grouped = filtered.reduce<Record<string, Goal[]>>((acc, g) => {
    if (!acc[g.employee_name]) acc[g.employee_name] = []
    acc[g.employee_name].push(g)
    return acc
  }, {})

  const handleApprove = async (goalId: string) => {
    setLoading(goalId)
    await supabase.from('goals').update({ status: 'approved' }).eq('id', goalId)

    // Audit log
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('audit_logs').insert({
      entity_type: 'goal', entity_id: goalId,
      changed_by: user?.id,
      change_description: 'Goal approved by manager'
    })

    setLoading(null)
    router.refresh()
  }

  const handleReject = async (goalId: string) => {
    setLoading(goalId)
    await supabase.from('goals').update({
      status: 'rejected',
    }).eq('id', goalId)

    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('audit_logs').insert({
      entity_type: 'goal', entity_id: goalId,
      changed_by: user?.id,
      change_description: `Goal rejected. Note: ${rejectNote[goalId] || 'No note provided'}`
    })

    setLoading(null)
    router.refresh()
  }

  const handleSaveEdit = async (goalId: string) => {
    setLoading(goalId)
    await supabase.from('goals').update({
      target: parseFloat(editValues.target),
      weightage: parseFloat(editValues.weightage),
    }).eq('id', goalId)

    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('audit_logs').insert({
      entity_type: 'goal', entity_id: goalId,
      changed_by: user?.id,
      change_description: `Manager edited: target → ${editValues.target}, weightage → ${editValues.weightage}%`
    })

    setEditingGoal(null)
    setLoading(null)
    router.refresh()
  }

  const uomLabel: Record<string, string> = {
    numeric_min: 'Higher is better',
    numeric_max: 'Lower is better',
    timeline: 'Timeline',
    zero: 'Zero-based'
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Goal Approvals</h1>
        <p className="text-gray-500 text-sm mt-1">Review, edit and approve your team's goals</p>
      </div>

      {/* Filter by employee */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setSelectedEmployee('all')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${selectedEmployee === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          All Team
        </button>
        {teamMembers.map(m => (
          <button key={m.id}
            onClick={() => setSelectedEmployee(m.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${selectedEmployee === m.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {m.name}
          </button>
        ))}
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400">
          <p className="text-4xl mb-3">📋</p>
          <p className="font-medium">No goals submitted yet</p>
          <p className="text-sm mt-1">Goals will appear here once your team submits them</p>
        </div>
      ) : (
        Object.entries(grouped).map(([employeeName, empGoals]) => {
          const totalW = empGoals.reduce((s, g) => s + g.weightage, 0)
          const allApproved = empGoals.every(g => g.status === 'approved')

          return (
            <div key={employeeName} className="bg-white border border-gray-200 rounded-2xl mb-6 overflow-hidden">
              {/* Employee header */}
              <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div>
                  <p className="font-semibold text-gray-800">{employeeName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {empGoals.length} goals · Total weightage:
                    <span className={`ml-1 font-medium ${totalW === 100 ? 'text-green-600' : 'text-red-500'}`}>
                      {totalW}%
                    </span>
                  </p>
                </div>
                {allApproved && (
                  <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium">
                    ✓ All Approved
                  </span>
                )}
              </div>

              {/* Goals */}
              <div className="divide-y divide-gray-100">
                {empGoals.map(goal => (
                  <div key={goal.id} className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-gray-800 text-sm">{goal.title}</p>
                          <StatusBadge status={goal.status} />
                        </div>
                        {goal.description && (
                          <p className="text-xs text-gray-500 mb-2">{goal.description}</p>
                        )}
                        <div className="flex gap-4 text-xs text-gray-500">
                          <span>🎯 {goal.thrust_area}</span>
                          <span>📊 {uomLabel[goal.uom_type]}</span>
                          {editingGoal === goal.id ? null : (
                            <>
                              <span>Target: <strong>{goal.target}</strong></span>
                              <span>Weight: <strong>{goal.weightage}%</strong></span>
                            </>
                          )}
                        </div>

                        {/* Inline edit */}
                        {editingGoal === goal.id && (
                          <div className="mt-3 flex gap-3 items-end">
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Target</label>
                              <input type="number" value={editValues.target}
                                onChange={e => setEditValues(v => ({ ...v, target: e.target.value }))}
                                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Weightage %</label>
                              <input type="number" value={editValues.weightage}
                                onChange={e => setEditValues(v => ({ ...v, weightage: e.target.value }))}
                                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <button onClick={() => handleSaveEdit(goal.id)}
                              disabled={loading === goal.id}
                              className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-blue-700 transition">
                              Save
                            </button>
                            <button onClick={() => setEditingGoal(null)}
                              className="text-xs text-gray-400 hover:text-gray-600">
                              Cancel
                            </button>
                          </div>
                        )}

                        {/* Reject note */}
                        {goal.status === 'submitted' && (
                          <input
                            placeholder="Rejection note (optional)..."
                            value={rejectNote[goal.id] ?? ''}
                            onChange={e => setRejectNote(r => ({ ...r, [goal.id]: e.target.value }))}
                            className="mt-3 w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-red-300 text-gray-600"
                          />
                        )}
                      </div>

                      {/* Action buttons */}
                      {goal.status === 'submitted' && (
                        <div className="flex flex-col gap-2 shrink-0">
                          <button
                            onClick={() => {
                              setEditingGoal(goal.id)
                              setEditValues({ target: String(goal.target), weightage: String(goal.weightage) })
                            }}
                            className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition">
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleApprove(goal.id)}
                            disabled={loading === goal.id}
                            className="text-xs px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-60">
                            ✓ Approve
                          </button>
                          <button
                            onClick={() => handleReject(goal.id)}
                            disabled={loading === goal.id}
                            className="text-xs px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-60">
                            ✗ Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    submitted: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-600',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  )
}