import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export default async function AuditPage() {
  const supabase = await createServerSupabaseClient()
  const {data:{user}} = await supabase.auth.getUser()
  if(!user) redirect('/login')
  const {data:profile} = await supabase.from('profiles').select('role').eq('id',user.id).single()
  if(profile?.role!=='admin') redirect('/dashboard')
  const {data:logs} = await supabase.from('audit_logs').select('*').order('created_at',{ascending:false}).limit(200)
  const {data:profiles} = await supabase.from('profiles').select('id,name')

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium mb-1" style={{color:'#fbbf24'}}>Admin</p>
        <h1 className="text-3xl font-black" style={{color:'#f1f5f9'}}>Audit Log</h1>
        <p className="text-sm mt-1" style={{color:'#475569'}}>All changes to goals and check-ins</p>
      </div>
      <div className="rounded-2xl overflow-hidden" style={{background:'#1e2433',border:'1px solid #2a3347'}}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{borderBottom:'1px solid #2a3347'}}>
              {['When','Who','Type','Action'].map(h=>(
                <th key={h} className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{color:'#334155'}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!logs||logs.length===0?(
              <tr><td colSpan={4} className="text-center py-12" style={{color:'#334155'}}>No audit entries yet</td></tr>
            ):logs.map(log=>{
              const person = profiles?.find(p=>p.id===log.changed_by)
              return (
                <tr key={log.id} style={{borderBottom:'1px solid #1a2030'}}>
                  <td className="px-6 py-4 text-xs whitespace-nowrap" style={{color:'#475569'}}>
                    {new Date(log.created_at).toLocaleString('en-IN',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}
                  </td>
                  <td className="px-6 py-4 font-semibold" style={{color:'#e2e8f0'}}>{person?.name??'System'}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs px-2 py-0.5 rounded-full capitalize" style={{background:'rgba(96,165,250,0.12)',color:'#60a5fa'}}>{log.entity_type}</span>
                  </td>
                  <td className="px-6 py-4 text-xs" style={{color:'#64748b'}}>{log.change_description}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}