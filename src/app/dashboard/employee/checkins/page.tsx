import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import CheckinClient from './CheckinClient'

export default async function CheckinsPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: goals } = await supabase
    .from('goals')
    .select('*')
    .eq('employee_id', user.id)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  const goalIds = goals?.map(g => g.id) ?? []

  const { data: checkins } = await supabase
    .from('checkins')
    .select('*')
    .in('goal_id', goalIds.length > 0 ? goalIds : ['none'])

  return <CheckinClient goals={goals ?? []} existingCheckins={checkins ?? []} />
}