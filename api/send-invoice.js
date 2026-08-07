const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const SHOP_EMAIL = process.env.SHOP_EMAIL;
const FROM_EMAIL = process.env.FROM_EMAIL;
const INVOICE_STORAGE = process.env.INVOICE_STORAGE;

module.exports = async (req, res) => {
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
    const { name, customerEmail, pdfBase64 } = req.body;

    if (!name || !customerEmail || !pdfBase64) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    await sgMail.send({
      to: customerEmail,
      cc: [SHOP_EMAIL, INVOICE_STORAGE],
      from: {
        email: FROM_EMAIL,
        name: "Mary's Automotive"
      },
      subject: `Your Invoice from Mary's Automotive`,
      text: `Hi ${name},\n\nPlease find your invoice attached.\n\nThank you for choosing Mary's Automotive!\n(317) 491-3393\n3249 W Washington St, Indianapolis, IN 46222`,
      html: `<p>Hi ${name},</p><p>Please find your invoice attached.</p><p>Thank you for choosing Mary's Automotive!<br>(317) 491-3393<br>3249 W Washington St, Indianapolis, IN 46222</p>`,
      attachments: [
        {
          content: pdfBase64,
          filename: `Marys-Automotive-Invoice-${name.replace(/\s+/g, '-')}.pdf`,
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
