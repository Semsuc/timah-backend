// utils/sendEmail.js
const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text, options = {}) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: Number(process.env.EMAIL_PORT) === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const {
      buttonText = null,
      buttonLink = null,
      highlight = null,
      orderItems = [], // array of items { name, qty, price }
      totalAmount = null,
    } = options;

    // Use your local logo path from public folder
    const logoUrl = `${process.env.FRONTEND_URL}/timah-logo.png`;

    // Generate order table HTML
    const orderTable = orderItems.length
      ? `<table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <thead>
            <tr>
              <th style="text-align:left; padding: 8px; border-bottom: 1px solid #ddd;">Item</th>
              <th style="text-align:center; padding: 8px; border-bottom: 1px solid #ddd;">Qty</th>
              <th style="text-align:right; padding: 8px; border-bottom: 1px solid #ddd;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${orderItems
              .map(
                (i) =>
                  `<tr>
                    <td style="padding: 8px; border-bottom: 1px solid #eee;">${i.name}</td>
                    <td style="padding: 8px; text-align:center; border-bottom: 1px solid #eee;">${i.qty}</td>
                    <td style="padding: 8px; text-align:right; border-bottom: 1px solid #eee;">$${i.price.toFixed(
                      2
                    )}</td>
                  </tr>`
              )
              .join("")}
          </tbody>
          ${
            totalAmount
              ? `<tfoot>
                  <tr>
                    <td colspan="2" style="padding: 10px; text-align:right; font-weight:bold;">Total</td>
                    <td style="padding: 10px; text-align:right; font-weight:bold;">$${totalAmount.toFixed(
                      2
                    )}</td>
                  </tr>
                </tfoot>`
              : ""
          }
        </table>`
      : "";

    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 30px auto; border-radius: 16px; overflow: hidden; box-shadow: 0 6px 18px rgba(0,0,0,0.12); border: 1px solid #eee;">
        
        <!-- Logo Header -->
        <div style="background: #fff; padding: 25px; text-align: center; border-bottom: 3px solid #f97316;">
          <a href="${process.env.FRONTEND_URL}" target="_blank" style="display: inline-block;">
            <img src="${logoUrl}" alt="Timah's Kitchen Logo" style="max-width: 160px; height: auto;" />
          </a>
        </div>

        <!-- Body -->
        <div style="padding: 30px; color: #1f2937; font-size: 15px; line-height: 1.7; background: #fff8f1; border-radius: 0 0 16px 16px;">
          ${
            highlight
              ? `<h2 style="color: #f97316; margin-bottom: 15px; font-size: 22px; font-weight: bold;">${highlight}</h2>`
              : ""
          }
          <p>${text.replace(/\n/g, "<br>")}</p>

          ${orderTable}

          ${
            buttonText && buttonLink
              ? `<div style="text-align: center; margin: 30px 0;">
                  <a href="${buttonLink}" target="_blank" style="
                    background: #f97316;
                    color: #fff;
                    padding: 14px 28px;
                    border-radius: 12px;
                    text-decoration: none;
                    font-weight: bold;
                    display: inline-block;
                    transition: all 0.3s ease;
                    box-shadow: 0 6px 12px rgba(249,115,22,0.4);
                  " onmouseover="this.style.background='#e25800'; this.style.boxShadow='0 8px 16px rgba(226,88,0,0.5)';" 
                     onmouseout="this.style.background='#f97316'; this.style.boxShadow='0 6px 12px rgba(249,115,22,0.4)';">
                    ${buttonText}
                  </a>
                </div>`
              : ""
          }
        </div>

        <!-- Footer -->
        <div style="background: #f9fafb; padding: 25px; text-align: center; font-size: 13px; color: #6b7280; border-top: 1px solid #eee;">
          © ${new Date().getFullYear()} Timah's Kitchen. <br/>
          <span style="color:#374151;">Delicious meals, delivered fresh.</span>

          <!-- Social Media -->
          <div style="margin-top: 15px; font-size: 14px; color: #374151; font-weight: bold;">
            Follow us on social media
          </div>
          <div style="margin-top: 10px;">
            <a href="https://www.instagram.com/your_instagram" target="_blank" style="margin: 0 8px; display: inline-block;">
              <img src="https://img.icons8.com/ios-filled/24/f97316/instagram-new.png" alt="Instagram" style="vertical-align: middle;"/>
            </a>
            <a href="https://www.facebook.com/your_facebook" target="_blank" style="margin: 0 8px; display: inline-block;">
              <img src="https://img.icons8.com/ios-filled/24/f97316/facebook-new.png" alt="Facebook" style="vertical-align: middle;"/>
            </a>
            <a href="https://wa.me/your_whatsapp" target="_blank" style="margin: 0 8px; display: inline-block;">
              <img src="https://img.icons8.com/ios-filled/24/f97316/whatsapp.png" alt="WhatsApp" style="vertical-align: middle;"/>
            </a>
          </div>
        </div>

        <!-- Mobile responsiveness -->
        <style>
          @media only screen and (max-width: 600px) {
            div[style*='padding: 30px'] {
              padding: 20px !important;
            }
            a[style*='padding: 14px 28px'] {
              padding: 12px 20px !important;
              font-size: 16px !important;
            }
            div[style*='margin-top: 10px'] a img {
              width: 20px !important;
              height: 20px !important;
            }
          }
        </style>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"Timah's Kitchen" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html: htmlTemplate,
    });

    console.log(`✅ Email sent: ${info.messageId} to ${to}`);
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error.message);
  }
};

module.exports = sendEmail;
