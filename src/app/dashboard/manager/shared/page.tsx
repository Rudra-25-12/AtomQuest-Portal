import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import SharedGoalClient from './SharedGoalClient'

export default async function SharedGoalsPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'manager') redirect('/dashboard')

  const { data: teamMembers } = await supabase
    .from('profiles').select('id, name, department').eq('manager_id', user.id)

  return <SharedGoalClient managerId={user.id} teamMembers={teamMembers ?? []} />
}