import { handleError } from "../helpers/handleError.js";
import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";

// === Helper for cookie options ===
// sameSite:"none" + secure:true is required for cross-domain cookies (Chrome/Safari).
// This applies whenever the API and client are on different origins (e.g. Vercel deployments).
const isProduction = process.env.NODE_ENV === "production"
const cookieOptions = {
  httpOnly: true,
  secure: isProduction,          // must be true for sameSite:"none"
  sameSite: isProduction ? "none" : "lax",
  path: "/",
};

export const Register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return next(handleError(400, "Name, email and password are required."));
    }

    const checkuser = await User.findOne({ email });
    if (checkuser) {
      // user already registered
      return next(handleError(409, "User already registered."));
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    // register user
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: "Registration successful.",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

export const Login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(handleError(400, "Email and password are required."));
    }

    const user = await User.findOne({ email });

    if (!user) {
      return next(handleError(404, "Invalid login credentials."));
    }
    const hashedPassword = user.password;

    const comparePassword = await bcryptjs.compare(password, hashedPassword);
    if (!comparePassword) {
      return next(handleError(404, "Invalid login credentials."));
    }

    const token = jwt.sign(
      {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
      process.env.JWT_SECRET
    );

    res.cookie("access_token", token, cookieOptions);

    const newUser = user.toObject({ getters: true });
    delete newUser.password;

    res.status(200).json({
      success: true,
      user: newUser,
      message: "Login successful.",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

export const GoogleLogin = async (req, res, next) => {
  try {
    const { name, email, avatar } = req.body;

    if (!name || !email) {
      return next(handleError(400, "Missing name or email."));
    }

    let user = await User.findOne({ email });
    if (!user) {
      //  create new user
      const password = Math.random().toString().slice(-8);
      const hashedPassword = await bcryptjs.hash(password, 10);
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        avatar,
      });

      user = await newUser.save();
    }

    const token = jwt.sign(
      {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
      process.env.JWT_SECRET
    );

    res.cookie("access_token", token, cookieOptions);

    const newUser = user.toObject({ getters: true });
    delete newUser.password;
    res.status(200).json({
      success: true,
      user: newUser,
      message: "Login successful.",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

export const Logout = async (req, res, next) => {
  try {
    res.clearCookie("access_token", cookieOptions);

    res.status(200).json({
      success: true,
      message: "Logout successful.",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

export const ForgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(handleError(400, "Email is required."));
    }

    const user = await User.findOne({ email });
    if (!user) {
      return next(handleError(404, "No account found with that email address."));
    }

    // Generate a secure random token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Store hashed token + expiry (1 hour) on user
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    // Build reset URL using the plain (unhashed) token
    const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // Configure transporter (works with Gmail + App Password)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <h2>Password Reset</h2>
          <p>Hi <strong>${user.name}</strong>,</p>
          <p>You requested a password reset. Click the button below to set a new password. This link expires in <strong>15 minutes</strong>.</p>
          <a href="${resetURL}"
            style="display:inline-block;padding:12px 24px;background:#000;color:#fff;border-radius:6px;text-decoration:none;margin:16px 0;">
            Reset Password
          </a>
          <p>If you didn't request this, just ignore this email — your password won't change.</p>
          <hr/>
          <small style="color:#888;">Raw Words Blog</small>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: "Password reset link sent to your email.",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};

export const ResetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return next(handleError(400, "Password must be at least 6 characters."));
    }

    // Hash the incoming token to compare with stored hash
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return next(handleError(400, "Reset link is invalid or has expired."));
    }

    // Update password and clear reset fields
    user.password = await bcryptjs.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful. You can now log in.",
    });
  } catch (error) {
    next(handleError(500, error.message));
  }
};
