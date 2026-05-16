import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import ManagerCheckinClient from './ManagerCheckinClient'

export default async function ManagerCheckinsPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'manager') redirect('/dashboard')

  const { data: teamMembers } = await supabase
    .from('profiles').select('id, name, department').eq('manager_id', user.id)

  const teamIds = teamMembers?.map(m => m.id) ?? []

  const { data: goals } = await supabase
    .from('goals').select('*')
    .in('employee_id', teamIds.length > 0 ? teamIds : ['none'])
    .eq('status', 'approved')

  const goalIds = goals?.map(g => g.id) ?? []

  const { data: checkins } = await supabase
    .from('checkins').select('*')
    .in('goal_id', goalIds.length > 0 ? goalIds : ['none'])

  const goalsWithMeta = goals?.map(g => ({
    ...g,
    employee_name: teamMembers?.find(m => m.id === g.employee_id)?.name ?? 'Unknown'
  })) ?? []

  return <ManagerCheckinClient goals={goalsWithMeta} checkins={checkins ?? []} teamMembers={teamMembers ?? []} />
}