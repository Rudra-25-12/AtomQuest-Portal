'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const QUARTERS = ['Q1','Q2','Q3','Q4']
const QUARTER_INFO:Record<string,string> = {Q1:'July — Progress Update',Q2:'October — Progress Update',Q3:'January — Progress Update',Q4:'March/April — Final Achievement'}

export default function CycleClient({cycle}:{cycle:any}) {
  const [activeQ,setActiveQ] = useState(cycle?.active_quarter??'Q1')
  const [open,setOpen] = useState(cycle?.goal_setting_open??true)
  const [saving,setSaving] = useState(false)
  const [saved,setSaved] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleSave = async () => {
    setSaving(true)
    await supabase.from('cycle_settings').update({active_quarter:activeQ,goal_setting_open:open,updated_at:new Date().toISOString()}).eq('id',1)
    setSaving(false); setSaved(true)
    setTimeout(()=>setSaved(false),2500)
    router.refresh()
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <p className="text-sm font-medium mb-1" style={{color:'#fbbf24'}}>Admin</p>
        <h1 className="text-3xl font-black" style={{color:'#f1f5f9'}}>Cycle Management</h1>
        <p className="text-sm mt-1" style={{color:'#475569'}}>Control active quarter and goal setting window</p>
      </div>

      {/* Toggle */}
      <div className="rounded-2xl p-6 mb-4" style={{background:'#1e2433',border:'1px solid #2a3347'}}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-bold" style={{color:'#f1f5f9'}}>Goal Setting Window</p>
            <p className="text-sm mt-0.5" style={{color:'#475569'}}>Allow employees to create and submit goals</p>
          </div>
          <button onClick={()=>setOpen((o:boolean)=>!o)}
            className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
            style={{background:open?'#34d399':'#2a3347'}}>
            <span className="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
              style={{transform:open?'translateX(24px)':'translateX(4px)'}}/>
          </button>
        </div>
        <div className="rounded-xl px-4 py-2.5 text-xs font-medium"
          style={{background:open?'rgba(52,211,153,0.08)':'rgba(100,116,139,0.08)',color:open?'#34d399':'#64748b',border:`1px solid ${open?'rgba(52,211,153,0.2)':'rgba(100,116,139,0.2)'}`}}>
          {open?'✓ Open — employees can create and submit goals':'✗ Closed — goal creation is locked'}
        </div>
      </div>

      {/* Quarter selector */}
      <div className="rounded-2xl p-6 mb-4" style={{background:'#1e2433',border:'1px solid #2a3347'}}>
        <p className="font-bold mb-1" style={{color:'#f1f5f9'}}>Active Check-in Quarter</p>
        <p className="text-sm mb-4" style={{color:'#475569'}}>Only this quarter accepts achievement updates</p>
        <div className="grid grid-cols-2 gap-3">
          {QUARTERS.map(q=>(
            <button key={q} onClick={()=>setActiveQ(q)}
              className="p-4 rounded-xl text-left transition-all"
              style={{border:`2px solid ${activeQ===q?'#fbbf24':'#2a3347'}`,background:activeQ===q?'rgba(251,191,36,0.08)':'transparent'}}>
              <p className="font-black text-lg" style={{color:activeQ===q?'#fbbf24':'#64748b'}}>{q}</p>
              <p className="text-xs mt-0.5" style={{color:activeQ===q?'#92400e':'#334155'}}>{QUARTER_INFO[q]}</p>
              {activeQ===q&&<span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-bold" style={{background:'rgba(251,191,36,0.2)',color:'#fbbf24'}}>Active</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end items-center gap-4">
        {saved&&<p className="text-sm font-medium" style={{color:'#34d399'}}>✓ Saved!</p>}
        <button onClick={handleSave} disabled={saving}
          className="px-6 py-2.5 rounded-xl text-sm font-bold disabled:opacity-60"
          style={{background:'linear-gradient(135deg,#fbbf24,#f97316)',color:'#0a0a0a'}}>
          {saving?'Saving...':'Save Settings'}
        </button>
      </div>
    </div>
  )
}