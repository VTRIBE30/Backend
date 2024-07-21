const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");

// Create a transporter using your email service provider credentials
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  service: "gmail",
  port: 587,
  secure: true,
  auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSCODE,
  },
  tls: {
      rejectUnauthorized: false
  }
});

exports.sendContactEmail = async (recipientEmail, templateData) => {
  try {
    const templatePath = path.join(
      __dirname,
      "../views/contact-email-template.ejs"
    );

    const emailTemplate = await ejs.renderFile(templatePath, templateData);
    // console.log("Email: ", process.env.EMAIL_USER)

    const mailOptions = {
      from: `"Banky" ${process.env.EMAIL_USER}`,
      to: recipientEmail,
      subject: "Message Alert!! 👋",
      html: emailTemplate,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending contact email:", error);
    throw new Error("An error occurred while sending the contact mail");
  }
};

exports.sendWelcomeEmail = async (recipientEmail, templateData, next) => {
  try {
    const templatePath = path.join(
      __dirname,
      "../views/email_verification_template.ejs"
    );

    const emailTemplate = await ejs.renderFile(templatePath, templateData);
    // console.log("Email: ", process.env.EMAIL_USER)

    const mailOptions = {
      from: `"VTribe" ${process.env.EMAIL_USER}`,
      to: recipientEmail,
      subject: "Welcome to VTribe! 👋",
      html: emailTemplate,
    };

    await transporter.sendMail(mailOptions);
    // console.log(`Verification email sent to ${recipientEmail}`);
  } catch (error) {
    next(error)
  }
};

exports.sendOTPRequest = async (recipientEmail, templateData, next) => {
  try {
    const templatePath = path.join(
      __dirname,
      "../views/otp_template.ejs"
    );

    const emailTemplate = await ejs.renderFile(templatePath, templateData);
    // console.log("Email: ", process.env.EMAIL_USER)

    const mailOptions = {
      from: `"VTribe" ${process.env.EMAIL_USER}`,
      to: recipientEmail,
      subject: "OTP request",
      html: emailTemplate,
    };

    await transporter.sendMail(mailOptions);
    // console.log(`Verification email sent to ${recipientEmail}`);
  } catch (error) {
    next(error)
  }
};

exports.sendPasswordResetEmail = async (recipientEmail, templateData, next) => {
  try {
    const templatePath = path.join(
      __dirname,
      "../views/password_reset_template.ejs"
    );

    const emailTemplate = await ejs.renderFile(templatePath, templateData);
    // console.log("Email: ", process.env.EMAIL_USER)

    const mailOptions = {
      from: `"VTribe" ${process.env.EMAIL_USER}`,
      to: recipientEmail,
      subject: "Password Reset OTP",
      html: emailTemplate,
    };

    await transporter.sendMail(mailOptions);
    // console.log(`Verification email sent to ${recipientEmail}`);
  } catch (error) {
    next(error)
  }
};

// Function to send a login alert email
exports.sendLoginAlert = async (recipientEmail) => {
  try {
    const templateData = {
      recipientEmail,
    };

    const templatePath = path.join(
      __dirname,
      "../views/login-alert-template.ejs"
    );
    const emailTemplate = await ejs.renderFile(templatePath, templateData);

    const mailOptions = {
      from: `"Banky" ${process.env.EMAIL_USER}`,
      to: recipientEmail,
      subject: "Login Alert - Suspicious Activity Detected",
      html: emailTemplate,
    };

    await transporter.sendMail(mailOptions);
    // console.log('Login alert email sent successfully');
  } catch (error) {
    console.error("Error sending login alert email:", error);
    throw new Error("An error occurred while sending the login alert email");
  }
};

exports.sendFundingEmail = async (recipientEmail, templateData) => {
  try {
    const templatePath = path.join(
      __dirname,
      "../views/fund-wallet-email-template.ejs"
    );
    const emailTemplate = await ejs.renderFile(templatePath, templateData);

    const mailOptions = {
      from: `"Banky" ${process.env.EMAIL_USER}`,
      to: recipientEmail,
      subject: "Fund Alert",
      html: emailTemplate,
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending fund alert email:", error);
    throw new Error("An error occurred while sending fund alert email");
  }
};

