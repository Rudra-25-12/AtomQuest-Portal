import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import EditGoalClient from './EditGoalClient'

export default async function EditGoalPage({ params }: { params: { id: string } }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: goal } = await supabase
    .from('goals').select('*').eq('id', params.id).single()

  if (!goal || goal.employee_id !== user.id || goal.status !== 'rejected') {
    redirect('/dashboard/employee')
  }

  return <EditGoalClient goal={goal} />
}