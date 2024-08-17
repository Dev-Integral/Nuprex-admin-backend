const Admin = require("../models/Admin");
const generateToken = require("../utils/generateToken");
const sendEmail = require("../utils/sendEmail");
const { v4: uuidv4 } = require("uuid");
const codeGenerator = require("../utils/codeGenerator");
const path = require("path");
const ejs = require("ejs");
const sequelize = require("../models");

// Register a new user (only accessible to superadmins)
exports.register = async (req, res) => {
  const { fullname, email, role, password } = req.body;

  try {
    // Check if the user already exists
    const existingAdmin = await Admin.findOne({ where: { email } });
    if (existingAdmin) {
      return res
        .status(400)
        .json({ error: "Admin with this email already exists" });
    }

    // Generate a unique reference for the new admin and verification pin
    const adminId = uuidv4();
    const emailProofToken = codeGenerator(6, "numeric");
    const emailProofTokenExpiresAt = new Date();
    emailProofTokenExpiresAt.setHours(emailProofTokenExpiresAt.getHours() + 1);

    const admin = await Admin.create({
      fullname,
      email,
      role,
      password,
      adminId,
      emailProofToken,
      emailProofTokenExpiresAt,
    });

    // Define the path to the email template
    const templatePath = path.join(__dirname, "../views/pinEmailTemplate.ejs");

    // Render the email template with the PIN
    const html = await ejs.renderFile(templatePath, {
      pin: emailProofToken,
      fullname,
    });

    // Send the email
    await sendEmail({
      email: admin.email,
      subject: "Nuprex - Email Verification",
      message: `Your verification PIN is: ${emailProofToken}`, // Fallback text-only version
      html,
    });
    res.status(201).json({
      message: "Admin created Successfully, Verify Email to login",
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Login a user
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ where: { email } });

    if (!admin || !(await admin.validPassword(password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    if (!admin.isEnabled) {
      return res.status(403).json({
        message: "Your account is not verified",
      });
    }
    const token = generateToken(admin.adminId);

    res.status(200).json({
      success: true,
      admin: { email: admin.email, fullname: admin.fullname },
      token,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const admin = await Admin.findOne({ where: { email } });

    if (!admin) {
      return res.status(404).json({ error: "No user found with that email" });
    }

    const resetPassword = codeGenerator(4, "numeric");
    admin.resetPasswordToken = resetPassword;
    admin.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await admin.save();

    const message = `You are receiving this email because you initiated a forgot password. Use this OTP to reset password: ${resetPassword}`;
    // Define the path to the email template
    const templatePath = path.join(__dirname, "../views/forgotPasswordTemplate.ejs");

    // Render the email template with the PIN
    const html = await ejs.renderFile(templatePath, {
      otp: resetPassword,
      fullname: admin.fullname,
    });
    try {
      await sendEmail({
        email: admin.email,
        subject: "Nuprex - Password Reset Initiated",
        message,
        html
      });

      res.status(200).json({ message: "Email sent successfully" });
    } catch (err) {
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();

      res.status(500).json({ error: "Email could not be sent" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  const resetPasswordToken = req.params.token

  try {
    const admin = await Admin.findOne({
      where: {
        resetPasswordToken,
      },
    });

    if (!admin) {
      return res
        .status(400)
        .json({ error: "Invalid token or token has expired" });
    }
    if(Date.now() > admin.resetPasswordExpires){
      return res.status(400).json({error: "Token has expired"})
    }
    admin.password = req.body.password;
    admin.resetPasswordToken = null;
    admin.resetPasswordExpires = null;
    await admin.save();

    res
      .status(200)
      .json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Verify Email
exports.verifyEmail = async (req, res) => {
  const { token, email } = req.body;
  console.log("HERE");

  const admin = await Admin.findOne({
    where: {
      email: email,
      emailProofToken: token,
    },
  });
  if (!admin) {
    return res.status(404).json({ message: "Invalid token" });
  }
  if (Date.now() > admin.emailProofTokenExpiresAt) {
    const newToken = codeGenerator(6, "numeric");
    admin.emailProofToken = newToken;
    admin.emailProofTokenExpiresAt = new Date().setHours(
      emailProofTokenExpiresAt.getHours() + 1
    );
    await admin.save();
    // Define the path to the email template
    console.log("Admin expired");
    const templatePath = path.join(__dirname, "../views/pinEmailTemplate.ejs");

    // Render the email template with the PIN
    const html = await ejs.renderFile(templatePath, {
      pin: newToken,
      fullname: admin.fullname,
    });

    // Send the email
    await sendEmail({
      email: admin.email,
      subject: "Nuprex - Email Verification",
      message: `Your verification PIN is: ${newToken}`, // Fallback text-only version
      html,
    });

    return res
      .status(404)
      .json({ message: "Token has expired, check email for a new token." });
  }
  // If time has not expired
  admin.emailProofToken = null;
  admin.emailProofTokenExpiresAt = null;
  admin.isEnabled = true;
  await admin.save();

  // Define the path to the email template
  console.log("valid");
  const templatePath = path.join(
    __dirname,
    "../views/emailVerificationTemplate.ejs"
  );

  // Render the email template with the PIN
  const html = await ejs.renderFile(templatePath, {
    fullname: admin.fullname,
  });

  // Send the email
  await sendEmail({
    email: admin.email,
    subject: "Nuprex - Account Activated",
    message: `Your account has been activated, please proceed to log in`, // Fallback text-only version
    html,
  });
  res.status(200).json({
    message: "Account Activated successfully",
  });
};
