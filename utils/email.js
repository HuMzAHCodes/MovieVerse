const nodemailer = require('nodemailer');
const logger     = require('./logger');

// =====================
// Email Transporter
// =====================
const transporter = nodemailer.createTransport({
  host:   process.env.EMAIL_HOST,
  port:   process.env.EMAIL_PORT,
  secure: false, // TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify Transporter (skip in test environment)
if (process.env.NODE_ENV !== 'test') {
  transporter.verify((error) => {
    if (error) {
      logger.error(`Email transporter error: ${error.message}`);
    } else {
      logger.info('Email transporter is ready');
    }
  });
}

// =====================
// Base Email Sender
// =====================
const sendEmail = async ({ to, subject, html }) => {
  // Skip sending emails in test environment
  if (process.env.NODE_ENV === 'test') {
    logger.info(`[TEST MODE] Email skipped for: ${to}`);
    return { messageId: 'test-mode' };
  }

  try {
    const mailOptions = {
      from:    process.env.EMAIL_FROM,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`Email sending failed: ${error.message}`);
    throw new Error('Email could not be sent');
  }
};

// =====================
// Welcome Email
// =====================
const sendWelcomeEmail = async (user) => {
  const html = `
    <div style="
      font-family: Arial, sans-serif;
      max-width: 600px;
      margin: 0 auto;
      background-color: #141414;
      color: #ffffff;
      padding: 40px;
      border-radius: 8px;
    ">
      <!-- Logo -->
      <h1 style="
        color: #e50914;
        font-size: 32px;
        margin-bottom: 24px;
        letter-spacing: 2px;
      ">
        NETFLIX CLONE
      </h1>

      <!-- Greeting -->
      <h2 style="font-size: 24px; margin-bottom: 16px;">
        Welcome, ${user.name}! 🎬
      </h2>

      <!-- Message -->
      <p style="
        color: #b3b3b3;
        font-size: 16px;
        line-height: 1.6;
        margin-bottom: 24px;
      ">
        Your account has been created successfully.
        You can now browse thousands of movies and
        TV shows, and create your personal watchlist.
      </p>

      <!-- CTA Button -->
      <a href="${process.env.APP_URL || 'http://localhost:3000'}/browse"
        style="
          display: inline-block;
          background-color: #e50914;
          color: #ffffff;
          padding: 12px 32px;
          border-radius: 4px;
          text-decoration: none;
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 24px;
        "
      >
        Start Watching
      </a>

      <!-- Footer -->
      <p style="
        color: #737373;
        font-size: 12px;
        margin-top: 32px;
        border-top: 1px solid #333;
        padding-top: 16px;
      ">
        This email was sent by Netflix Clone.
        If you did not create this account,
        please ignore this email.
      </p>
    </div>
  `;

  await sendEmail({
    to:      user.email,
    subject: 'Welcome to Netflix Clone 🎬',
    html,
  });
};

// =====================
// Password Reset Email
// =====================
const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.APP_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

  const html = `
    <div style="
      font-family: Arial, sans-serif;
      max-width: 600px;
      margin: 0 auto;
      background-color: #141414;
      color: #ffffff;
      padding: 40px;
      border-radius: 8px;
    ">
      <!-- Logo -->
      <h1 style="
        color: #e50914;
        font-size: 32px;
        margin-bottom: 24px;
        letter-spacing: 2px;
      ">
        NETFLIX CLONE
      </h1>

      <!-- Heading -->
      <h2 style="font-size: 24px; margin-bottom: 16px;">
        Password Reset Request 🔐
      </h2>

      <!-- Message -->
      <p style="
        color: #b3b3b3;
        font-size: 16px;
        line-height: 1.6;
        margin-bottom: 24px;
      ">
        Hi ${user.name}, we received a request to reset
        your password. Click the button below to reset it.
        This link will expire in <strong>10 minutes</strong>.
      </p>

      <!-- Reset Button -->
      <a href="${resetUrl}"
        style="
          display: inline-block;
          background-color: #e50914;
          color: #ffffff;
          padding: 12px 32px;
          border-radius: 4px;
          text-decoration: none;
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 24px;
        "
      >
        Reset Password
      </a>

      <!-- Warning -->
      <p style="
        color: #737373;
        font-size: 12px;
        margin-top: 32px;
        border-top: 1px solid #333;
        padding-top: 16px;
      ">
        If you did not request a password reset,
        please ignore this email. Your password
        will remain unchanged.
      </p>
    </div>
  `;

  await sendEmail({
    to:      user.email,
    subject: 'Password Reset Request — Netflix Clone',
    html,
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
};