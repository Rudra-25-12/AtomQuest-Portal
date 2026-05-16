import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendGoalRejectedEmail } from '@/lib/email'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { employeeId, note } = await req.json()

    const { data: employee } = await supabase
      .from('profiles').select('name, manager_id').eq('id', employeeId).single()

    const { data: manager } = await supabase
      .from('profiles').select('name').eq('id', employee?.manager_id).single()

    const { data: empAuth } = await supabase.auth.admin.getUserById(employeeId)

    if (empAuth?.user?.email) {
      await sendGoalRejectedEmail(empAuth.user.email, manager?.name ?? 'Your manager', note)
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ ok: true })
  }
}