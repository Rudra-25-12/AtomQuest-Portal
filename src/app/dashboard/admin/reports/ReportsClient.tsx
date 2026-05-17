'use client'
import { useState } from 'react'

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

export default function ReportsClient({profiles,goals,checkins}:{profiles:any[];goals:any[];checkins:any[]}) {
  const [qFilter,setQFilter] = useState('all')

  const rows = goals.flatMap(goal=>{
    const emp = profiles.find(p=>p.id===goal.employee_id)
    const mgr = profiles.find(p=>p.id===emp?.manager_id)
    const gc = checkins.filter(c=>c.goal_id===goal.id)
    if(gc.length===0) return [{employee:emp?.name??'—',department:emp?.department??'—',manager:mgr?.name??'—',goal_title:goal.title,thrust_area:goal.thrust_area,target:goal.target,weightage:goal.weightage,status:goal.status,quarter:'—',actual:'—',progress_status:'—',score:'—'}]
    return gc.map(c=>({employee:emp?.name??'—',department:emp?.department??'—',manager:mgr?.name??'—',goal_title:goal.title,thrust_area:goal.thrust_area,target:goal.target,weightage:goal.weightage,status:goal.status,quarter:c.quarter,actual:c.actual_achievement,progress_status:c.progress_status,score:computeScore(goal.uom_type,goal.target,c.actual_achievement).toFixed(0)+'%'}))
  })

  const filtered = qFilter==='all'?rows:rows.filter(r=>r.quarter===qFilter)

  const exportCSV = () => {
    const headers = ['Employee','Department','Manager','Goal','Thrust Area','Target','Weight','Status','Quarter','Actual','Progress','Score']
    const csv = [headers,...filtered.map(r=>[r.employee,r.department,r.manager,r.goal_title,r.thrust_area,r.target,r.weightage,r.status,r.quarter,r.actual,r.progress_status,r.score])].map(r=>r.join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv],{type:'text/csv'}))
    a.download = `report_${qFilter}.csv`; a.click()
  }

  const thStyle = {color:'#334155'}
  const tdStyle = {color:'#94a3b8',borderBottom:'1px solid #1a2030'}

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-sm font-medium mb-1" style={{color:'#fbbf24'}}>Admin</p>
          <h1 className="text-3xl font-black" style={{color:'#f1f5f9'}}>Achievement Report</h1>
        </div>
        <button onClick={exportCSV}
          className="px-5 py-2.5 rounded-xl text-sm font-bold"
          style={{background:'linear-gradient(135deg,#34d399,#10b981)',color:'#0a0a0a'}}>
          ⬇ Export CSV
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        {['all','Q1','Q2','Q3','Q4'].map(q=>(
          <button key={q} onClick={()=>setQFilter(q)}
            className="px-4 py-1.5 rounded-xl text-sm font-medium"
            style={{background:qFilter===q?'rgba(251,191,36,0.15)':'#1e2433',color:qFilter===q?'#fbbf24':'#64748b',border:'1px solid',borderColor:qFilter===q?'rgba(251,191,36,0.4)':'#2a3347'}}>
            {q==='all'?'All Quarters':q}
          </button>
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden" style={{background:'#1e2433',border:'1px solid #2a3347'}}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{borderBottom:'1px solid #2a3347'}}>
                {['Employee','Dept','Goal','Thrust Area','Target','Weight','Quarter','Actual','Score','Status'].map(h=>(
                  <th key={h} className="text-left px-4 py-3 font-semibold uppercase tracking-wider" style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length===0?(
                <tr><td colSpan={10} className="text-center py-12" style={{color:'#334155'}}>No data</td></tr>
              ):filtered.map((r,i)=>(
                <tr key={i}>
                  <td className="px-4 py-3 font-semibold" style={{color:'#e2e8f0',borderBottom:'1px solid #1a2030'}}>{r.employee}</td>
                  <td className="px-4 py-3" style={tdStyle}>{r.department}</td>
                  <td className="px-4 py-3" style={{...tdStyle,color:'#cbd5e1'}}>{r.goal_title}</td>
                  <td className="px-4 py-3" style={tdStyle}>{r.thrust_area}</td>
                  <td className="px-4 py-3" style={tdStyle}>{r.target}</td>
                  <td className="px-4 py-3" style={tdStyle}>{r.weightage}%</td>
                  <td className="px-4 py-3" style={tdStyle}>{r.quarter}</td>
                  <td className="px-4 py-3 font-bold" style={{...tdStyle,color:'#60a5fa'}}>{r.actual}</td>
                  <td className="px-4 py-3 font-black" style={{...tdStyle,color:'#fbbf24'}}>{r.score}</td>
                  <td className="px-4 py-3" style={tdStyle}>
                    <span className="px-2 py-0.5 rounded-full text-xs capitalize"
                      style={{background:r.progress_status==='completed'?'rgba(52,211,153,0.12)':r.progress_status==='on_track'?'rgba(251,191,36,0.12)':'rgba(100,116,139,0.12)',color:r.progress_status==='completed'?'#34d399':r.progress_status==='on_track'?'#fbbf24':'#64748b'}}>
                      {r.progress_status?.replace('_',' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}