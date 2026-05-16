import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import SharedWeightageClient from './SharedWeightageClient'

export default async function SharedGoalWeightagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: goal } = await supabase
    .from('goals').select('*').eq('id', id).single()

  if (!goal || goal.employee_id !== user.id || !goal.is_shared) {
    redirect('/dashboard/employee')
  }

  return <SharedWeightageClient goal={goal} />
}