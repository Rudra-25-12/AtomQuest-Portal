  import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import AdminCharts from './AdminCharts'

export default async function AdminDashboard() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: allProfiles } = await supabase.from('profiles').select('*')
  const { data: allGoals } = await supabase.from('goals').select('*')
  const { data: allCheckins } = await supabase.from('checkins').select('*')
  const { data: cycle } = await supabase
    .from('cycle_settings').select('*').eq('id', 1).single()

  const employees = allProfiles?.filter(p => p.role === 'employee') ?? []
  const managers = allProfiles?.filter(p => p.role === 'manager') ?? []

  // Per-department stats
  const departments = [...new Set(allProfiles?.map(p => p.department).filter(Boolean))]
  const deptStats = departments.map(dept => {
    const deptEmployees = employees.filter(e => e.department === dept)
    const deptGoals = allGoals?.filter(g => deptEmployees.some(e => e.id === g.employee_id)) ?? []
    const approved = deptGoals.filter(g => g.status === 'approved').length
    const submitted = deptGoals.filter(g => g.status === 'submitted').length
    return { dept, total: deptGoals.length, approved, submitted }
  })

  // Quarter checkin stats
  const quarterStats = ['Q1', 'Q2', 'Q3', 'Q4'].map(q => {
    const qCheckins = allCheckins?.filter(c => c.quarter === q) ?? []
    const completed = qCheckins.filter(c => c.progress_status === 'completed').length
    const onTrack = qCheckins.filter(c => c.progress_status === 'on_track').length
    const notStarted = qCheckins.filter(c => c.progress_status === 'not_started').length
    return { quarter: q, completed, onTrack, notStarted, total: qCheckins.length }
  })

  // Escalation flags
  const escalations = {
    noGoals: employees.filter(e =>
      !(allGoals?.some(g => g.employee_id === e.id))
    ),
    pendingApproval: employees.filter(e => {
      const goals = allGoals?.filter(g => g.employee_id === e.id) ?? []
      return goals.some(g => g.status === 'submitted')
    }),
    noCheckins: employees.filter(e => {
      const empGoals = allGoals?.filter(g => g.employee_id === e.id && g.status === 'approved') ?? []
      if (empGoals.length === 0) return false
      const empCheckins = allCheckins?.filter(c => empGoals.some(g => g.id === c.goal_id)) ?? []
      return empCheckins.length === 0
    }),
  }

  // Manager effectiveness
  const managerStats = managers.map(m => {
    const team = employees.filter(e => e.manager_id === m.id)
    const teamGoals = allGoals?.filter(g => team.some(e => e.id === g.employee_id)) ?? []
    const approved = teamGoals.filter(g => g.status === 'approved').length
    const pending = teamGoals.filter(g => g.status === 'submitted').length
    const checkinsDone = allCheckins?.filter(c =>
      teamGoals.some(g => g.id === c.goal_id) && c.manager_comment
    ).length ?? 0
    return { name: m.name, approved, pending, checkinsDone, teamSize: team.length }
  })

  return (
    <AdminCharts
      deptStats={deptStats}
      quarterStats={quarterStats}
      escalations={escalations}
      managerStats={managerStats}
      summary={{
        employees: employees.length,
        totalGoals: allGoals?.length ?? 0,
        approvedGoals: allGoals?.filter(g => g.status === 'approved').length ?? 0,
        pendingGoals: allGoals?.filter(g => g.status === 'submitted').length ?? 0,
        activeQuarter: cycle?.active_quarter ?? 'Q1',
        goalSettingOpen: cycle?.goal_setting_open ?? true,
      }}
      allProfiles={allProfiles ?? []}
      allGoals={allGoals ?? []}
      allCheckins={allCheckins ?? []}
    />
  )
}