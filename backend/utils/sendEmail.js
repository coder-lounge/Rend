const nodemailer = require('nodemailer');

/**
 * Send email utility
 * In production: Uses configured email provider (SendGrid, Mailgun, etc.)
 * In development: Logs to console or stores in database for testing
 */
const sendEmail = async (options) => {
  // Destructure options
  const { email, subject, message } = options;

  // Check if we're in production or development
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    // Production email sending logic
    // This can be configured to use SendGrid, Mailgun, Resend, etc.
    // Example using nodemailer with a service like SendGrid:
    
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE, // 'SendGrid', 'Mailgun', etc.
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Mail options
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject,
      text: message
    };

    // Send email
    await transporter.sendMail(mailOptions);
    
    console.log(`Email sent to ${email}`);
  } else {
    // Development mode - log to console
    console.log('==========================================');
    console.log('EMAIL SENDING SIMULATION (DEVELOPMENT MODE)');
    console.log('==========================================');
    console.log(`To: ${email}`);
    console.log(`Subject: ${subject}`);
    console.log('------------------------------------------');
    console.log(message);
    console.log('==========================================');
    
    // You could also store this in a database for testing if needed
    // Example: await ResetEmail.create({ email, subject, message, sentAt: Date.now() });
  }
};

module.exports = sendEmail;