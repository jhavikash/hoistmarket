// lib/email/index.ts
// All transactional emails for HoistMarket
// Uses Resend API — https://resend.com
// Set RESEND_API_KEY in .env.local

const RESEND_API = 'https://api.resend.com/emails'
const FROM = process.env.FROM_EMAIL ?? 'noreply@hoistmarket.com'
const ADMIN = process.env.ADMIN_EMAIL ?? 'info@hoistmarket.com'
const KEY = process.env.RESEND_API_KEY

async function send(to: string | string[], subject: string, html: string, replyTo?: string) {
  if (!KEY) {
    console.log(`[EMAIL dev] To: ${to} | Subject: ${subject}`)
    return { success: true, dev: true }
  }
  const res = await fetch(RESEND_API, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: `HoistMarket <${FROM}>`, to, subject, html, reply_to: replyTo }),
  })
  if (!res.ok) {
    const err = await res.text()
    console.error('[EMAIL error]', err)
    return { success: false, error: err }
  }
  return { success: true }
}

const base = (content: string) => `
<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 20px">
<tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08)">
  <tr><td style="background:#102a43;padding:28px 32px">
    <table width="100%"><tr>
      <td><span style="color:#fff;font-size:18px;font-weight:800;letter-spacing:-0.3px">Hoist<span style="color:#f97316">Market</span></span></td>
      <td align="right"><span style="color:rgba(255,255,255,.4);font-size:12px">info@hoistmarket.com</span></td>
    </tr></table>
  </td></tr>
  <tr><td style="padding:32px">${content}</td></tr>
  <tr><td style="background:#f8fafc;padding:20px 32px;border-top:1px solid #e2e8f0">
    <p style="margin:0;font-size:11px;color:#94a3b8;text-align:center">
      HoistMarket · info@hoistmarket.com · hoistmarket.com<br>
      Monrovia, Liberia · India · GCC · West Africa
    </p>
  </td></tr>
</table></td></tr></table></body></html>`

const h1 = (t: string) => `<h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#102a43;letter-spacing:-0.5px">${t}</h1>`
const p  = (t: string) => `<p style="margin:0 0 16px;font-size:14px;line-height:1.7;color:#475569">${t}</p>`
const badge = (t: string, color = '#f97316') => `<span style="display:inline-block;background:${color};color:#fff;font-size:11px;font-weight:700;padding:3px 10px;border-radius:4px;letter-spacing:0.5px;text-transform:uppercase">${t}</span>`
const btn = (text: string, url: string) => `<a href="${url}" style="display:inline-block;background:#f97316;color:#fff;font-size:13px;font-weight:700;padding:12px 24px;border-radius:8px;text-decoration:none;margin:8px 0">${text}</a>`
const table = (rows: [string, string][]) => `
  <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin:16px 0">
    ${rows.map(([k, v]) => `<tr><td style="padding:10px 16px;background:#f8fafc;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;width:140px;border-bottom:1px solid #e2e8f0">${k}</td><td style="padding:10px 16px;font-size:13px;color:#1e293b;border-bottom:1px solid #e2e8f0">${v}</td></tr>`).join('')}
  </table>`

// ── RFQ CONFIRMATION (to requester) ────────────────────────
export async function sendRFQConfirmation(to: string, data: {
  rfq_number: string; name: string; equipment_category: string
  site_region: string; matched_vendors: number
}) {
  const html = base(`
    ${h1('RFQ Received')}
    <p style="margin:0 0 20px;font-size:14px;color:#64748b">Hi ${data.name},</p>
    ${p('Your request for quote has been received and our matching engine has identified verified vendors for your requirements.')}
    <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:16px;margin:20px 0">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#ea580c;margin-bottom:8px">Your RFQ Reference</div>
      <div style="font-size:28px;font-weight:800;color:#102a43;font-family:monospace">${data.rfq_number}</div>
    </div>
    ${table([
      ['Equipment', data.equipment_category],
      ['Region', data.site_region],
      ['Vendors Matched', `${data.matched_vendors} verified partner${data.matched_vendors !== 1 ? 's' : ''}`],
    ])}
    <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:16px;margin:20px 0">
      <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#15803d">What happens next</p>
      <ul style="margin:0;padding-left:16px;font-size:13px;color:#166534;line-height:1.8">
        <li>An admin reviews your RFQ within 24 hours</li>
        <li>Vendor contact details stay private until a match is confirmed</li>
        <li>You receive 2–5 competitive quotes within 48–72 hours</li>
        <li>HoistMarket earns a commission only on completed transactions</li>
      </ul>
    </div>
    <p style="font-size:13px;color:#64748b">Questions? Reply to this email or contact us at <a href="mailto:info@hoistmarket.com" style="color:#f97316">info@hoistmarket.com</a></p>
  `)
  return send(to, `RFQ Received: ${data.rfq_number} — ${data.equipment_category}`, html)
}

// ── ADMIN: New RFQ notification ─────────────────────────────
export async function sendAdminRFQAlert(data: {
  rfq_number: string; requester_name: string; requester_email: string
  requester_company: string | null; equipment_category: string; site_region: string
  required_capacity: string | null; urgency: string; matched_vendors: number
}) {
  const urgencyColor = data.urgency === 'urgent' ? '#dc2626' : data.urgency === 'high' ? '#ea580c' : '#64748b'
  const html = base(`
    ${h1('New RFQ Submitted')} ${badge(data.urgency.toUpperCase(), urgencyColor)}
    <br><br>
    ${table([
      ['RFQ Number', data.rfq_number],
      ['From', `${data.requester_name}${data.requester_company ? ` · ${data.requester_company}` : ''}`],
      ['Email', data.requester_email],
      ['Equipment', data.equipment_category],
      ['Region', data.site_region],
      ['Capacity', data.required_capacity ?? 'Not specified'],
      ['Vendors Matched', String(data.matched_vendors)],
    ])}
    ${btn('→ Open in Admin Dashboard', `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://hoistmarket.com'}/admin/leads`)}
  `)
  return send(ADMIN, `[RFQ] ${data.rfq_number} — ${data.equipment_category} in ${data.site_region}`, html, data.requester_email)
}

// ── VENDOR: RFQ Dispatched ──────────────────────────────────
export async function sendVendorRFQDispatch(to: string, data: {
  vendor_name: string; rfq_number: string; equipment_category: string
  site_region: string; required_capacity: string | null; urgency: string
  dispatch_message: string | null; portal_url: string
}) {
  const html = base(`
    ${h1('New RFQ for Your Business')}
    <p style="margin:0 0 20px;font-size:14px;color:#64748b">Hello ${data.vendor_name},</p>
    ${p('A new Request for Quote matching your equipment categories and region has been dispatched to you. Log in to your vendor portal to view the full requirements and submit your quote.')}
    ${table([
      ['RFQ Reference', data.rfq_number],
      ['Equipment', data.equipment_category],
      ['Region', data.site_region],
      ['Capacity', data.required_capacity ?? 'To be discussed'],
      ['Priority', data.urgency.charAt(0).toUpperCase() + data.urgency.slice(1)],
    ])}
    ${data.dispatch_message ? `<div style="background:#f8fafc;border-left:3px solid #f97316;padding:12px 16px;margin:16px 0;font-size:13px;color:#475569;font-style:italic">${data.dispatch_message}</div>` : ''}
    <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:16px;margin:20px 0">
      <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#92400e">⚡ Action Required</p>
      <p style="margin:0;font-size:13px;color:#92400e">Log in to your vendor portal to view the requester's full details and submit your quote. Vendor contacts on both sides remain private until you respond.</p>
    </div>
    ${btn('Open Vendor Portal →', data.portal_url)}
    <p style="font-size:12px;color:#94a3b8;margin-top:16px">This RFQ was forwarded via HoistMarket's neutral broker system. The requester's contact details will be shared after you submit a quote and a match is confirmed.</p>
  `)
  return send(to, `New RFQ: ${data.equipment_category} in ${data.site_region} [${data.rfq_number}]`, html)
}

// ── VENDOR: Listing Approved ────────────────────────────────
export async function sendVendorApproved(to: string, data: {
  vendor_name: string; company_name: string; slug: string
}) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://hoistmarket.com'}/directory/${data.slug}`
  const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://hoistmarket.com'}/vendor/portal`
  const html = base(`
    <div style="text-align:center;margin-bottom:24px">
      <div style="font-size:48px;margin-bottom:12px">✅</div>
      ${h1('Your Listing is Verified!')}
    </div>
    <p style="margin:0 0 16px;font-size:14px;color:#64748b">Hi ${data.vendor_name},</p>
    ${p(`<strong>${data.company_name}</strong> has been verified on HoistMarket. Your listing now shows a Verified badge and you will start receiving matched RFQs from buyers in your region.`)}
    <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:16px;margin:20px 0">
      <ul style="margin:0;padding-left:16px;font-size:13px;color:#166534;line-height:2">
        <li>✓ Verified badge shown on your listing</li>
        <li>✓ Eligible to receive matched RFQs</li>
        <li>✓ Buyers can view your full company profile</li>
        <li>Consider upgrading to <strong>Standard or Featured</strong> for more RFQs and homepage visibility</li>
      </ul>
    </div>
    <table width="100%" cellpadding="8"><tr>
      <td>${btn('View Your Listing', url)}</td>
      <td>${btn('Open Vendor Portal', portalUrl)}</td>
    </tr></table>
  `)
  return send(to, `✅ ${data.company_name} is now Verified on HoistMarket`, html)
}

// ── MEMBERSHIP ACTIVATED ────────────────────────────────────
export async function sendMembershipActivated(to: string, data: {
  vendor_name: string; company_name: string; tier: string
  expires_at: string; price: string
}) {
  const html = base(`
    ${h1('Membership Activated')} ${badge(data.tier.toUpperCase())}
    <br><br>
    <p style="margin:16px 0;font-size:14px;color:#64748b">Hi ${data.vendor_name},</p>
    ${p(`Your <strong>${data.tier.charAt(0).toUpperCase() + data.tier.slice(1)}</strong> membership for <strong>${data.company_name}</strong> is now active. You will start receiving priority-matched RFQs immediately.`)}
    ${table([
      ['Plan', `${data.tier.charAt(0).toUpperCase() + data.tier.slice(1)} Membership`],
      ['Amount Paid', data.price],
      ['Valid Until', new Date(data.expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })],
    ])}
    ${btn('Open Vendor Portal →', `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://hoistmarket.com'}/vendor/portal`)}
    <p style="font-size:12px;color:#94a3b8;margin-top:16px">Tax invoice will be emailed separately. For billing queries, contact info@hoistmarket.com</p>
  `)
  return send(to, `Membership Activated — HoistMarket ${data.tier.charAt(0).toUpperCase() + data.tier.slice(1)}`, html)
}

// ── CONTACT FORM ────────────────────────────────────────────
export async function sendContactFormEmail(data: {
  name: string; email: string; company?: string; subject: string; message: string
}) {
  // To admin
  await send(
    ADMIN,
    `[Contact] ${data.subject} — ${data.name}`,
    base(`
      ${h1('New Contact Form Submission')}
      ${table([
        ['Name', data.name],
        ['Email', data.email],
        ...(data.company ? [['Company', data.company] as [string, string]] : []),
        ['Subject', data.subject],
      ])}
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:16px 0">
        <p style="margin:0 0 8px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#64748b">Message</p>
        <p style="margin:0;font-size:14px;line-height:1.7;color:#1e293b;white-space:pre-wrap">${data.message}</p>
      </div>
    `),
    data.email
  )
  // Confirmation to sender
  return send(
    data.email,
    'Your message to HoistMarket has been received',
    base(`
      ${h1('Message Received')}
      <p style="margin:0 0 16px;font-size:14px;color:#64748b">Hi ${data.name},</p>
      ${p('Thank you for contacting HoistMarket. We\'ve received your message and will respond within 2 business days.')}
      <div style="background:#f8fafc;border-left:3px solid #f97316;padding:12px 16px;margin:16px 0;font-size:13px;color:#475569">
        <strong>Subject:</strong> ${data.subject}
      </div>
      <p style="font-size:13px;color:#64748b">In the meantime, you can browse our <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://hoistmarket.com'}/knowledge-base" style="color:#f97316">Knowledge Base</a> or <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://hoistmarket.com'}/directory" style="color:#f97316">Vendor Directory</a>.</p>
    `)
  )
}
