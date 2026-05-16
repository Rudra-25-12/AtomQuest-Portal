import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import ApprovalClient from './ApprovalClient'

export default async function ApprovalsPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'manager') redirect('/dashboard')

  // Get all employees under this manager
  const { data: teamMembers } = await supabase
    .from('profiles')
    .select('id, name, department')
    .eq('manager_id', user.id)

  const teamIds = teamMembers?.map(m => m.id) ?? []

  // Get all submitted/approved/rejected goals for team
  const { data: goals } = await supabase
    .from('goals')
    .select('*')
    .in('employee_id', teamIds.length > 0 ? teamIds : ['none'])
    .in('status', ['submitted', 'approved', 'rejected'])
    .order('created_at', { ascending: false })

  // Attach employee name to each goal
  const goalsWithNames = goals?.map(g => ({
    ...g,
    employee_name: teamMembers?.find(m => m.id === g.employee_id)?.name ?? 'Unknown'
  })) ?? []

  return <ApprovalClient goals={goalsWithNames} teamMembers={teamMembers ?? []} />
}