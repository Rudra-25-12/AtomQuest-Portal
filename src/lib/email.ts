import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = 'AtomQuest <onboarding@resend.dev>' // use this until you verify a domain

export async function sendGoalSubmittedEmail(to: string, employeeName: string, goalCount: number) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `${employeeName} submitted ${goalCount} goal${goalCount > 1 ? 's' : ''} for approval`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#f9fafb;border-radius:16px;">
        <div style="background:#3b82f6;border-radius:12px;padding:24px;margin-bottom:24px;">
          <h1 style="color:white;margin:0;font-size:20px;">AtomQuest Portal</h1>
          <p style="color:#bfdbfe;margin:4px 0 0;font-size:13px;">Goal Setting & Tracking</p>
        </div>
        <h2 style="color:#1f2937;font-size:18px;margin:0 0 8px;">New Goals Submitted</h2>
        <p style="color:#6b7280;font-size:14px;margin:0 0 24px;">
          <strong style="color:#1f2937;">${employeeName}</strong> has submitted 
          <strong style="color:#3b82f6;">${goalCount} goal${goalCount > 1 ? 's' : ''}</strong> 
          for your approval.
        </p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/manager/approvals"
          style="display:inline-block;background:#3b82f6;color:white;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;">
          Review Goals →
        </a>
        <p style="color:#9ca3af;font-size:12px;margin:24px 0 0;">AtomQuest Hackathon 1.0</p>
      </div>
    `
  })
}

export async function sendGoalApprovedEmail(to: string, managerName: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Your goals have been approved ✓',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#f9fafb;border-radius:16px;">
        <div style="background:#10b981;border-radius:12px;padding:24px;margin-bottom:24px;">
          <h1 style="color:white;margin:0;font-size:20px;">AtomQuest Portal</h1>
          <p style="color:#a7f3d0;margin:4px 0 0;font-size:13px;">Goal Setting & Tracking</p>
        </div>
        <h2 style="color:#1f2937;font-size:18px;margin:0 0 8px;">🎉 Goals Approved!</h2>
        <p style="color:#6b7280;font-size:14px;margin:0 0 24px;">
          Your goals have been approved by <strong style="color:#1f2937;">${managerName}</strong>. 
          You can now start logging your quarterly achievements.
        </p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/employee/checkins"
          style="display:inline-block;background:#10b981;color:white;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;">
          Start Check-ins →
        </a>
        <p style="color:#9ca3af;font-size:12px;margin:24px 0 0;">AtomQuest Hackathon 1.0</p>
      </div>
    `
  })
}

export async function sendGoalRejectedEmail(to: string, managerName: string, note: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Action needed — goal returned for revision',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#f9fafb;border-radius:16px;">
        <div style="background:#ef4444;border-radius:12px;padding:24px;margin-bottom:24px;">
          <h1 style="color:white;margin:0;font-size:20px;">AtomQuest Portal</h1>
          <p style="color:#fecaca;margin:4px 0 0;font-size:13px;">Goal Setting & Tracking</p>
        </div>
        <h2 style="color:#1f2937;font-size:18px;margin:0 0 8px;">Goal Returned for Revision</h2>
        <p style="color:#6b7280;font-size:14px;margin:0 0 16px;">
          <strong style="color:#1f2937;">${managerName}</strong> has returned a goal for revision.
        </p>
        ${note ? `
        <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:12px 16px;margin-bottom:24px;">
          <p style="color:#991b1b;font-size:13px;margin:0;"><strong>Note:</strong> ${note}</p>
        </div>` : ''}
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/employee"
          style="display:inline-block;background:#ef4444;color:white;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;">
          Edit & Resubmit →
        </a>
        <p style="color:#9ca3af;font-size:12px;margin:24px 0 0;">AtomQuest Hackathon 1.0</p>
      </div>
    `
  })
}

export async function sendCheckinReminderEmail(to: string, employeeName: string, quarter: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Reminder: ${quarter} check-in not completed yet`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#f9fafb;border-radius:16px;">
        <div style="background:#f59e0b;border-radius:12px;padding:24px;margin-bottom:24px;">
          <h1 style="color:white;margin:0;font-size:20px;">AtomQuest Portal</h1>
          <p style="color:#fde68a;margin:4px 0 0;font-size:13px;">Goal Setting & Tracking</p>
        </div>
        <h2 style="color:#1f2937;font-size:18px;margin:0 0 8px;">⏰ ${quarter} Check-in Reminder</h2>
        <p style="color:#6b7280;font-size:14px;margin:0 0 24px;">
          Hi <strong style="color:#1f2937;">${employeeName}</strong>, your ${quarter} check-in is still pending. 
          Please log your achievements before the window closes.
        </p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/employee/checkins"
          style="display:inline-block;background:#f59e0b;color:white;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;">
          Complete Check-in →
        </a>
        <p style="color:#9ca3af;font-size:12px;margin:24px 0 0;">AtomQuest Hackathon 1.0</p>
      </div>
    `
  })
}