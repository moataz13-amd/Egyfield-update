let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    try {
      const nodemailer = require('nodemailer');
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER || '',
          pass: process.env.SMTP_PASS || '',
        },
      });
    } catch (err) {
      console.warn('Email disabled — nodemailer not available:', err.message);
      return null;
    }
  }
  return transporter;
};

const sendInquiryNotification = async (inquiry) => {
  const t = getTransporter();
  if (!t) return;

  const to = process.env.NOTIFICATION_EMAIL || 'info@deltaharvest.com';

  const html = `
    <h2>New Inquiry Received</h2>
    <table style="border-collapse:collapse;width:100%;max-width:600px;">
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Name</td><td style="padding:8px;border:1px solid #ddd;">${inquiry.name}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Email</td><td style="padding:8px;border:1px solid #ddd;"><a href="mailto:${inquiry.email}">${inquiry.email}</a></td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Company</td><td style="padding:8px;border:1px solid #ddd;">${inquiry.company || '-'}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Country</td><td style="padding:8px;border:1px solid #ddd;">${inquiry.country || '-'}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Product Interest</td><td style="padding:8px;border:1px solid #ddd;">${inquiry.productInterest || '-'}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Message</td><td style="padding:8px;border:1px solid #ddd;">${inquiry.message}</td></tr>
    </table>
    <p style="color:#888;font-size:12px;">Received at ${new Date().toLocaleString()}</p>
  `;

  try {
    await t.sendMail({
      from: process.env.SMTP_FROM || `"Delta Harvest Inquiries" <${process.env.SMTP_USER || 'noreply@deltaharvest.com'}>`,
      to,
      subject: `New Inquiry from ${inquiry.name} — Delta Harvest`,
      html,
    });
    console.log('Inquiry email sent to', to);
  } catch (err) {
    console.error('Failed to send inquiry email:', err.message);
  }
};

module.exports = { sendInquiryNotification };
