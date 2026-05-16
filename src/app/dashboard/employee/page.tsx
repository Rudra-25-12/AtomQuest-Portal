import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export default async function EmployeeDashboard() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, role, department')
    .eq('id', user.id)
    .single()

  const { data: goals } = await supabase
    .from('goals')
    .select('*')
    .eq('employee_id', user.id)
    .order('created_at', { ascending: false })

  const approved = goals?.filter(g => g.status === 'approved').length ?? 0
  const submitted = goals?.filter(g => g.status === 'submitted').length ?? 0
  const rejected = goals?.filter(g => g.status === 'rejected').length ?? 0
  const totalWeight = goals?.filter(g => g.status === 'approved')
    .reduce((s, g) => s + g.weightage, 0) ?? 0

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-sm font-medium mb-1" style={{ color: '#fbbf24' }}>
            Welcome back 👋
          </p>
          <h1 className="text-3xl font-black" style={{ color: '#f1f5f9' }}>
            {profile?.name}
          </h1>
          <p className="text-sm mt-1" style={{ color: '#475569' }}>
            {profile?.department} · Employee
          </p>
        </div>
        <a href="/dashboard/employee/goals/new"
          className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
          style={{ background: 'linear-gradient(135deg, #fbbf24, #f97316)', color: '#0a0a0a' }}>
          + New Goal
        </a>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Goals', value: goals?.length ?? 0, color: '#60a5fa', sub: 'created' },
          { label: 'Approved', value: approved, color: '#34d399', sub: 'by manager' },
          { label: 'Pending', value: submitted, color: '#fbbf24', sub: 'awaiting review' },
          { label: 'Total Weight', value: `${totalWeight}%`, color: '#a78bfa', sub: 'approved goals' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-5"
            style={{ background: '#1e2433', border: '1px solid #2a3347' }}>
            <p className="text-xs font-medium mb-3" style={{ color: '#475569' }}>{s.label}</p>
            <p className="text-3xl font-black mb-1" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs" style={{ color: '#334155' }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Progress bar for approved weightage */}
      {approved > 0 && (
        <div className="rounded-2xl p-5 mb-6"
          style={{ background: '#1e2433', border: '1px solid #2a3347' }}>
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm font-semibold" style={{ color: '#94a3b8' }}>Approved Weightage Coverage</p>
            <p className="text-sm font-bold" style={{ color: totalWeight === 100 ? '#34d399' : '#fbbf24' }}>
              {totalWeight}% / 100%
            </p>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: '#0f172a' }}>
            <div className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(totalWeight, 100)}%`,
                background: totalWeight === 100
                  ? 'linear-gradient(90deg, #34d399, #10b981)'
                  : 'linear-gradient(90deg, #fbbf24, #f97316)'
              }} />
          </div>
        </div>
      )}

      {/* Goals list */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: '#1e2433', border: '1px solid #2a3347' }}>
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid #2a3347' }}>
          <h2 className="font-bold" style={{ color: '#f1f5f9' }}>My Goals</h2>
          <div className="flex gap-2">
            {[
              { label: `${approved} Approved`, color: '#34d399' },
              { label: `${submitted} Pending`, color: '#fbbf24' },
              { label: `${rejected} Rejected`, color: '#f87171' },
            ].map(b => (
              <span key={b.label} className="text-xs px-2 py-1 rounded-lg font-medium"
                style={{ background: `${b.color}18`, color: b.color }}>
                {b.label}
              </span>
            ))}
          </div>
        </div>

        {!goals || goals.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🎯</p>
            <p className="font-semibold mb-1" style={{ color: '#94a3b8' }}>No goals yet</p>
            <p className="text-sm mb-4" style={{ color: '#334155' }}>Create your first goal to get started</p>
            <a href="/dashboard/employee/goals/new"
              className="inline-block px-4 py-2 rounded-xl text-sm font-bold"
              style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)' }}>
              + Create Goal
            </a>
          </div>
        ) : (
          <div>
            {goals.map((goal, i) => {
              const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
                draft:     { color: '#64748b', bg: '#64748b18', label: 'Draft' },
                submitted: { color: '#fbbf24', bg: '#fbbf2418', label: 'Pending' },
                approved:  { color: '#34d399', bg: '#34d39918', label: 'Approved' },
                rejected:  { color: '#f87171', bg: '#f8717118', label: 'Rejected' },
              }
              const sc = statusConfig[goal.status] ?? statusConfig.draft

              return (
                <div key={goal.id}
                  className="flex items-center justify-between px-6 py-4 transition-all"
                  style={{
                    borderBottom: i < goals.length - 1 ? '1px solid #1a2030' : 'none',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#242d3f'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-semibold text-sm" style={{ color: '#e2e8f0' }}>{goal.title}</p>
                      {goal.is_shared && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa' }}>
                          Shared
                        </span>
                      )}
                    </div>
                    <p className="text-xs" style={{ color: '#475569' }}>
                      {goal.thrust_area} · {goal.weightage}% weight · Target: {goal.target}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs px-3 py-1 rounded-full font-semibold"
                      style={{ background: sc.bg, color: sc.color }}>
                      {sc.label}
                    </span>
                    {goal.status === 'rejected' && (
                      <a href={`/dashboard/employee/goals/edit/${goal.id}`}
                        className="text-xs px-3 py-1 rounded-lg font-medium transition-all"
                        style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>
                        Edit & Resubmit
                      </a>
                    )}
                    {goal.is_shared && goal.status === 'approved' && (
                      <a href={`/dashboard/employee/goals/shared/${goal.id}`}
                        className="text-xs px-3 py-1 rounded-lg font-medium"
                        style={{ background: 'rgba(139,92,246,0.1)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.2)' }}>
                        Adjust Weight
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}