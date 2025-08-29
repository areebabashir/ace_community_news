import Feedback from "../Models/FeedbackModel.js";
import nodemailer from "nodemailer";
import { getClubAdminApprovedTemplate } from "../utils/emailTemplates.js";

export const createFeedback = async (req, res) => {
  try {
    const { name, role, club, feedback } = req.body;

    if (!name || !feedback) {
      return res.status(400).json({ success: false, error: "name and feedback are required" });
    }

    const created = await Feedback.create({
      name,
      role: role || null,
      club: club || null,
      feedback_text: feedback,
    });

    // Send email to admin
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: String(process.env.SMTP_PORT) === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        logger: true,
        debug: true,
      });

      const adminEmail = process.env.ADMIN_EMAIL;
      if (adminEmail) {
        const html = getClubAdminApprovedTemplate({
          adminFirstName: "Admin",
          clubName: club || "Club",
          feedbackText: feedback,
        });
        await transporter.sendMail({
          from: process.env.SMTP_USER,
          to: adminEmail,
          subject: "New Feedback Submitted",
          html,
        });
      }
    } catch (mailErr) {
      console.error("Feedback email error:", mailErr.message);
    }

    return res.json({ success: true, data: created });
  } catch (err) {
    console.error("createFeedback error:", err.message);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const listFeedback = async (req, res) => {
  try {
    const list = await Feedback.findAll({ order: [["created_at", "DESC"]] });
    return res.json({ success: true, data: list });
  } catch (err) {
    console.error("listFeedback error:", err.message);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
};


