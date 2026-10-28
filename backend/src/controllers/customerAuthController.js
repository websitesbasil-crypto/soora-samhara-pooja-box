import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Customer from '../models/Customer.js';
import Order from '../models/Order.js';
import brevoService from '../services/brevoService.js';

const JWT_SECRET = process.env.CUSTOMER_JWT_SECRET || process.env.ADMIN_JWT_SECRET || 'super_secret_jwt_key_sri_sankara_tv_2026_dev_mode';
const TOKEN_EXPIRY = '30d';

const generateToken = (customer) => {
  return jwt.sign(
    {
      id: customer._id,
      phone: customer.phone,
      email: customer.email,
      name: customer.name
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
};

export const registerCustomer = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // 1. Validation
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Enter your full name (at least 2 characters).' });
    }

    const cleanEmail = email ? email.trim().toLowerCase() : '';
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({ success: false, message: 'Enter a valid email address.' });
    }

    const cleanPhone = phone ? phone.replace(/[\s-]/g, '').replace(/^(?:\+?91)/, '') : '';
    if (!cleanPhone || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      return res.status(400).json({ success: false, message: 'Enter a valid 10-digit Indian mobile number.' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    // 2. Check for existing customer by phone or email
    const existing = await Customer.findOne({
      $or: [{ phone: cleanPhone }, { email: cleanEmail }]
    });

    let customer = null;

    if (existing) {
      if (existing.passwordHash) {
        return res.status(409).json({
          success: false,
          message: 'An account with this mobile number or email address already exists. Please sign in.'
        });
      }

      // Existing guest record without a password: update with credentials
      existing.name = name.trim();
      existing.email = cleanEmail;
      existing.phone = cleanPhone;
      existing.passwordHash = await bcrypt.hash(password, 10);
      existing.lastLoginAt = new Date();
      await existing.save();
      customer = existing;
    } else {
      // 3. Hash password and create new Customer
      const passwordHash = await bcrypt.hash(password, 10);
      customer = new Customer({
        name: name.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        passwordHash,
        lastLoginAt: new Date()
      });
      await customer.save();
    }

    const token = generateToken(customer);

    res.cookie('customer_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully. Welcome to Sri Sankara TV!',
      token,
      customer: customer.toSafeJSON()
    });
  } catch (err) {
    console.error('[CustomerAuth] Register error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to create account: ' + err.message
    });
  }
};

export const loginCustomer = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !identifier.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your email address or 10-digit mobile number.'
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Please enter your password.'
      });
    }

    const trimmed = identifier.trim();
    const cleanPhone = trimmed.replace(/[\s-]/g, '').replace(/^(?:\+?91)/, '');
    const cleanEmail = trimmed.toLowerCase();

    // Query by either email or phone
    const customer = await Customer.findOne({
      $or: [
        { email: cleanEmail },
        { phone: cleanPhone },
        { phone: trimmed }
      ]
    });

    if (!customer || !customer.passwordHash) {
      return res.status(401).json({
        success: false,
        message: 'No registered account found with these details. Please create an account first.'
      });
    }

    const isMatch = await customer.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Please verify your credentials and try again.'
      });
    }

    customer.lastLoginAt = new Date();
    await customer.save();

    const token = generateToken(customer);

    res.cookie('customer_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      success: true,
      message: 'Signed in successfully. Welcome back!',
      token,
      customer: customer.toSafeJSON()
    });
  } catch (err) {
    console.error('[CustomerAuth] Login error:', err);
    return res.status(500).json({
      success: false,
      message: 'Sign in failed: ' + err.message
    });
  }
};

export const logoutCustomer = async (req, res) => {
  res.clearCookie('customer_token');
  return res.status(200).json({
    success: true,
    message: 'Signed out successfully.'
  });
};

export const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      customer: req.customer.toSafeJSON()
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [
        { customerId: req.customer._id },
        { 'customer.phone': req.customer.phone },
        { 'customer.email': req.customer.email }
      ]
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: orders
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier || !identifier.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your registered email address or 10-digit mobile number.'
      });
    }

    const raw = identifier.trim();
    const cleanPhone = raw.replace(/[\s-]/g, '').replace(/^(?:\+?91)/, '');
    const cleanEmail = raw.toLowerCase();

    const customer = await Customer.findOne({
      $or: [
        { email: cleanEmail },
        { phone: cleanPhone }
      ]
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'No devotee account found with this email or mobile number.'
      });
    }

    if (!customer.email) {
      return res.status(400).json({
        success: false,
        message: 'Your account does not have an email address associated with it. Please contact support.'
      });
    }

    // Generate 6-digit numeric OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    customer.resetPasswordOtp = otpCode;
    customer.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    await customer.save();

    // Send email via Brevo
    try {
      await brevoService.sendPasswordResetOtp({
        toEmail: customer.email,
        toName: customer.name,
        otpCode
      });
    } catch (emailErr) {
      console.error('[CustomerAuth] Error sending reset email:', emailErr);
    }

    // Mask email for display: e.g. "s***n@gmail.com"
    const [userPart, domainPart] = customer.email.split('@');
    const maskedUser = userPart.length > 2
      ? `${userPart[0]}${'*'.repeat(Math.max(1, userPart.length - 2))}${userPart[userPart.length - 1]}`
      : `${userPart[0]}*`;
    const maskedEmail = `${maskedUser}@${domainPart}`;

    return res.status(200).json({
      success: true,
      message: `A 6-digit verification code has been sent to your email (${maskedEmail}).`,
      identifier: customer.email,
      maskedEmail
    });
  } catch (err) {
    console.error('[CustomerAuth] Forgot password error:', err);
    return res.status(500).json({ success: false, message: 'Failed to process request. Please try again.' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { identifier, otpCode, newPassword } = req.body;

    if (!identifier || !otpCode || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Identifier, 6-digit verification code, and new password are required.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.'
      });
    }

    const raw = identifier.trim();
    const cleanPhone = raw.replace(/[\s-]/g, '').replace(/^(?:\+?91)/, '');
    const cleanEmail = raw.toLowerCase();

    const customer = await Customer.findOne({
      $or: [
        { email: cleanEmail },
        { phone: cleanPhone }
      ]
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Devotee account not found.'
      });
    }

    if (!customer.resetPasswordOtp || customer.resetPasswordOtp !== otpCode.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid 6-digit verification code. Please check your email and try again.'
      });
    }

    if (!customer.resetPasswordExpires || new Date() > customer.resetPasswordExpires) {
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new code.'
      });
    }

    // Set new password
    customer.passwordHash = await bcrypt.hash(newPassword, 10);
    customer.resetPasswordOtp = null;
    customer.resetPasswordExpires = null;
    await customer.save();

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully! Please sign in with your new password.'
    });
  } catch (err) {
    console.error('[CustomerAuth] Reset password error:', err);
    return res.status(500).json({ success: false, message: 'Failed to reset password. Please try again.' });
  }
};
