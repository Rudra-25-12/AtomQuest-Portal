'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const QUARTERS = ['Q1','Q2','Q3','Q4']
function computeScore(uom:string,target:number,actual:number):number {
  if(!actual||!target) return 0
  switch(uom){
    case 'numeric_min': return Math.min((actual/target)*100,100)
    case 'numeric_max': return Math.min((target/actual)*100,100)
    case 'zero': return actual===0?100:0
    case 'timeline': return actual<=target?100:Math.max(0,100-((actual-target)/target)*100)
    default: return 0
  }
}
const inp = {background:'#242d3f',border:'1px solid #2a3347',color:'#e2e8f0'}

export default function ManagerCheckinClient({goals,checkins,teamMembers}:{goals:any[];checkins:any[];teamMembers:any[]}) {
  const [quarter,setQuarter] = useState('Q1')
  const [empFilter,setEmpFilter] = useState('all')
  const [comments,setComments] = useState<Record<string,string>>({})
  const [saving,setSaving] = useState<string|null>(null)
  const supabase = createClient()
  const router = useRouter()

  const filtered = goals.filter(g=>empFilter==='all'||g.employee_id===empFilter)
  const getCheckin = (id:string) => checkins.find(c=>c.goal_id===id&&c.quarter===quarter)
  const grouped = filtered.reduce<Record<string,any[]>>((acc,g)=>{
    if(!acc[g.employee_name]) acc[g.employee_name]=[]
    acc[g.employee_name].push(g); return acc
  },{})

  const saveComment = async (goalId:string) => {
    setSaving(goalId)
    const c = getCheckin(goalId)
    if(c) await supabase.from('checkins').update({manager_comment:comments[goalId]??c.manager_comment??''}).eq('id',c.id)
    setSaving(null); router.refresh()
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium mb-1" style={{color:'#fbbf24'}}>Manager</p>
        <h1 className="text-3xl font-black" style={{color:'#f1f5f9'}}>Team Check-ins</h1>
        <p className="text-sm mt-1" style={{color:'#475569'}}>Review actuals and add structured feedback</p>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {QUARTERS.map(q=>(
          <button key={q} onClick={()=>setQuarter(q)}
            className="px-5 py-2 rounded-xl text-sm font-bold"
            style={{background:quarter===q?'rgba(251,191,36,0.15)':'#1e2433',color:quarter===q?'#fbbf24':'#64748b',border:'1px solid',borderColor:quarter===q?'rgba(251,191,36,0.4)':'#2a3347'}}>
            {q}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {['all',...teamMembers.map(m=>m.id)].map(id=>{
          const label=id==='all'?'All':teamMembers.find(m=>m.id===id)?.name??''
          return (
            <button key={id} onClick={()=>setEmpFilter(id)}
              className="px-4 py-1.5 rounded-full text-sm font-medium"
              style={{background:empFilter===id?'#2a3347':'transparent',color:empFilter===id?'#e2e8f0':'#64748b',border:'1px solid #2a3347'}}>
              {label}
            </button>
          )
        })}
      </div>

      {Object.keys(grouped).length===0?(
        <div className="rounded-2xl p-16 text-center" style={{background:'#1e2433',border:'1px solid #2a3347'}}>
          <p className="text-4xl mb-3">📊</p>
          <p className="font-semibold" style={{color:'#94a3b8'}}>No approved goals found</p>
        </div>
      ):(
        Object.entries(grouped).map(([name,empGoals])=>(
          <div key={name} className="rounded-2xl overflow-hidden mb-4" style={{background:'#1e2433',border:'1px solid #2a3347'}}>
            <div className="px-6 py-4" style={{borderBottom:'1px solid #2a3347'}}>
              <p className="font-bold" style={{color:'#f1f5f9'}}>{name}</p>
              <p className="text-xs mt-0.5" style={{color:'#475569'}}>{empGoals.length} approved goals · {quarter}</p>
            </div>
            {empGoals.map(goal=>{
              const c = getCheckin(goal.id)
              const score = c?computeScore(goal.uom_type,goal.target,c.actual_achievement):null
              return (
                <div key={goal.id} className="p-6" style={{borderBottom:'1px solid #1a2030'}}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-semibold text-sm" style={{color:'#e2e8f0'}}>{goal.title}</p>
                      <p className="text-xs mt-0.5" style={{color:'#475569'}}>{goal.thrust_area} · {goal.weightage}%</p>
                    </div>
                    {score!==null&&(
                      <div className="text-right">
                        <p className="text-xs mb-1" style={{color:'#475569'}}>Score</p>
                        <p className="text-xl font-black" style={{color:score>=80?'#34d399':score>=50?'#fbbf24':'#f87171'}}>{score.toFixed(0)}%</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      {label:'Target',value:goal.target,color:'#94a3b8'},
                      {label:'Actual',value:c?c.actual_achievement:'—',color:c?'#60a5fa':'#334155'},
                      {label:'Status',value:c?.progress_status?.replace('_',' ')??'—',color:'#94a3b8'},
                    ].map(s=>(
                      <div key={s.label} className="rounded-xl p-3 text-center" style={{background:'#242d3f'}}>
                        <p className="text-xs mb-1" style={{color:'#334155'}}>{s.label}</p>
                        <p className="font-bold text-sm capitalize" style={{color:s.color}}>{s.value}</p>
                      </div>
                    ))}
                  </div>

                  {score!==null&&(
                    <div className="h-1.5 rounded-full overflow-hidden mb-4" style={{background:'#0f172a'}}>
                      <div className="h-full rounded-full" style={{width:`${score}%`,background:score>=80?'linear-gradient(90deg,#34d399,#10b981)':score>=50?'#fbbf24':'#f87171'}}/>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <input value={comments[goal.id]??c?.manager_comment??''}
                      onChange={e=>setComments(cm=>({...cm,[goal.id]:e.target.value}))}
                      placeholder="Add structured feedback..."
                      className="flex-1 rounded-xl px-4 py-2 text-sm focus:outline-none"
                      style={inp}/>
                    <button onClick={()=>saveComment(goal.id)} disabled={saving===goal.id||!c}
                      className="px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-40"
                      style={{background:'rgba(251,191,36,0.12)',color:'#fbbf24',border:'1px solid rgba(251,191,36,0.2)'}}>
                      {saving===goal.id?'...':'Save'}
                    </button>
                  </div>
                  {!c&&<p className="text-xs mt-1" style={{color:'#334155'}}>Employee hasn't submitted this check-in yet</p>}
                </div>
              )
            })}
          </div>
        ))
      )}
    </div>
  )
}