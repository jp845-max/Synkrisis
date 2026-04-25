import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // false for port 587 (STARTTLS)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false, // Allow Titan's certificate
  },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    const mailOptions = {
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to,
      subject,
      html,
    };
    
    // In test environment, don't actually send emails unless we want to see logs
    if (process.env.NODE_ENV !== 'test') {
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent: %s', info.messageId);
    }
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// --- Email Templates ---

export const sendWelcomeEmail = async (user) => {
  await sendEmail({
    to: user.email,
    subject: 'Welcome to Synkrisis!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #4f46e5;">Welcome to Synkrisis!</h2>
        <p>Hi ${user.name},</p>
        <p>Thanks for joining Synkrisis. We're excited to have you on board.</p>
        <p>Head over to your dashboard to get started.</p>
        <a href="${process.env.FRONTEND_URL}/dashboard" style="display: inline-block; padding: 10px 20px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
      </div>
    `,
  });
};

export const sendNewApplicationNotifyArtist = async (artistEmail, projectTitle, builderName, applicationId) => {
  await sendEmail({
    to: artistEmail,
    subject: `New Application for ${projectTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #4f46e5;">New Application Received</h2>
        <p>Good news! <b>${builderName}</b> has applied to your project "<b>${projectTitle}</b>".</p>
        <p>Review their application and decide if you want to proceed to a contract.</p>
        <a href="${process.env.FRONTEND_URL}/project/${applicationId}" style="display: inline-block; padding: 10px 20px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 5px;">View Application</a>
      </div>
    `,
  });
};

export const sendNewApplicationNotifyAdmin = async (projectTitle, builderName) => {
  await sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: `ADMIN: New Application on ${projectTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif;">
        <p>Builder <b>${builderName}</b> just applied to "<b>${projectTitle}</b>".</p>
      </div>
    `,
  });
};

export const sendApplicationAccepted = async (builderEmail, projectTitle, contractId) => {
  await sendEmail({
    to: builderEmail,
    subject: `Application Accepted: ${projectTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #10b981;">Application Accepted!</h2>
        <p>Your application for "<b>${projectTitle}</b>" has been accepted.</p>
        <p>A draft contract has been created. Please review and accept it to begin the project.</p>
        <a href="${process.env.FRONTEND_URL}/contract/${contractId}" style="display: inline-block; padding: 10px 20px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 5px;">Review Contract</a>
      </div>
    `,
  });
};

export const sendApplicationRejected = async (builderEmail, projectTitle) => {
  await sendEmail({
    to: builderEmail,
    subject: `Update on your application: ${projectTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <p>Hi,</p>
        <p>Thank you for applying to "<b>${projectTitle}</b>". Unfortunately, the artist has decided to move forward with another candidate for this project.</p>
        <p>Keep exploring other opportunities on the dashboard!</p>
      </div>
    `,
  });
};

export const sendConsultingRequestNotifyAdmin = async (artistName, description, budget, skills) => {
  await sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: `ADMIN: New Consulting Request from ${artistName}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h3>New Consulting Request</h3>
        <p><b>Artist:</b> ${artistName}</p>
        <p><b>Description:</b> ${description}</p>
        <p><b>Budget:</b> ${budget}</p>
        <p><b>Skills Needed:</b> ${skills}</p>
      </div>
    `,
  });
};

export const sendScheduleCallNotifyAdmin = async (artistName, email) => {
  await sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: `ADMIN: Consulting Call Scheduled - ${artistName}`,
    html: `
      <div style="font-family: Arial, sans-serif;">
        <p>Artist <b>${artistName}</b> (${email}) wants to schedule a consulting call.</p>
        <p>Please check your Calendly and reach out to them.</p>
      </div>
    `,
  });
};

export const sendProviderMatched = async (artistEmail, projectTitle, providerName, contractId) => {
  await sendEmail({
    to: artistEmail,
    subject: `Provider Matched for your project!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #4f46e5;">We found a match!</h2>
        <p>Great news! We have matched your consulting request with <b>${providerName}</b>.</p>
        <p>A draft contract has been created. Please review and formally accept.</p>
        <a href="${process.env.FRONTEND_URL}/contract/${contractId}" style="display: inline-block; padding: 10px 20px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 5px;">Review Contract</a>
      </div>
    `,
  });
};

export const sendContractCreated = async (emails, projectTitle, contractId) => {
  await sendEmail({
    to: emails.join(','),
    subject: `Contract Created: ${projectTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #4f46e5;">Contract Ready for Review</h2>
        <p>A contract has been created for "<b>${projectTitle}</b>".</p>
        <p>Please review the milestones and terms, and click accept when you are ready.</p>
        <a href="${process.env.FRONTEND_URL}/contract/${contractId}" style="display: inline-block; padding: 10px 20px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 5px;">Review Contract</a>
      </div>
    `,
  });
};

export const sendContractAccepted = async (toEmail, actorRole, projectTitle, contractId) => {
  await sendEmail({
    to: toEmail,
    subject: `Contract Update: ${projectTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <p>The <b>${actorRole}</b> has accepted the contract for "<b>${projectTitle}</b>".</p>
        <p>We are just waiting for your acceptance to finalize it.</p>
        <a href="${process.env.FRONTEND_URL}/contract/${contractId}" style="display: inline-block; padding: 10px 20px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 5px;">Review Contract</a>
      </div>
    `,
  });
};

export const sendContractFullyActive = async (emails, projectTitle) => {
  await sendEmail({
    to: emails.join(','), // Artist + Provider + Admin
    subject: `Contract Active! ${projectTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #10b981;">Contract Active</h2>
        <p>Both parties have accepted the contract for "<b>${projectTitle}</b>".</p>
        <p>The project can officially begin!</p>
        <a href="${process.env.FRONTEND_URL}/dashboard" style="display: inline-block; padding: 10px 20px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
      </div>
    `,
  });
};

export const sendPaymentProcessed = async (providerEmail, projectTitle, amount) => {
  await sendEmail({
    to: [providerEmail, process.env.ADMIN_EMAIL].join(','),
    subject: `Payment Processed: ${projectTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #10b981;">Payment Processed</h2>
        <p>Great news! Payment of <b>₹${amount}</b> has been simulated/processed for "<b>${projectTitle}</b>".</p>
        <p>Funds will be released upon milestone completion.</p>
      </div>
    `,
  });
};

export const sendProviderApproved = async (providerEmail) => {
  await sendEmail({
    to: providerEmail,
    subject: `Account Approved!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #10b981;">Account Approved</h2>
        <p>Your provider account on Synkrisis has been approved by the administrators.</p>
        <p>You can now browse and apply to projects!</p>
        <a href="${process.env.FRONTEND_URL}/dashboard" style="display: inline-block; padding: 10px 20px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 5px;">Find Projects</a>
      </div>
    `,
  });
};
