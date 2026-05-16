import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export default async function ManagerDashboard() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: teamMembers } = await supabase
    .from('profiles')
    .select('id, name')
    .eq('manager_id', user.id)

  const teamIds = teamMembers?.map(m => m.id) ?? []

  const { data: goals } = await supabase
    .from('goals')
    .select('status')
    .in('employee_id', teamIds.length > 0 ? teamIds : ['none'])

  const submitted = goals?.filter(g => g.status === 'submitted').length ?? 0
  const approved = goals?.filter(g => g.status === 'approved').length ?? 0
  const rejected = goals?.filter(g => g.status === 'rejected').length ?? 0

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Manager Dashboard</h1>
      <p className="text-gray-500 text-sm mb-8">Your team's goal overview</p>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Pending Approval" value={submitted} color="yellow" />
        <StatCard label="Approved" value={approved} color="green" />
        <StatCard label="Rejected" value={rejected} color="red" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Team Members</h2>
        {teamMembers?.length === 0 ? (
          <p className="text-gray-400 text-sm">No team members assigned yet</p>
        ) : (
          <div className="space-y-2">
            {teamMembers?.map(m => (
              <div key={m.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-700">{m.name}</span>
                <a href="/dashboard/manager/approvals"
                  className="text-xs text-blue-600 hover:underline">View Goals →</a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    yellow: 'text-yellow-600', green: 'text-green-600', red: 'text-red-500'
  }
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${colors[color]}`}>{value}</p>
    </div>
  )
}