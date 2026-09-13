import fs from 'fs';
const key = process.env.RESEND_API_KEY;
if (!key) { console.error('RESEND_API_KEY not set'); process.exit(1); }

const thesis = fs.readFileSync('/Users/thefuckingman/.cline/data/workspaces/chat/quartermaster/THESIS.md', 'utf-8');
const html = thesis
  .replace(/^### (.+)$/gm, '<h3 style="color:#c9a227;">$1</h3>')
  .replace(/^## (.+)$/gm, '<h2 style="color:#c9a227;">$1</h2>')
  .replace(/^# (.+)$/gm, '<h1 style="color:#c9a227;">$1</h1>')
  .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  .replace(/^- (.+)$/gm, '<li>$1</li>')
  .replace(/^\| (.+)$/gm, (m) => {
    const cells = m.split('|').filter(c => c.trim());
    return '<tr>' + cells.map(c => `<td style="padding:8px;border:1px solid #e5e5e5;">${c.trim()}</td>`).join('') + '</tr>';
  })
  .replace(/\n\n/g, '</p><p style="margin:12px 0;">')
  .replace(/\n/g, '<br>');

const body = {
  from: 'CATALYST <digest@agentdatasync.com>',
  to: ['youngprivatecapital@gmail.com'],
  subject: 'Your Thesis: CATALYST — The Token-Maxing Operating System',
  html: `<div style="font-family:system-ui;max-width:600px;margin:0 auto;padding:20px;color:#222;">
    <p style="margin:12px 0;">${html}</p>
  </div>`,
};

const res = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});
const data = await res.json();
console.log(res.ok ? `✅ Email sent! ID: ${data.id}` : `❌ Error: ${JSON.stringify(data)}`);
