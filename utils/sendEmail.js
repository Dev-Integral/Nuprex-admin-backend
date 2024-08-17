const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (options) => {
  const msg = {
    to: options.email, // Recipient email address
    from: process.env.SENDGRID_EMAIL, // Sender email address (must be verified with SendGrid)
    subject: options.subject, // Email subject
    text: options.message, // Plain text body
    html: options.html || null, // HTML body (if any)
  };

  try {
    await sgMail.send(msg);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error.response ? error.response.body : error.message);
    throw new Error('Email could not be sent');
  }
};

module.exports = sendEmail;
