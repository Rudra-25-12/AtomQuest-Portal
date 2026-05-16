import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import LogoutButton from '@/components/LogoutButton'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, role')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-800 text-sm">AtomQuest</h2>
          <p className="text-xs text-gray-500 mt-0.5 capitalize">{profile?.role}</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {profile?.role === 'employee' && (
            <>
              <NavLink href="/dashboard/employee">My Goals</NavLink>
              <NavLink href="/dashboard/employee/goals/new">+ New Goal</NavLink>
              <NavLink href="/dashboard/employee/checkins">Check-ins</NavLink>
            </>
          )}
          {profile?.role === 'manager' && (
            <>
              <NavLink href="/dashboard/manager">Team Dashboard</NavLink>
              <NavLink href="/dashboard/manager/approvals">Approvals</NavLink>
              <NavLink href="/dashboard/manager/checkins">Check-ins</NavLink>
            </>
          )}
          {profile?.role === 'admin' && (
            <>
              <NavLink href="/dashboard/admin">Overview</NavLink>
              <NavLink href="/dashboard/admin/users">Users</NavLink>
              <NavLink href="/dashboard/admin/reports">Reports</NavLink>
              <NavLink href="/dashboard/admin/audit">Audit Log</NavLink>
              <NavLink href="/dashboard/admin/cycle">Cycle Management</NavLink>
            </>
          )}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <p className="text-xs text-gray-600 mb-2">{profile?.name}</p>
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition">
      {children}
    </a>
  )
}