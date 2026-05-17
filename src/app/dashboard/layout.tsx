import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import SidebarClient from '@/components/SidebarClient'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, role, department')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen flex" style={{ background: '#0f172a' }}>
      <SidebarClient profile={profile} />

      <main
        className="flex-1 overflow-auto"
        style={{
          background: '#0f172a',
          backgroundImage:
            'radial-gradient(rgba(251,191,36,0.03) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      >
        <div className="p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}