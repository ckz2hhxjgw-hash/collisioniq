module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { to, eventId, narrative, opName, opPlate, opInsurer, policeReport, photoCount, photos, scanPhotos, preCollisionTrack } = req.body || {};

  if (!to) return res.status(400).json({ error: 'Recipient email required' });

  // Build HTML email body
  const now = new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' });
  const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1B2431,#2d3f55);padding:28px 32px;text-align:center;">
      <div style="font-size:22px;font-weight:800;color:white;letter-spacing:-0.5px;">CollisionIQ by Lytx</div>
      <div style="font-size:13px;color:rgba(255,255,255,0.65);margin-top:4px;">Fleet Incident Report — First Notification of Loss</div>
    </div>

    <!-- Alert Banner -->
    <div style="background:#fef2f2;border-bottom:1px solid #fecaca;padding:14px 32px;display:flex;align-items:center;gap:10px;">
      <span style="font-size:20px;">💥</span>
      <div>
        <div style="font-size:13px;font-weight:700;color:#dc2626;">COLLISION EVENT DETECTED</div>
        <div style="font-size:12px;color:#ef4444;margin-top:2px;">Event ID: ${eventId || 'LTX-2026-03847'} &nbsp;·&nbsp; Generated: ${now}</div>
      </div>
    </div>

    <div style="padding:28px 32px;">

      <!-- Event Details -->
      <div style="margin-bottom:24px;">
        <div style="font-size:11px;font-weight:700;color:#4C84FF;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">Event Details</div>
        <table style="width:100%;border-collapse:collapse;">
          <tr style="border-bottom:1px solid #f1f5f9;">
            <td style="padding:8px 0;font-size:13px;color:#667892;width:45%;">Date &amp; Time</td>
            <td style="padding:8px 0;font-size:13px;font-weight:600;color:#1B2431;">March 24, 2026 at 2:47 PM</td>
          </tr>
          <tr style="border-bottom:1px solid #f1f5f9;">
            <td style="padding:8px 0;font-size:13px;color:#667892;">Location</td>
            <td style="padding:8px 0;font-size:13px;font-weight:600;color:#1B2431;">I-15 N, Exit 42 · Las Vegas, NV</td>
          </tr>
          <tr style="border-bottom:1px solid #f1f5f9;">
            <td style="padding:8px 0;font-size:13px;color:#667892;">Vehicle</td>
            <td style="padding:8px 0;font-size:13px;font-weight:600;color:#1B2431;">Unit #4821 · 2023 Ford F-150</td>
          </tr>
          <tr style="border-bottom:1px solid #f1f5f9;">
            <td style="padding:8px 0;font-size:13px;color:#667892;">Speed at Impact</td>
            <td style="padding:8px 0;font-size:13px;font-weight:600;color:#dc2626;">34 mph</td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-size:13px;color:#667892;">G-Force</td>
            <td style="padding:8px 0;font-size:13px;font-weight:600;color:#dc2626;">8.2g (Severe)</td>
          </tr>
        </table>
      </div>

      <!-- Narrative -->
      ${narrative ? `
      <div style="margin-bottom:24px;">
        <div style="font-size:11px;font-weight:700;color:#4C84FF;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">Incident Narrative</div>
        <div style="background:#f8fafc;border-left:3px solid #4C84FF;border-radius:0 8px 8px 0;padding:14px 16px;font-size:13px;color:#374151;line-height:1.6;">${narrative.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>
      </div>` : ''}

      <!-- Other Party -->
      <div style="margin-bottom:24px;">
        <div style="font-size:11px;font-weight:700;color:#4C84FF;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">Other Party</div>
        <table style="width:100%;border-collapse:collapse;">
          <tr style="border-bottom:1px solid #f1f5f9;">
            <td style="padding:8px 0;font-size:13px;color:#667892;width:45%;">Name</td>
            <td style="padding:8px 0;font-size:13px;font-weight:600;color:${(!opName || opName === 'Unknown') ? '#94a3b8' : '#1B2431'};">${(!opName || opName === 'Unknown') ? '— not captured' : opName}</td>
          </tr>
          <tr style="border-bottom:1px solid #f1f5f9;">
            <td style="padding:8px 0;font-size:13px;color:#667892;">License Plate</td>
            <td style="padding:8px 0;font-size:13px;font-weight:600;color:${(!opPlate || opPlate === 'Not captured') ? '#94a3b8' : '#1B2431'};">${(!opPlate || opPlate === 'Not captured') ? '— not captured' : opPlate}</td>
          </tr>
          <tr style="border-bottom:1px solid #f1f5f9;">
            <td style="padding:8px 0;font-size:13px;color:#667892;">Insurance</td>
            <td style="padding:8px 0;font-size:13px;font-weight:600;color:${(!opInsurer || opInsurer === 'Not captured') ? '#94a3b8' : '#1B2431'};">${(!opInsurer || opInsurer === 'Not captured') ? '— not captured' : opInsurer}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-size:13px;color:#667892;">Police Report</td>
            <td style="padding:8px 0;font-size:13px;font-weight:600;color:#1B2431;">${policeReport || 'None'}</td>
          </tr>
        </table>
      </div>

      <!-- Pre-Collision Track -->
      ${preCollisionTrack && preCollisionTrack.length > 0 ? `
      <div style="margin-bottom:24px;">
        <div style="font-size:11px;font-weight:700;color:#4C84FF;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">🗺️ Pre-Collision Track · 10 Min Leading to Event</div>
        <table style="width:100%;border-collapse:collapse;font-size:12px;">
          <tr style="background:#f1f5f9;">
            <th style="padding:6px 10px;text-align:left;color:#667892;font-weight:700;">Time</th>
            <th style="padding:6px 10px;text-align:right;color:#667892;font-weight:700;">Speed</th>
            <th style="padding:6px 10px;text-align:left;color:#667892;font-weight:700;">Status</th>
          </tr>
          ${preCollisionTrack.map(pt => {
            const isImpact = pt.time === 'Impact';
            const color = isImpact ? '#dc2626' : pt.speed >= 66 ? '#ea580c' : pt.speed >= 56 ? '#f59e0b' : '#16a34a';
            const label = isImpact ? '💥 Impact' : pt.speed >= 66 ? '⚠ Above limit' : pt.speed >= 56 ? '↑ Elevated' : '✓ Normal';
            return `<tr style="border-bottom:1px solid #f1f5f9;${isImpact ? 'background:#fef2f2;' : ''}">
              <td style="padding:7px 10px;color:#374151;font-weight:${isImpact ? '700' : '400'};">${pt.time}</td>
              <td style="padding:7px 10px;text-align:right;font-weight:700;color:${color};">${pt.speed} mph</td>
              <td style="padding:7px 10px;color:${color};font-weight:600;">${label}</td>
            </tr>`;
          }).join('')}
        </table>
        <div style="font-size:11px;color:#94a3b8;margin-top:6px;">Source: Lytx telematics · I-15 N, approaching Exit 42, Las Vegas NV</div>
      </div>` : ''}

      <!-- Other Party Scan Photos -->
      ${scanPhotos && (scanPhotos.dl || scanPhotos.plate || scanPhotos.insurance) ? `
      <div style="margin-bottom:24px;">
        <div style="font-size:11px;font-weight:700;color:#4C84FF;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">Other Party Documentation</div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">
          ${[
            { key: 'dl',        label: "Driver's License", emoji: '🪪' },
            { key: 'plate',     label: 'License Plate',    emoji: '🚗' },
            { key: 'insurance', label: 'Insurance Card',   emoji: '📋' }
          ].filter(item => scanPhotos[item.key]).map((item, i) => `
          <div style="border-radius:8px;overflow:hidden;border:1px solid #e2e8f0;text-align:center;">
            <img src="cid:scan_${item.key}" style="width:100%;height:100px;object-fit:cover;display:block;" alt="${item.label}" />
            <div style="padding:5px 6px;font-size:11px;color:#667892;background:#f8fafc;">${item.emoji} ${item.label}</div>
          </div>`).join('')}
        </div>
      </div>` : ''}

      <!-- Evidence -->
      <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:10px;padding:14px 16px;margin-bottom:24px;display:flex;align-items:center;gap:12px;">
        <span style="font-size:24px;">📷</span>
        <div>
          <div style="font-size:13px;font-weight:700;color:#16a34a;">${photoCount || 0} of 7 evidence photos captured</div>
          <div style="font-size:12px;color:#4ade80;margin-top:2px;">Lytx video clip &amp; telematics auto-captured ✓</div>
        </div>
      </div>

      <!-- Evidence Photos -->
      ${photos && photos.length > 0 ? `
      <div style="margin-bottom:24px;">
        <div style="font-size:11px;font-weight:700;color:#4C84FF;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">Evidence Photos (${photos.length})</div>
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;">
          ${photos.map((p, i) => `
          <div style="border-radius:8px;overflow:hidden;border:1px solid #e2e8f0;">
            <img src="cid:photo${i}" style="width:100%;height:140px;object-fit:cover;display:block;" alt="${(p.label || 'Photo ' + (i+1)).replace(/"/g,'&quot;')}" />
            <div style="padding:6px 8px;font-size:11px;color:#667892;background:#f8fafc;">${(p.label || 'Photo ' + (i+1)).replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>
          </div>`).join('')}
        </div>
      </div>` : ''}

      <!-- CTA -->
      <div style="text-align:center;padding-top:8px;">
        <a href="https://collisioniq.vercel.app" style="display:inline-block;background:linear-gradient(135deg,#4C84FF,#7C4DFF);color:white;text-decoration:none;font-size:14px;font-weight:700;padding:14px 32px;border-radius:12px;letter-spacing:0.2px;">View Full Report →</a>
      </div>

    </div>

    <!-- Footer -->
    <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:16px 32px;text-align:center;">
      <div style="font-size:11px;color:#94a3b8;">This report was automatically generated by CollisionIQ, powered by Lytx telematics and Claude AI.</div>
      <div style="font-size:11px;color:#94a3b8;margin-top:4px;">© 2026 Lytx, Inc. · <a href="https://collisioniq.vercel.app" style="color:#4C84FF;text-decoration:none;">collisioniq.vercel.app</a></div>
    </div>

  </div>
</body>
</html>`;

  const subject = `CollisionIQ Incident Report — ${eventId || 'LTX-2026-03847'} · ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  // Try Resend (https://resend.com) if API key is set
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';

  if (RESEND_API_KEY) {
    try {
      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to,
          subject,
          html: htmlBody,
          attachments: [
            ...(photos && photos.length > 0
              ? photos.map((p, i) => ({
                  filename: `evidence_photo${i + 1}.jpg`,
                  content: p.data.replace(/^data:image\/\w+;base64,/, ''),
                  content_type: 'image/jpeg',
                  content_id: `photo${i}`
                }))
              : []),
            ...(scanPhotos
              ? [
                  scanPhotos.dl        && { filename: 'drivers_license.jpg',  content: scanPhotos.dl.replace(/^data:image\/\w+;base64,/, ''),        content_type: 'image/jpeg', content_id: 'scan_dl' },
                  scanPhotos.plate     && { filename: 'license_plate.jpg',    content: scanPhotos.plate.replace(/^data:image\/\w+;base64,/, ''),      content_type: 'image/jpeg', content_id: 'scan_plate' },
                  scanPhotos.insurance && { filename: 'insurance_card.jpg',   content: scanPhotos.insurance.replace(/^data:image\/\w+;base64,/, ''), content_type: 'image/jpeg', content_id: 'scan_insurance' }
                ].filter(Boolean)
              : [])
          ].filter(a => a) || undefined
        })
      });
      const emailData = await emailRes.json();
      if (!emailRes.ok) throw new Error(emailData.message || 'Resend API error');
      return res.json({ success: true, provider: 'resend', id: emailData.id });
    } catch (err) {
      console.error('Resend error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  // Fallback: demo mode — log and return success so the UI confirms
  console.log(`[CollisionIQ Demo] Email report for event ${eventId} would be sent to: ${to}`);
  console.log(`Subject: ${subject}`);
  return res.json({ success: true, provider: 'demo', message: 'Demo mode — add RESEND_API_KEY env var to send real emails' });
};
