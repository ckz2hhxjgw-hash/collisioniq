import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    to,
    eventId = 'LTX-2026-03847',
    narrative,
    opName = 'Unknown',
    opPlate = 'Not captured',
    opInsurer = 'Not captured',
    policeReport = 'None',
    photoCount = 0,
    photos = [],
    scanPhotos = {},
    preCollisionTrack = []
  } = req.body;

  if (!to) {
    return res.status(400).json({ error: 'Missing recipient email' });
  }

  // Speed color helper
  function speedColor(mph, isImpact) {
    if (isImpact) return '#dc2626';
    if (mph > 65) return '#ea580c';
    if (mph > 55) return '#f59e0b';
    return '#16a34a';
  }

  // Pre-collision speed timeline rows
  const timelineRows = preCollisionTrack.map(pt => {
    const isImpact = pt.time === 'Impact';
    const color = speedColor(pt.speed, isImpact);
    const barWidth = Math.min(Math.round(pt.speed * 1.8), 180);
    return `
      <tr>
        <td style="padding:6px 0;width:68px;font-size:13px;color:#667892;white-space:nowrap;">${pt.time}</td>
        <td style="padding:6px 8px;">
          <div style="height:8px;width:${barWidth}px;background:${color};border-radius:4px;min-width:16px;"></div>
        </td>
        <td style="padding:6px 0;font-size:13px;font-weight:700;color:${isImpact ? '#dc2626' : '#1B2431'};text-align:right;white-space:nowrap;width:72px;">${isImpact ? '&#x1F4A5; ' : ''}${pt.speed} mph</td>
      </tr>
      <tr><td colspan="3"><div style="height:1px;background:#e8edf4;"></div></td></tr>`;
  }).join('');

  // Evidence photos grid
  const evidencePhotosHtml = photos.length > 0 ? (() => {
    const cols = Math.min(photos.length, 4);
    const colPct = Math.floor(100 / cols);
    const cells = photos.map(p => `
      <td style="padding:0 5px 10px 0;vertical-align:top;width:${colPct}%;">
        <div style="border-radius:8px;overflow:hidden;border:2px solid #e2e8f0;">
          <img src="${p.data}" width="100%" style="display:block;height:64px;object-fit:cover;" alt="${p.label}">
        </div>
        <div style="font-size:10px;color:#64748b;text-align:center;margin-top:4px;line-height:1.3;">${p.label}</div>
      </td>`).join('');
    return `
      <div style="margin-bottom:14px;">
        <div style="font-size:12px;color:#667892;font-weight:700;margin-bottom:10px;text-transform:uppercase;letter-spacing:0.5px;">Evidence Photos (${photos.length} of 7)</div>
        <table cellpadding="0" cellspacing="0" width="100%"><tr>${cells}</tr></table>
      </div>
      <div style="height:1px;background:#e8edf4;margin-bottom:14px;"></div>`;
  })() : '';

  // Other Party field renderer — shows value, captured photo, or "Not captured"
  const renderOpField = (label, value, isEmpty, photoData) => {
    if (!isEmpty) {
      return `
        <tr>
          <td style="padding:9px 0;color:#667892;font-size:13px;border-bottom:1px solid #E5EEF2;">${label}</td>
          <td style="padding:9px 0;font-size:13px;font-weight:600;text-align:right;border-bottom:1px solid #E5EEF2;">${value}</td>
        </tr>`;
    } else if (photoData) {
      return `
        <tr>
          <td colspan="2" style="padding:10px 0;border-bottom:1px solid #E5EEF2;">
            <div style="color:#667892;font-size:13px;font-weight:600;margin-bottom:8px;">${label}</div>
            <table cellpadding="0" cellspacing="0"><tr>
              <td style="padding-right:10px;vertical-align:middle;">
                <img src="${photoData}" style="height:52px;width:auto;max-width:120px;object-fit:cover;border-radius:7px;border:2px solid #e2e8f0;display:block;">
              </td>
              <td style="font-size:11px;color:#667892;font-style:italic;vertical-align:middle;">Image captured &middot; details not extracted</td>
            </tr></table>
          </td>
        </tr>`;
    } else {
      return `
        <tr>
          <td style="padding:9px 0;color:#667892;font-size:13px;border-bottom:1px solid #E5EEF2;">${label}</td>
          <td style="padding:9px 0;font-size:13px;font-weight:600;color:#94a3b8;text-align:right;border-bottom:1px solid #E5EEF2;">Not captured</td>
        </tr>`;
    }
  };

  const nameIsEmpty   = !opName    || opName    === 'Unknown';
  const plateIsEmpty  = !opPlate   || opPlate   === 'Not captured';
  const insurIsEmpty  = !opInsurer || opInsurer === 'Not captured';

  const generatedAt = new Date().toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', timeZoneName: 'short'
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>CollisionIQ Incident Report</title>
</head>
<body style="margin:0;padding:0;background:#ECECEC;font-family:'Helvetica Neue',Arial,sans-serif;color:#1B2431;">

  <!-- HEADER -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#1B2431;">
    <tr><td style="padding:14px 20px;">
      <table cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="padding-right:14px;vertical-align:middle;">
          <img src="https://www.lytx.com/img/logo-light.svg" alt="Lytx" height="26" style="display:block;">
        </td>
        <td style="border-left:1px solid rgba(255,255,255,0.22);padding-left:14px;vertical-align:middle;">
          <span style="color:white;font-weight:700;font-size:15px;letter-spacing:-0.2px;">CollisionIQ</span>
        </td>
      </tr></table>
    </td></tr>
  </table>

  <!-- BODY -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr><td style="padding:18px 16px 24px;">

      <!-- Title row -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">
        <tr>
          <td>
            <div style="font-size:18px;font-weight:700;color:#4C84FF;">Incident Report</div>
            <div style="color:#667892;font-size:12px;margin-top:3px;">Generated ${generatedAt}</div>
          </td>
          <td style="text-align:right;vertical-align:top;">
            <span style="background:#E5EEF2;color:#4C84FF;padding:4px 10px;border-radius:20px;font-size:12px;font-weight:700;">${eventId}</span>
          </td>
        </tr>
      </table>

      <!-- AI Narrative -->
      <div style="background:white;border-radius:12px;padding:18px;margin-bottom:12px;box-shadow:0 1px 4px rgba(27,36,49,0.08);">
        <div style="font-weight:700;color:#4C84FF;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;">AI-Generated Narrative</div>
        <div style="background:#f8fafc;border-radius:8px;padding:14px;font-size:14px;line-height:1.7;color:#1B2431;">${narrative || '(Narrative unavailable)'}</div>
      </div>

      <!-- Event Summary -->
      <div style="background:white;border-radius:12px;padding:18px;margin-bottom:12px;box-shadow:0 1px 4px rgba(27,36,49,0.08);">
        <div style="font-weight:700;color:#4C84FF;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;">Event Summary</div>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr><td style="padding:9px 0;color:#667892;font-size:13px;border-bottom:1px solid #E5EEF2;">Date &amp; Time</td><td style="padding:9px 0;font-size:13px;font-weight:600;text-align:right;border-bottom:1px solid #E5EEF2;">Mar 24, 2026 &middot; 2:47 PM</td></tr>
          <tr><td style="padding:9px 0;color:#667892;font-size:13px;border-bottom:1px solid #E5EEF2;">Location</td><td style="padding:9px 0;font-size:13px;font-weight:600;text-align:right;border-bottom:1px solid #E5EEF2;">I-15 N, Exit 42, Las Vegas NV</td></tr>
          <tr><td style="padding:9px 0;color:#667892;font-size:13px;border-bottom:1px solid #E5EEF2;">Vehicle</td><td style="padding:9px 0;font-size:13px;font-weight:600;text-align:right;border-bottom:1px solid #E5EEF2;">Unit #4821 &mdash; 2023 Ford F-150</td></tr>
          <tr><td style="padding:9px 0;color:#667892;font-size:13px;border-bottom:1px solid #E5EEF2;">Speed at Impact</td><td style="padding:9px 0;font-size:13px;font-weight:600;text-align:right;color:#c2410c;border-bottom:1px solid #E5EEF2;">34 mph</td></tr>
          <tr><td style="padding:9px 0;color:#667892;font-size:13px;">G-Force</td><td style="padding:9px 0;font-size:13px;font-weight:600;text-align:right;color:#dc2626;">8.2g (Severe)</td></tr>
        </table>
      </div>

      <!-- Pre-Collision Track -->
      <div style="background:white;border-radius:12px;padding:18px;margin-bottom:12px;box-shadow:0 1px 4px rgba(27,36,49,0.08);">
        <div style="font-weight:700;color:#4C84FF;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">&#x1F5FA;&#xFE0F; Pre-Collision Track</div>
        <div style="font-size:12px;color:#667892;margin-bottom:14px;">10 min leading to event &middot; Speed &middot; Weather &middot; Traffic</div>

        <!-- Conditions -->
        <div style="margin-bottom:14px;">
          <span style="display:inline-block;background:#e0f2fe;color:#0369a1;padding:4px 8px;border-radius:16px;font-size:11px;font-weight:700;margin:0 4px 4px 0;">&#x2600;&#xFE0F; Clear &middot; 72&deg;F</span>
          <span style="display:inline-block;background:#f0fdf4;color:#15803d;padding:4px 8px;border-radius:16px;font-size:11px;font-weight:700;margin:0 4px 4px 0;">&#x1F6E3;&#xFE0F; Dry roads</span>
          <span style="display:inline-block;background:#fff7ed;color:#c2410c;padding:4px 8px;border-radius:16px;font-size:11px;font-weight:700;margin:0 4px 4px 0;">&#x1F6A6; Moderate traffic</span>
          <span style="display:inline-block;background:#f3e8ff;color:#7e22ce;padding:4px 8px;border-radius:16px;font-size:11px;font-weight:700;margin:0 4px 4px 0;">&#x1F4E1; Lytx telemetry</span>
        </div>

        <!-- Map link -->
        <div style="margin-bottom:14px;">
          <a href="https://www.google.com/maps/search/?api=1&query=36.154,-115.168" style="display:inline-block;background:#f1f5f9;border:1.5px solid #E5EEF2;border-radius:8px;padding:8px 14px;font-size:12px;font-weight:700;color:#4C84FF;text-decoration:none;">&#x1F5FA;&#xFE0F; View Impact Location on Map &rarr;</a>
        </div>

        <!-- Speed timeline -->
        <div style="background:#f8fafc;border-radius:8px;padding:14px;">
          <div style="font-size:12px;font-weight:700;color:#667892;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;">Speed Timeline</div>
          <table width="100%" cellpadding="0" cellspacing="0" border="0">${timelineRows}</table>
        </div>

        <!-- Legend -->
        <div style="margin-top:10px;">
          <span style="margin-right:12px;"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#16a34a;margin-right:4px;vertical-align:middle;"></span><span style="font-size:11px;color:#667892;">&le;55 mph</span></span>
          <span style="margin-right:12px;"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#f59e0b;margin-right:4px;vertical-align:middle;"></span><span style="font-size:11px;color:#667892;">56&ndash;65 mph</span></span>
          <span style="margin-right:12px;"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#ea580c;margin-right:4px;vertical-align:middle;"></span><span style="font-size:11px;color:#667892;">66&ndash;75 mph</span></span>
          <span><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#dc2626;margin-right:4px;vertical-align:middle;"></span><span style="font-size:11px;color:#667892;">Impact</span></span>
        </div>
        <div style="font-size:11px;color:#94a3b8;margin-top:10px;line-height:1.5;">&#9432; Weather and traffic data are simulated for this demo. Production integration pulls live data from Lytx telematics, NOAA, and real-time traffic APIs.</div>
      </div>

      <!-- Evidence Collected -->
      <div style="background:white;border-radius:12px;padding:18px;margin-bottom:12px;box-shadow:0 1px 4px rgba(27,36,49,0.08);">
        <div style="font-weight:700;color:#4C84FF;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;">Evidence Collected</div>
        ${evidencePhotosHtml}
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr><td style="padding:9px 0;color:#667892;font-size:13px;border-bottom:1px solid #E5EEF2;">Photos captured</td><td style="padding:9px 0;font-size:13px;font-weight:600;text-align:right;border-bottom:1px solid #E5EEF2;">${photoCount} of 7</td></tr>
          <tr><td style="padding:9px 0;color:#667892;font-size:13px;border-bottom:1px solid #E5EEF2;">Lytx video clip</td><td style="padding:9px 0;font-size:13px;font-weight:600;text-align:right;color:#16a34a;border-bottom:1px solid #E5EEF2;">&#x2713; Auto-captured</td></tr>
          <tr><td style="padding:9px 0;color:#667892;font-size:13px;">Telemetry data</td><td style="padding:9px 0;font-size:13px;font-weight:600;text-align:right;color:#16a34a;">&#x2713; Auto-captured</td></tr>
        </table>
      </div>

      <!-- Other Party -->
      <div style="background:white;border-radius:12px;padding:18px;margin-bottom:24px;box-shadow:0 1px 4px rgba(27,36,49,0.08);">
        <div style="font-weight:700;color:#4C84FF;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;">Other Party</div>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          ${renderOpField('Name', opName, nameIsEmpty, scanPhotos.dl)}
          ${renderOpField('License Plate', opPlate, plateIsEmpty, scanPhotos.plate)}
          ${renderOpField('Insurance', opInsurer, insurIsEmpty, scanPhotos.insurance)}
          <tr>
            <td style="padding:9px 0;color:#667892;font-size:13px;">Police Report</td>
            <td style="padding:9px 0;font-size:13px;font-weight:600;text-align:right;">${policeReport}</td>
          </tr>
        </table>
      </div>

      <!-- Footer -->
      <div style="text-align:center;padding-bottom:8px;">
        <div style="font-size:11px;color:#94a3b8;line-height:1.7;">
          Generated by CollisionIQ &middot; Powered by Lytx<br>
          Automatically generated from Lytx event data for FNOL processing &middot; Event ID: ${eventId}
        </div>
      </div>

    </td></tr>
  </table>

</body>
</html>`;

  try {
    const { data, error } = await resend.emails.send({
      from: 'CollisionIQ <onboarding@resend.dev>',
      to: [to],
      subject: `CollisionIQ Incident Report \u2014 ${eventId}`,
      html
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: error.message || 'Failed to send email' });
    }

    return res.status(200).json({ success: true, id: data?.id });
  } catch (err) {
    console.error('Send email error:', err);
    return res.status(500).json({ error: err.message || 'Failed to send email' });
  }
}
