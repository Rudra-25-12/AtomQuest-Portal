import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendGoalSubmittedEmail } from '@/lib/email'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {  
  try {
    const { employeeId, goalCount } = await req.json()

    const { data: employee } = await supabase
      .from('profiles').select('name, manager_id').eq('id', employeeId).single()

    if (!employee?.manager_id) return NextResponse.json({ ok: true })

    const { data: manager } = await supabase
      .from('profiles').select('name').eq('id', employee.manager_id).single()

    const { data: managerAuth } = await supabase.auth.admin.getUserById(employee.manager_id)

    if (managerAuth?.user?.email) {
      await sendGoalSubmittedEmail(managerAuth.user.email, employee.name, goalCount)
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ ok: true }) // fail silently
  }
}