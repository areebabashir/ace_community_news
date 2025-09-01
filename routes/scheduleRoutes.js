import express from "express";
import nodemailer from "nodemailer";
import { getScheduleCallTemplate } from "../utils/emailTemplates.js";

const router = express.Router();

router.post("/create", async (req, res) => {
  try {
    const { 
      fullName, 
      email, 
      phone, 
      clubName, 
      preferredDate, 
      timeSlot, 
      otherInfo 
    } = req.body || {};

    // Validation
    if (!fullName || !email || !phone || !clubName || !preferredDate || !timeSlot || !otherInfo) {
      return res.status(400).json({ 
        success: false, 
        error: "All fields are required" 
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        error: "Invalid email format" 
      });
    }

    // Phone validation (7-15 digits)
    const phoneRegex = /^[0-9]{7,15}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ 
        success: false, 
        error: "Phone number must be 7-15 digits" 
      });
    }

    // Send email to admin
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: String(process.env.SMTP_PORT) === '465',
        auth: { 
          user: process.env.SMTP_USER, 
          pass: process.env.SMTP_PASS 
        },
      });

      const adminEmail = process.env.ADMIN_EMAIL;
      if (adminEmail) {
        const html = getScheduleCallTemplate({ 
          fullName, 
          email, 
          phone, 
          clubName, 
          preferredDate, 
          timeSlot, 
          otherInfo 
        });

        await transporter.sendMail({
          from: process.env.SMTP_USER,
          to: adminEmail,
          replyTo: `${fullName} <${email}>`,
          subject: `New Schedule Call Request: ${fullName} from ${clubName}`,
          html,
        });
      }
    } catch (mailErr) {
      console.error("Schedule call email error:", mailErr.message);
      // Don't fail the request if email fails
    }

    return res.json({ 
      success: true, 
      message: "Schedule call request submitted successfully" 
    });
  } catch (err) {
    console.error("schedule create error:", err.message);
    return res.status(500).json({ 
      success: false, 
      error: "Internal server error" 
    });
  }
});

export default router;


