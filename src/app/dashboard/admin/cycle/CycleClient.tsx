'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4']

const QUARTER_INFO: Record<string, string> = {
  Q1: 'July — Progress Update',
  Q2: 'October — Progress Update',
  Q3: 'January — Progress Update',
  Q4: 'March/April — Final Achievement',
}

export default function CycleClient({ cycle }: { cycle: any }) {
  const [activeQuarter, setActiveQuarter] = useState(cycle?.active_quarter ?? 'Q1')
  const [goalSettingOpen, setGoalSettingOpen] = useState(cycle?.goal_setting_open ?? true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleSave = async () => {
    setSaving(true)
    await supabase.from('cycle_settings').update({
      active_quarter: activeQuarter,
      goal_setting_open: goalSettingOpen,
      updated_at: new Date().toISOString()
    }).eq('id', 1)

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
    router.refresh()
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Cycle Management</h1>
        <p className="text-gray-500 text-sm mt-1">Control which quarter is active and whether goal setting is open</p>
      </div>

      {/* Goal setting toggle */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-800">Goal Setting Window</p>
            <p className="text-sm text-gray-500 mt-0.5">Opens 1st May — allow employees to create and submit goals</p>
          </div>
          <button
            onClick={() => setGoalSettingOpen((o: boolean) => !o)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${goalSettingOpen ? 'bg-green-500' : 'bg-gray-300'}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${goalSettingOpen ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
        <div className={`mt-3 text-xs px-3 py-2 rounded-lg font-medium ${goalSettingOpen ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
          {goalSettingOpen ? '✓ Open — employees can create and submit goals' : '✗ Closed — goal creation is locked'}
        </div>
      </div>

      {/* Active quarter selector */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4">
        <p className="font-semibold text-gray-800 mb-1">Active Check-in Quarter</p>
        <p className="text-sm text-gray-500 mb-4">Only the active quarter window accepts achievement updates</p>

        <div className="grid grid-cols-2 gap-3">
          {QUARTERS.map(q => (
            <button key={q} onClick={() => setActiveQuarter(q)}
              className={`p-4 rounded-xl border-2 text-left transition ${activeQuarter === q
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'}`}>
              <p className={`font-bold text-lg ${activeQuarter === q ? 'text-blue-600' : 'text-gray-700'}`}>{q}</p>
              <p className={`text-xs mt-0.5 ${activeQuarter === q ? 'text-blue-500' : 'text-gray-400'}`}>
                {QUARTER_INFO[q]}
              </p>
              {activeQuarter === q && (
                <span className="inline-block mt-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">Active</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Current status summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-6">
        <p className="text-xs font-medium text-gray-500 mb-2">CURRENT CYCLE STATUS</p>
        <div className="flex gap-4">
          <div>
            <p className="text-xs text-gray-400">Goal Setting</p>
            <p className={`text-sm font-semibold ${goalSettingOpen ? 'text-green-600' : 'text-gray-500'}`}>
              {goalSettingOpen ? 'Open' : 'Closed'}
            </p>
          </div>
          <div className="w-px bg-gray-200" />
          <div>
            <p className="text-xs text-gray-400">Active Quarter</p>
            <p className="text-sm font-semibold text-blue-600">{activeQuarter}</p>
          </div>
          <div className="w-px bg-gray-200" />
          <div>
            <p className="text-xs text-gray-400">Last Updated</p>
            <p className="text-sm font-semibold text-gray-600">
              {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end items-center gap-4">
        {saved && <p className="text-sm text-green-600 font-medium">✓ Cycle settings saved!</p>}
        <button onClick={handleSave} disabled={saving}
          className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition disabled:opacity-60">
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}