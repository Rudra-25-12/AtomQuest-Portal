import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import UnlockClient from './UnlockClient'

export default async function UsersPage() {
  const supabase = await createServerSupabaseClient()
  const {data:{user}} = await supabase.auth.getUser()
  if(!user) redirect('/login')
  const {data:profile} = await supabase.from('profiles').select('role').eq('id',user.id).single()
  if(profile?.role!=='admin') redirect('/dashboard')
  const {data:profiles} = await supabase.from('profiles').select('*')
  const {data:goals} = await supabase.from('goals').select('*').eq('status','approved')

  return <UnlockClient profiles={profiles??[]} goals={goals??[]} />
}