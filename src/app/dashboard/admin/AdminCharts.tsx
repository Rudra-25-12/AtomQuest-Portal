'use client'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer
} from 'recharts'
import { useState } from 'react'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function AdminCharts({
  deptStats, quarterStats, escalations, managerStats, summary, allProfiles, allGoals, allCheckins
}: {
  deptStats: any[]
  quarterStats: any[]
  escalations: any
  managerStats: any[]
  summary: any
  allProfiles: any[]
  allGoals: any[]
  allCheckins: any[]
}) {
  const [activeTab, setActiveTab] = useState<'overview' | 'charts' | 'escalations' | 'employees'>('overview')

  const goalStatusData = [
    { name: 'Approved', value: allGoals.filter(g => g.status === 'approved').length },
    { name: 'Submitted', value: allGoals.filter(g => g.status === 'submitted').length },
    { name: 'Draft', value: allGoals.filter(g => g.status === 'draft').length },
    { name: 'Rejected', value: allGoals.filter(g => g.status === 'rejected').length },
  ].filter(d => d.value > 0)

  const employees = allProfiles.filter(p => p.role === 'employee')

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Active Quarter:
            <span className="ml-1 font-semibold text-blue-600">{summary.activeQuarter}</span>
            <span className={`ml-3 text-xs px-2 py-0.5 rounded-full font-medium ${summary.goalSettingOpen ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              Goal Setting {summary.goalSettingOpen ? 'Open' : 'Closed'}
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          <a href="/dashboard/admin/reports"
            className="bg-green-600 text-white text-xs px-4 py-2 rounded-lg hover:bg-green-700 transition">
            ⬇ Export CSV
          </a>
          <a href="/dashboard/admin/cycle"
            className="bg-blue-600 text-white text-xs px-4 py-2 rounded-lg hover:bg-blue-700 transition">
            ⚙ Cycle Settings
          </a>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Employees" value={summary.employees} color="blue" />
        <StatCard label="Total Goals" value={summary.totalGoals} color="gray" />
        <StatCard label="Approved" value={summary.approvedGoals} color="green" />
        <StatCard label="Pending" value={summary.pendingGoals} sub={summary.pendingGoals > 0 ? '⚠ needs action' : '✓ all clear'} color={summary.pendingGoals > 0 ? 'yellow' : 'green'} />
      </div>

      {/* Escalation banner */}
      {(escalations.noGoals.length > 0 || escalations.pendingApproval.length > 0 || escalations.noCheckins.length > 0) && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
          <p className="text-sm font-semibold text-red-700 mb-2">⚠ Escalation Alerts</p>
          <div className="flex flex-wrap gap-3">
            {escalations.noGoals.length > 0 && (
              <span className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded-full">
                {escalations.noGoals.length} employee{escalations.noGoals.length > 1 ? 's' : ''} haven't submitted goals
              </span>
            )}
            {escalations.pendingApproval.length > 0 && (
              <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
                {escalations.pendingApproval.length} awaiting manager approval
              </span>
            )}
            {escalations.noCheckins.length > 0 && (
              <span className="text-xs bg-orange-100 text-orange-600 px-3 py-1 rounded-full">
                {escalations.noCheckins.length} with no check-ins yet
              </span>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {(['overview', 'charts', 'escalations', 'employees'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition ${activeTab === tab ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Department table */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-semibold text-gray-800">Employee Goal Status</h2>
              <div className="flex gap-2">
                <a href="/dashboard/admin/reports" className="text-xs text-blue-600 hover:underline">Reports →</a>
                <a href="/dashboard/admin/audit" className="text-xs text-gray-400 hover:underline ml-3">Audit Log →</a>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Employee', 'Department', 'Manager', 'Goals', 'Approved', 'Check-ins', 'Status'].map(h => (
                      <th key={h} className="text-left px-6 py-3 text-xs font-medium text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {employees.map(emp => {
                    const empGoals = allGoals.filter(g => g.employee_id === emp.id)
                    const approved = empGoals.filter(g => g.status === 'approved').length
                    const empCheckins = allCheckins.filter(c => empGoals.some(g => g.id === c.goal_id)).length
                    const manager = allProfiles.find(p => p.id === emp.manager_id)
                    const fullyApproved = empGoals.length > 0 && approved === empGoals.length
                    return (
                      <tr key={emp.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-medium text-gray-800">{emp.name}</td>
                        <td className="px-6 py-4 text-gray-500">{emp.department}</td>
                        <td className="px-6 py-4 text-gray-500">{manager?.name ?? '—'}</td>
                        <td className="px-6 py-4 text-center">{empGoals.length}</td>
                        <td className="px-6 py-4 text-center text-green-600 font-medium">{approved}</td>
                        <td className="px-6 py-4 text-center text-blue-600">{empCheckins}</td>
                        <td className="px-6 py-4">
                          {empGoals.length === 0
                            ? <Badge label="No Goals" color="gray" />
                            : fullyApproved
                            ? <Badge label="✓ Complete" color="green" />
                            : <Badge label="Pending" color="yellow" />}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Charts tab */}
      {activeTab === 'charts' && (
        <div className="space-y-6">
          {/* Goal status pie + dept bar side by side */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Goal Status Distribution</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={goalStatusData} cx="50%" cy="50%" outerRadius={80}
                    dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {goalStatusData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Goals by Department</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={deptStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="dept" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="approved" name="Approved" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="submitted" name="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quarter checkin progress */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Quarter-on-Quarter Check-in Progress</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={quarterStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="quarter" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="onTrack" name="On Track" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="notStarted" name="Not Started" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Manager effectiveness */}
          {managerStats.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Manager Effectiveness</h3>
              <div className="space-y-3">
                {managerStats.map((m, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-32 shrink-0">
                      <p className="text-sm font-medium text-gray-800">{m.name}</p>
                      <p className="text-xs text-gray-400">{m.teamSize} reports</p>
                    </div>
                    <div className="flex-1 grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-xs text-gray-400">Approved</p>
                        <p className="font-bold text-green-600">{m.approved}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Pending</p>
                        <p className={`font-bold ${m.pending > 0 ? 'text-yellow-500' : 'text-gray-400'}`}>{m.pending}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Comments Given</p>
                        <p className="font-bold text-blue-600">{m.checkinsDone}</p>
                      </div>
                    </div>
                    <div className="w-24 shrink-0">
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full"
                          style={{ width: `${m.teamSize > 0 ? (m.approved / (m.teamSize * 8)) * 100 : 0}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Escalations tab */}
      {activeTab === 'escalations' && (
        <div className="space-y-4">
          <EscalationCard
            title="Employees with No Goals Submitted"
            color="red"
            icon="🚨"
            people={escalations.noGoals}
            emptyMsg="All employees have submitted goals ✓"
          />
          <EscalationCard
            title="Goals Awaiting Manager Approval"
            color="yellow"
            icon="⏳"
            people={escalations.pendingApproval}
            emptyMsg="No pending approvals ✓"
          />
          <EscalationCard
            title="Approved Goals with No Check-ins"
            color="orange"
            icon="📋"
            people={escalations.noCheckins}
            emptyMsg="All employees have started check-ins ✓"
          />
        </div>
      )}

      {/* Employees tab */}
      {activeTab === 'employees' && (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Name', 'Role', 'Department', 'Manager', 'Goals', 'Status'].map(h => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {allProfiles.map(p => {
                const manager = allProfiles.find(m => m.id === p.manager_id)
                const goals = allGoals.filter(g => g.employee_id === p.id)
                return (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-800">{p.name}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${p.role === 'admin' ? 'bg-purple-100 text-purple-700' : p.role === 'manager' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                        {p.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{p.department ?? '—'}</td>
                    <td className="px-6 py-4 text-gray-500">{manager?.name ?? '—'}</td>
                    <td className="px-6 py-4 text-center text-gray-700">{goals.length}</td>
                    <td className="px-6 py-4">
                      {goals.length === 0 ? <Badge label="No Goals" color="gray" />
                        : goals.every(g => g.status === 'approved') ? <Badge label="✓ Done" color="green" />
                        : <Badge label="In Progress" color="yellow" />}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, color, sub }: { label: string; value: number; color: string; sub?: string }) {
  const colors: Record<string, string> = {
    blue: 'text-blue-600', green: 'text-green-600', yellow: 'text-yellow-600', gray: 'text-gray-700'
  }
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${colors[color]}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

function Badge({ label, color }: { label: string; color: string }) {
  const colors: Record<string, string> = {
    green: 'bg-green-100 text-green-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    gray: 'bg-gray-100 text-gray-500',
    red: 'bg-red-100 text-red-600'
  }
  return <span className={`text-xs px-3 py-1 rounded-full font-medium ${colors[color]}`}>{label}</span>
}

function EscalationCard({ title, color, icon, people, emptyMsg }: {
  title: string; color: string; icon: string; people: any[]; emptyMsg: string
}) {
  const colors: Record<string, string> = {
    red: 'border-red-200 bg-red-50',
    yellow: 'border-yellow-200 bg-yellow-50',
    orange: 'border-orange-200 bg-orange-50'
  }
  const textColors: Record<string, string> = {
    red: 'text-red-700', yellow: 'text-yellow-700', orange: 'text-orange-700'
  }
  return (
    <div className={`border rounded-2xl p-6 ${colors[color]}`}>
      <div className="flex items-center gap-2 mb-3">
        <span>{icon}</span>
        <h3 className={`font-semibold ${textColors[color]}`}>{title}</h3>
        {people.length > 0 && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ml-auto ${textColors[color]} bg-white`}>
            {people.length}
          </span>
        )}
      </div>
      {people.length === 0 ? (
        <p className="text-sm text-green-600 font-medium">{emptyMsg}</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {people.map((p: any) => (
            <span key={p.id} className="text-xs bg-white border border-gray-200 text-gray-700 px-3 py-1 rounded-full">
              {p.name}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}