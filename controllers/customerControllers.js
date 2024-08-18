const Customer = require("../models/Customer");
const codeGenerator = require("../utils/codeGenerator");
const path = require("path");
const ejs = require("ejs");
const { v4: uuidv4 } = require("uuid");
const sendEmail = require("../utils/sendEmail");

exports.create = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if the user already exists
    const existingCustomer = await Customer.findOne({ where: { email } });
    if (existingCustomer) {
      return res
        .status(400)
        .json({ error: "Customer with this email already exists" });
    }

    // Generate a unique reference for the new Customer and verification pin
    const customerId = uuidv4();
    const emailProofToken = codeGenerator(6, "numeric");
    const emailProofTokenExpiresAt = new Date();
    emailProofTokenExpiresAt.setHours(emailProofTokenExpiresAt.getHours() + 1);

    const customer = await Customer.create({
      name,
      email,
      password,
      customerId,
      emailProofToken,
      emailProofTokenExpiresAt,
    });

    return res.status(201).json({
      message: "Customer created successfully",
      customer: { name: customer.name, email: customer.email },
    });
  } catch (error) {
    return res.status(500).json({ error: error["message"] });
  }
};
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const customer = await Customer.findOne({ where: { email } });

    if (!customer || !(await customer.validPassword(password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    if (!customer.isEnabled) {
      return res.status(403).json({
        message: "Your account is not verified",
      });
    }
    const token = generateToken(customer.customerId);

    res.status(200).json({
      success: true,
      customer: { email: customer.email, fullname: customer.name },
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
    const customer = await Customer.findOne({ where: { email } });

    if (!customer) {
      return res.status(404).json({ error: "No user found with that email" });
    }

    const resetPassword = codeGenerator(4, "numeric");
    customer.resetPasswordToken = resetPassword;
    customer.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await customer.save();

    const message = `You are receiving this email because you initiated a forgot password. Use this OTP to reset password: ${resetPassword}`;
    // Define the path to the email template
    const templatePath = path.join(
      __dirname,
      "../views/forgotPasswordTemplate.ejs"
    );

    // Render the email template with the PIN
    const html = await ejs.renderFile(templatePath, {
      otp: resetPassword,
      fullname: customer.name,
    });
    try {
      await sendEmail({
        email: customer.email,
        subject: "Nuprex - Password Reset Initiated",
        message,
        html,
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
  const resetPasswordToken = req.params.token;

  try {
    const customer = await Customer.findOne({
      where: {
        resetPasswordToken,
      },
    });

    if (!customer) {
      return res
        .status(400)
        .json({ error: "Invalid token or token has expired" });
    }
    if (Date.now() > customer.resetPasswordExpires) {
      return res.status(400).json({ error: "Token has expired" });
    }
    customer.password = req.body.password;
    customer.resetPasswordToken = null;
    customer.resetPasswordExpires = null;
    await customer.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Verify Email
exports.verifyEmail = async (req, res) => {
  const { token, email } = req.body;

  const customer = await Customer.findOne({
    where: {
      email: email,
    },
  });
  if (!customer) {
    return res.status(404).json({ message: "Invalid token" });
  }

  if (
    Date.now() > customer.emailProofTokenExpiresAt ||
    customer.emailProofToken !== token
  ) {
    const newToken = codeGenerator(6, "numeric");
    customer.emailProofToken = newToken;
    const newExpiry = new Date();
    customer.emailProofTokenExpiresAt = new Date().setHours(
      newExpiry.getHours() + 1
    );
    await customer.save();
    // Define the path to the email template
    const templatePath = path.join(__dirname, "../views/pinEmailTemplate.ejs");

    // Render the email template with the PIN
    const html = await ejs.renderFile(templatePath, {
      pin: newToken,
      fullname: customer.name,
    });

    // Send the email
    await sendEmail({
      email: customer.email,
      subject: "Nuprex - Email Verification",
      message: `Your verification PIN is: ${newToken}`, // Fallback text-only version
      html,
    });

    return res
      .status(404)
      .json({ message: "Token has expired, check email for a new token." });
  }
  // If time has not expired
  customer.emailProofToken = null;
  customer.emailProofTokenExpiresAt = null;
  customer.isEnabled = true;
  await customer.save();

  // Define the path to the email template
  const templatePath = path.join(
    __dirname,
    "../views/emailVerificationTemplate.ejs"
  );

  // Render the email template with the PIN
  const html = await ejs.renderFile(templatePath, {
    fullname: customer.name,
  });

  // Send the email
  await sendEmail({
    email: customer.email,
    subject: "Nuprex - Customer Account Activated",
    message: `Your account has been activated, please proceed to log in`, // Fallback text-only version
    html,
  });
  res.status(200).json({
    message: "Account Activated successfully",
  });
};
