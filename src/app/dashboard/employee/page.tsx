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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Welcome, {profile?.name} 👋</h1>
        <p className="text-gray-500 text-sm mt-1">{profile?.department} · Employee</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Goals" value={goals?.length ?? 0} />
        <StatCard label="Approved" value={goals?.filter(g => g.status === 'approved').length ?? 0} color="green" />
        <StatCard label="Pending Approval" value={goals?.filter(g => g.status === 'submitted').length ?? 0} color="yellow" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-gray-800">My Goals</h2>
          <a href="/dashboard/employee/goals/new"
            className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition">
            + New Goal
          </a>
        </div>

        {!goals || goals.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">🎯</p>
            <p className="font-medium">No goals yet</p>
            <p className="text-sm mt-1">Create your first goal to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {goals.map(goal => (
              <div key={goal.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-800 text-sm">{goal.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{goal.thrust_area} · {goal.weightage}% weight</p>
                </div>
                <StatusBadge status={goal.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, color = 'blue' }: { label: string; value: number; color?: string }) {
  const colors: Record<string, string> = {
    blue: 'text-blue-600', green: 'text-green-600', yellow: 'text-yellow-600'
  }
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${colors[color]}`}>{value}</p>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-600',
    submitted: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-600',
  }
  return (
    <span className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${map[status] ?? map.draft}`}>
      {status}
    </span>
  )
}