const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/User");
const { signToken } = require("../utils/jwt");

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 12);

exports.register = async (req, res, next) => {
  try {
    const { email, password, anonymousUsername } = req.body;
    if (!email || !password || !anonymousUsername) {
      return res.status(400).json({ message: "email, password and anonymousUsername are required" });
    }

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) return res.status(409).json({ message: "Email already registered" });

    const existingUsername = await User.findOne({ anonymousUsername });
    if (existingUsername) return res.status(409).json({ message: "That anonymous username is taken" });

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const emailVerifyToken = crypto.randomBytes(24).toString("hex");

    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      anonymousUsername,
      emailVerifyToken,
    });

    // In production: send an email containing a verification link with emailVerifyToken.
    // TODO: wire up nodemailer / SendGrid using the SMTP_* env vars.

    const token = signToken(user);
    res.status(201).json({ token, user });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || "").toLowerCase() });
    if (!user || !user.passwordHash) return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken(user);
    res.json({ token, user });
  } catch (err) {
    next(err);
  }
};

exports.googleLogin = async (req, res, next) => {
  // Placeholder for Google OAuth. In production, verify the id_token from the
  // client against Google's public keys (e.g. using `google-auth-library`),
  // then find-or-create the User by googleId. Requires GOOGLE_CLIENT_ID/SECRET.
  res.status(501).json({
    message: "Google login not configured. Set GOOGLE_CLIENT_ID/SECRET and implement token verification.",
  });
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: (email || "").toLowerCase() });
    // Always return 200 to avoid leaking which emails are registered.
    if (user) {
      const token = crypto.randomBytes(24).toString("hex");
      user.passwordResetToken = token;
      user.passwordResetExpires = new Date(Date.now() + 1000 * 60 * 30); // 30 min
      await user.save();
      // TODO: email the reset link: `${CLIENT_URL}/reset-password?token=${token}`
    }
    res.json({ message: "If that email exists, a reset link has been sent." });
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
    });
    if (!user) return res.status(400).json({ message: "Reset link is invalid or expired" });

    user.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    res.json({ message: "Password updated. You can now log in." });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res) => {
  res.json({ user: req.user });
};
