import express from "express";
import nodemailer from "nodemailer";
import { getContactTemplate } from "../utils/emailTemplates.js";

const router = express.Router();

router.post("/create", async (req, res) => {
  try {
    const { name, email, phone, subject, role, message } = req.body || {};
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: "name, email, and message are required" });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_PORT) === '465',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    const html = getContactTemplate({ name, email, phone, subject, role, message });

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.CONTACT_US_EMAIL,
      replyTo: `${name} <${email}>`,
      subject: `New Contact Form Submission: ${subject || 'General Inquiry'}`,
      html,
    });

    return res.json({ success: true });
  } catch (err) {
    console.error("contact create error:", err.message);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default router;
