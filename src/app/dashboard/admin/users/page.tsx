import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export default async function UsersPage() {
  const supabase = await createServerSupabaseClient()
  const {data:{user}} = await supabase.auth.getUser()
  if(!user) redirect('/login')
  const {data:profile} = await supabase.from('profiles').select('role').eq('id',user.id).single()
  if(profile?.role!=='admin') redirect('/dashboard')
  const {data:profiles} = await supabase.from('profiles').select('*')

  const roleColors:Record<string,{color:string;bg:string}> = {
    admin:{color:'#fbbf24',bg:'rgba(251,191,36,0.12)'},
    manager:{color:'#a78bfa',bg:'rgba(139,92,246,0.12)'},
    employee:{color:'#60a5fa',bg:'rgba(96,165,250,0.12)'},
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium mb-1" style={{color:'#fbbf24'}}>Admin</p>
        <h1 className="text-3xl font-black" style={{color:'#f1f5f9'}}>Users</h1>
        <p className="text-sm mt-1" style={{color:'#475569'}}>{profiles?.length ?? 0} total users</p>
      </div>
      <div className="rounded-2xl overflow-hidden" style={{background:'#1e2433',border:'1px solid #2a3347'}}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{borderBottom:'1px solid #2a3347'}}>
              {['Name','Role','Department','Reports To'].map(h=>(
                <th key={h} className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{color:'#334155'}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {profiles?.map(p=>{
              const manager = profiles.find(m=>m.id===p.manager_id)
              const rc = roleColors[p.role]??roleColors.employee
              return (
                <tr key={p.id} style={{borderBottom:'1px solid #1a2030'}}>
                  <td className="px-6 py-4 font-semibold" style={{color:'#e2e8f0'}}>{p.name}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs px-3 py-1 rounded-full font-semibold capitalize" style={{background:rc.bg,color:rc.color}}>{p.role}</span>
                  </td>
                  <td className="px-6 py-4" style={{color:'#475569'}}>{p.department??'—'}</td>
                  <td className="px-6 py-4" style={{color:'#475569'}}>{manager?.name??'—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}