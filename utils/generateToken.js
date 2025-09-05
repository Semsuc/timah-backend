const nodemailer = require('nodemailer');
require('dotenv').config();

const sendEmail = async (options) => {
  try {
    if (!options.email) throw new Error('No recipient email provided');

    console.log("📧 Preparing to send email to:", options.email);
    console.log("📬 Subject:", options.subject);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false, // Safe in dev; avoid in prod unless necessary
      },
    });

    // Verify SMTP connection in development
    if (process.env.NODE_ENV !== 'production') {
      transporter.verify((err, success) => {
        if (err) console.error("SMTP connection error:", err);
        else console.log("✅ SMTP server ready to send mail");
      });
    }

    const mailOptions = {
      from: `"Blue Traders Forex" <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: options.message,
      text: options.text || 'Your email client does not support HTML format',
    };

    await Promise.race([
      transporter.sendMail(mailOptions),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Email sending timed out after 7 seconds")), 7000)
      ),
    ]);

    console.log('✅ Email sent successfully');
  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
    throw error;
  }
};

module.exports = sendEmail;
