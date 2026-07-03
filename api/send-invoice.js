const sgMail = require('@sendgrid/mail');
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const SHOP_EMAIL = process.env.SHOP_EMAIL; // your dad's Gmail, set in Vercel env vars
const FROM_EMAIL = process.env.FROM_EMAIL; // verified SendGrid sender email

function buildInvoiceHTML(data) {
  const { name, phone, vehicle, odometer, date, lines, partsTotal, laborTotal, grandTotal, wParts, wLabor } = data;

  const formatDate = (val) => {
    if (!val) return '';
    const [y, m, d] = val.split('-');
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    return `${months[parseInt(m)-1]} ${parseInt(d)}, ${y}`;
  };

  const rowsHTML = lines.map(l => `
    <tr>
      <td style="padding:12px 14px; border-top:1px solid #e5e7eb; font-size:14px; color:#111;">${l.svc}</td>
      <td style="padding:12px 14px; border-top:1px solid #e5e7eb; font-size:14px; text-align:right; font-weight:700; color:#111;">$${parseFloat(l.parts).toFixed(2)}</td>
      <td style="padding:12px 14px; border-top:1px solid #e5e7eb; font-size:14px; text-align:right; font-weight:700; color:#111;">$${parseFloat(l.labor).toFixed(2)}</td>
      <td style="padding:12px 14px; border-top:1px solid #e5e7eb; font-size:14px; text-align:right; font-weight:700; color:#111;">$${(parseFloat(l.parts) + parseFloat(l.labor)).toFixed(2)}</td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #fff; color: #111; padding: 48px; font-size: 14px; line-height: 1.5; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; }
    .shop-name { font-size: 22px; font-weight: 800; color: #111; }
    .shop-name span { color: #8a0e18; }
    .shop-info { font-size: 12px; color: #6b7280; margin-top: 4px; line-height: 1.7; }
    .inv-meta { text-align: right; }
    .inv-label { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 700; color: #9ca3af; }
    .inv-date { font-size: 16px; font-weight: 700; color: #374151; margin-top: 2px; }
    hr { border: none; border-top: 2px solid #111; margin: 0 0 22px; }
    .section-label { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; font-weight: 700; color: #9ca3af; margin-bottom: 6px; }
    .customer-name { font-size: 17px; font-weight: 700; color: #111; }
    .customer-sub { font-size: 13px; color: #6b7280; margin-top: 2px; }
    .vehicle { font-size: 13px; color: #374151; font-weight: 600; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; margin: 24px 0; }
    thead tr { background: #f3f4f6; }
    th { padding: 10px 14px; text-align: left; font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 700; color: #6b7280; }
    th.right { text-align: right; }
    .totals { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
    .totals-row { display: flex; gap: 40px; justify-content: flex-end; }
    .totals-label { font-size: 12px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; min-width: 120px; text-align: right; }
    .totals-val { font-size: 14px; font-weight: 700; color: #111; min-width: 80px; text-align: right; }
    .totals-grand { border-top: 2px solid #111; margin-top: 8px; padding-top: 10px; }
    .totals-grand .totals-label { color: #111; font-size: 13px; }
    .totals-grand .totals-val { font-size: 24px; font-weight: 800; color: #111; }
    .terms { margin-top: 32px; padding: 20px; background: #f9fafb; border-radius: 8px; font-size: 11px; color: #4b5563; line-height: 1.75; }
    .terms-title { font-size: 11px; font-weight: 700; color: #111; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 12px; }
    .terms h4 { font-size: 11px; font-weight: 700; color: #374151; margin: 10px 0 3px; }
    .terms ul { padding-left: 16px; }
    .terms ul li { margin-bottom: 2px; }
    .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; text-align: center; line-height: 1.7; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="shop-name">Mary's <span>Automotive</span></div>
      <div class="shop-info">
        3249 W Washington St, Indianapolis, IN 46222<br>
        (317) 491-3393 &nbsp;·&nbsp; marysautomotive.com
      </div>
    </div>
    <div class="inv-meta">
      <div class="inv-label">Date</div>
      <div class="inv-date">${formatDate(date)}</div>
    </div>
  </div>

  <hr />

  <div>
    <div class="section-label">Bill To</div>
    <div class="customer-name">${name}</div>
    ${phone    ? `<div class="customer-sub">${phone}</div>` : ''}
    ${vehicle  ? `<div class="vehicle">${vehicle}</div>` : ''}
    ${odometer ? `<div class="customer-sub">Odometer: ${odometer}</div>` : ''}
  </div>

  <table>
    <thead>
      <tr>
        <th>Service</th>
        <th class="right">Parts</th>
        <th class="right">Labor</th>
        <th class="right">Line Total</th>
      </tr>
    </thead>
    <tbody>${rowsHTML}</tbody>
  </table>

  <div class="totals">
    <div class="totals-row">
      <span class="totals-label">Parts Total</span>
      <span class="totals-val">$${parseFloat(partsTotal).toFixed(2)}</span>
    </div>
    <div class="totals-row">
      <span class="totals-label">Labor Total</span>
      <span class="totals-val">$${parseFloat(laborTotal).toFixed(2)}</span>
    </div>
    <div class="totals-row totals-grand">
      <span class="totals-label">Grand Total</span>
      <span class="totals-val">$${parseFloat(grandTotal).toFixed(2)}</span>
    </div>
  </div>

  <div class="terms">
    <div class="terms-title">Terms and Conditions</div>
    <h4>Warranty Period</h4>
    This labor warranty is valid for ${wLabor} days from the date of service (${formatDate(date)}). This parts warranty is valid for ${wParts} days from the date of service (${formatDate(date)}).
    <h4>Coverage Scope</h4>
    This warranty applies to any defects in materials or workmanship that arise during normal use of the serviced vehicle.
    <h4>Exclusions</h4>
    This warranty does not cover:
    <ul>
      <li>Damage resulting from accidents, misuse, or neglect, including running vehicle hot.</li>
      <li>Normal wear and tear.</li>
      <li>Parts not supplied by Mary's Auto Transport.</li>
      <li>Any repairs or alterations made by parties other than Mary's Auto Transport.</li>
    </ul>
    <h4>Claims Procedure</h4>
    <ul>
      <li>To make a warranty claim, the customer must present the original invoice or proof of service completion and copy of routine maintenance such as oil changes.</li>
      <li>Customers must notify Mary's Auto Transport of any potential warranty claims within seven (7) days of discovering the issue.</li>
      <li>Mary's Auto Transport reserves the right to inspect the vehicle and/or parts in question to verify the warranty claim.</li>
    </ul>
    <h4>Resolution</h4>
    <ul>
      <li>If a defect covered by this warranty is found, Mary's Auto Transport will, at its discretion, repair or replace the defective part(s) or correct the faulty workmanship at no additional cost to the customer.</li>
      <li>If repair or replacement is not feasible, Mary's Auto Transport may provide a refund for the original cost of the service.</li>
    </ul>
    <h4>Limitations of Liability</h4>
    <ul>
      <li>Mary's Auto Transport shall not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with this warranty.</li>
      <li>Mary's Auto Transport's liability under this warranty is limited solely to the repair, replacement, or refund as outlined in this agreement.</li>
    </ul>
    <h4>Transferability</h4>
    This warranty is non-transferable and applies only to the original customer who received the service from Mary's Auto Transport.
    <h4>Voiding of Warranty</h4>
    This warranty will be void if:
    <ul>
      <li>The serviced vehicle is used for racing, competition, or other non-standard purposes.</li>
      <li>The vehicle's odometer has been tampered with.</li>
      <li>The customer fails to follow proper maintenance and care instructions provided by Mary's Auto Transport.</li>
    </ul>
    <h4>Governing Law</h4>
    This warranty shall be governed by the laws of Indiana, and any disputes arising under or in connection with this warranty shall be resolved exclusively in the courts of Indiana.
    <p style="margin-top:12px; font-style:italic;">By accepting services from Mary's Auto Transport, the customer acknowledges and agrees to the terms and conditions of this warranty.</p>
  </div>

  <div class="footer">
    Thank you for your business!<br>
    Should you have any inquiries concerning this invoice, please contact us at (317) 491-3393.
  </div>
</body>
</html>`;
}

module.exports = async (req, res) => {
  // CORS headers so GitHub Pages can call this API
  const allowedOrigins = ['https://marysautomotive.com', 'https://marys-automotive.vercel.app'];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const data = req.body;

    if (!data.name || !data.customerEmail) {
      return res.status(400).json({ error: 'Customer name and email are required.' });
    }

    // Generate PDF with Puppeteer
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setContent(buildInvoiceHTML(data), { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: { top: '0.5in', bottom: '0.5in', left: '0.5in', right: '0.5in' }
    });
    await browser.close();

    const pdfBase64 = Buffer.from(pdfBuffer).toString('base64');

    // Send email via SendGrid
    await sgMail.send({
      to: data.customerEmail,
      cc: SHOP_EMAIL,
      from: {
        email: FROM_EMAIL,
        name: "Mary's Automotive"
      },
      subject: `Your Invoice from Mary's Automotive`,
      text: `Hi ${data.name},\n\nPlease find your invoice attached.\n\nThank you for choosing Mary's Automotive!\n(317) 491-3393\n3249 W Washington St, Indianapolis, IN 46222`,
      html: `<p>Hi ${data.name},</p><p>Please find your invoice attached.</p><p>Thank you for choosing Mary's Automotive!<br>(317) 491-3393<br>3249 W Washington St, Indianapolis, IN 46222</p>`,
      attachments: [
        {
          content: pdfBase64,
          filename: `Marys-Automotive-Invoice-${data.name.replace(/\s+/g, '-')}.pdf`,
          type: 'application/pdf',
          disposition: 'attachment'
        }
      ]
    });

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to send invoice. Please try again.' });
  }
};
