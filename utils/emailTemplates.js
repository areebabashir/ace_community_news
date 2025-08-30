export function getClubAdminApprovedTemplate({ adminFirstName = "Admin", clubName = "Club", feedbackText = "" } = {}) {
  const feedbackBlock = feedbackText
    ? `<p style="
            font-size: 13px;
            font-weight: 600;
            font-family: 'Montserrat', Arial, sans-serif;
            margin: 10px 0 12px;">
        <strong>Feedback:</strong> ${escapeHtml(feedbackText)}
      </p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Club Admin Approved</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@200;300;400;500;600;700;800;900&family=Oswald:wght@200;300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="font-family: 'Open Sans', 'Segoe UI', sans-serif; background:#fff; margin:40px auto; display:flex; justify-content:center; align-items:center; padding:0; color:#333; min-height:100vh;">
  <div style="width:380px; padding:25px; border:1px solid #eee; text-align:center; box-shadow:0 2px 8px rgba(0,0,0,0.05);">
    <div style="text-align:center">
      <img src="https://res.cloudinary.com/drxxtbalj/image/upload/v1749543604/paddlelogo_wi6bkp.png" alt="ACE Community" style="width:90px" />
    </div>

    <div style="border-top:2px solid #0077a1; margin:10px auto 18px; width:100%"></div>

    <div style="text-align:left">
      <h2 style="font-family:'Oswald', Arial, sans-serif; font-size:20px; color:#006e94; font-weight:700; margin:10px 0 0;">
        Hello
        <span style="font-family:'Oswald', Arial, sans-serif; font-size:20px; color:#f26524; font-weight:400;"> ${escapeHtml(adminFirstName)}</span>,
      </h2>
      <p style="font-size:13px; font-weight:600; font-family:'Montserrat', Arial, sans-serif; margin:5px 0 12px;">
        We’re thrilled to inform you that your request for club
        <span style="font-family:'Oswald', Arial, sans-serif; font-size:16px; color:#f26524; font-weight:600;"> ${escapeHtml(clubName)}</span>
        has been approved by the Super Admin.
      </p>
      ${feedbackBlock}
      <p style="font-size:13px; font-weight:600; font-family:'Montserrat', Arial, sans-serif; margin:10px 0 12px;">
        Our team will be reaching out to you soon regarding the next steps. For assistance, contact us at
        <span style="font-size:13px; font-weight:600; font-family:'Montserrat', Arial, sans-serif; color:#0077a1;">info@acecommunity.me</span>
      </p>
    </div>

    <div style="text-align:left">
      <h2 style="font-family:'Oswald', sans-serif; font-size:17.33px; color:#006e94; font-weight:800; margin:15px 0 10px;">Thank you!</h2>
      <p style="font-size:14px; font-weight:600; font-family:'Montserrat', Arial, sans-serif; margin:0; margin-top:3px;">ACE Community Team</p>
      <img src="https://res.cloudinary.com/drxxtbalj/image/upload/v1749796398/signature_yfgcr5.jpg" alt="Signature" style="width:140px; margin:0 auto 14px" />
    </div>

    <div style="border-top:2px solid #0077a1; margin:-13px auto; width:100%"></div>
    <h2 style="font-family:'Montserrat', sans-serif; color:#f26524; font-size:14px; font-weight:400; margin:35px 0 10px;">CONNECT THROUGH</h2>

    <div style="margin:10px 0">
      <a href="#"><img src="https://res.cloudinary.com/drxxtbalj/image/upload/v1750056256/fb_dtj4ms_1_szfzog.png" alt="Facebook" style="width:16px; margin:0 6px; vertical-align:middle" /></a>
      <a href="https://instagram.com/acecommunity"><img src="https://res.cloudinary.com/drxxtbalj/image/upload/fl_preserve_transparency/v1749817001/insta_otiiz0.jpg" alt="Instagram" style="width:16px; margin:0 6px; vertical-align:middle" /></a>
    </div>

    <div style="font-size:13px; margin-top:15px; color:#0077a1">
      <a href="mailto:info@acecommunity.me" style="font-family:'Montserrat','Segoe UI',sans-serif; font-size:12px; font-weight:500; color:#0077a1; text-decoration:none; margin:0 4px;">info@acecommunity.me</a>
      |
      <a href="https://acecommunity.me" style="font-family:'Montserrat','Segoe UI',sans-serif; font-size:12px; font-weight:500; color:#0077a1; text-decoration:none; margin:0 4px;">www.acecommunity.me</a>
    </div>
  </div>
</body>
</html>`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function getFeedbackTemplate({
  name = "-",
  email = "-",
  role = "-",
  feedback = "",
} = {}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>New Website Feedback</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@200;300;400;500;600;700;800;900&family=Oswald:wght@200;300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="font-family: 'Open Sans', 'Segoe UI', sans-serif; background:#fff; margin:40px auto; display:flex; justify-content:center; align-items:center; padding:0; color:#333; min-height:100vh;">
  <div style="width:480px; padding:25px; border:1px solid #eee; text-align:center; box-shadow:0 2px 8px rgba(0,0,0,0.05);">
    <div style="text-align:center">
      <img src="https://res.cloudinary.com/drxxtbalj/image/upload/v1749543604/paddlelogo_wi6bkp.png" alt="ACE Community" style="width:90px" />
    </div>

    <div style="border-top:2px solid #0077a1; margin:10px auto 18px; width:100%"></div>

    <div style="text-align:left">
      <h2 style="font-family:'Oswald', Arial, sans-serif; font-size:20px; color:#006e94; font-weight:700; margin:10px 0 8px;">
        Hello <span style="color:#f26524; font-weight:400;">Super Admin</span>,
      </h2>

      <p style="font-size:12px; font-weight:500; font-family:'Montserrat', Arial, sans-serif; margin:6px 0 16px; color:#666; line-height:1.6;">
        This message was generated from the ACE website feedback form. The details of the sender are provided below.
      </p>

      <table style="width:100%; border-collapse:collapse; font-family:'Montserrat', Arial, sans-serif; font-size:13px;">
        <tr>
          <td style="padding:6px 8px; color:#006e94; font-weight:700; width:120px;">Name</td>
          <td style="padding:6px 8px;">${escapeHtml(name)}</td>
        </tr>
        <tr>
          <td style="padding:6px 8px; color:#006e94; font-weight:700;">Email</td>
          <td style="padding:6px 8px;">${escapeHtml(email || '-')}</td>
        </tr>
        <tr>
          <td style="padding:6px 8px; color:#006e94; font-weight:700;">Role</td>
          <td style="padding:6px 8px;">${escapeHtml(role || '-')}</td>
        </tr>
      </table>

      <div style="margin-top:12px;">
        <div style="font-family:'Oswald', Arial, sans-serif; font-size:16px; color:#f26524; font-weight:600; margin-bottom:6px; ">Feedback</div>
        <div style="background:#f8fafb; border:1px solid #e6eef2; padding:12px; border-radius:6px; line-height:1.6; font-size:13px; color:#333;">${escapeHtml(feedback)}</div>
      </div>

      <div style="margin-top:16px;">
        <h3 style="font-family:'Oswald', sans-serif; font-size:17px; color:#006e94; font-weight:800; margin:0 0 6px;">Thank you!</h3>
        <p style="font-size:14px; font-weight:600; font-family:'Montserrat', Arial, sans-serif; margin:0;">ACE Community Team</p>
        <img src="https://res.cloudinary.com/drxxtbalj/image/upload/v1749796398/signature_yfgcr5.jpg" alt="Signature" style="width:140px; margin:8px 0 0" />
      </div>
    </div>

    <div style="border-top:2px solid #0077a1; margin:16px auto 10px; width:100%"></div>
    <h2 style="font-family:'Montserrat', sans-serif; color:#f26524; font-size:14px; font-weight:400; margin:18px 0 10px;">CONNECT THROUGH</h2>

    <div style="margin:8px 0 0 0;">
      <a href="https://facebook.com" style="display:inline-block; margin:0 6px;"><img src="https://res.cloudinary.com/drxxtbalj/image/upload/v1750056256/fb_dtj4ms_1_szfzog.png" alt="Facebook" style="width:16px; vertical-align:middle" /></a>
      <a href="https://instagram.com/acecommunity" style="display:inline-block; margin:0 6px;"><img src="https://res.cloudinary.com/drxxtbalj/image/upload/fl_preserve_transparency/v1749817001/insta_otiiz0.jpg" alt="Instagram" style="width:16px; vertical-align:middle" /></a>
    </div>

    <div style="border-top:2px solid #0077a1; margin:16px auto 10px; width:100%"></div>

    <div style="font-size:12px; margin-top:8px; color:#0077a1; font-family:'Montserrat','Segoe UI',sans-serif;">
      <a href="mailto:info@acecommunity.me" style="font-size:12px; font-weight:500; color:#0077a1; text-decoration:none; margin:0 4px;">info@acecommunity.me</a>
      |
      <a href="https://acecommunity.me" style="font-size:12px; font-weight:500; color:#0077a1; text-decoration:none; margin:0 4px;">www.acecommunity.me</a>
    </div>
  </div>
</body>
</html>`;
}

export function getContactTemplate({
  name = "-",
  email = "-",
  phone = "-",
  subject = "-",
  role = "-",
  message = "-",
} = {}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Contact Form Submission</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Oswald:wght@200..700&display=swap" rel="stylesheet">
</head>
<body style="font-family: 'Open Sans', 'Segoe UI', sans-serif; background:#fff; margin:40px auto; display:flex; justify-content:center; align-items:center; padding:0; color:#333; min-height:100vh;">
  <div style="width:480px; padding:25px; border:1px solid #eee; text-align:center; box-shadow:0 2px 8px rgba(0,0,0,0.05);">
    <div style="text-align:center">
      <img src="https://res.cloudinary.com/drxxtbalj/image/upload/v1749543604/paddlelogo_wi6bkp.png" alt="ACE Community" style="width:90px" />
    </div>

    <div style="border-top:2px solid #0077a1; margin:10px auto 18px; width:100%"></div>

    <div style="text-align:left">
      <h2 style="font-family:'Oswald', Arial, sans-serif; font-size:20px; color:#006e94; font-weight:700; margin:10px 0 8px;">
        Hello <span style="color:#f26524; font-weight:400;">Super Admin</span>,
      </h2>

      <p style="font-size:12px; font-weight:500; font-family:'Montserrat', Arial, sans-serif; margin:6px 0 16px; color:#666; line-height:1.6;">
        A new contact form submission has been received from the ACE website. The details are provided below.
      </p>

      <table style="width:100%; border-collapse:collapse; font-family:'Montserrat', Arial, sans-serif; font-size:13px;">
        <tr>
          <td style="padding:6px 8px; color:#006e94; font-weight:700; width:120px;">Name</td>
          <td style="padding:6px 8px;">${escapeHtml(name)}</td>
        </tr>
        <tr>
          <td style="padding:6px 8px; color:#006e94; font-weight:700;">Email</td>
          <td style="padding:6px 8px;">${escapeHtml(email)}</td>
        </tr>
        <tr>
          <td style="padding:6px 8px; color:#006e94; font-weight:700;">Phone</td>
          <td style="padding:6px 8px;">${escapeHtml(phone || '-')}</td>
        </tr>
        <tr>
          <td style="padding:6px 8px; color:#006e94; font-weight:700;">Subject</td>
          <td style="padding:6px 8px;">${escapeHtml(subject || '-')}</td>
        </tr>
        <tr>
          <td style="padding:6px 8px; color:#006e94; font-weight:700;">Role</td>
          <td style="padding:6px 8px;">${escapeHtml(role || '-')}</td>
        </tr>
      </table>

      <div style="margin-top:12px;">
        <div style="font-family:'Oswald', Arial, sans-serif; font-size:16px; color:#f26524; font-weight:600; margin-bottom:6px;">Message</div>
        <div style="background:#f8fafb; border:1px solid #e6eef2; padding:12px; border-radius:6px; line-height:1.6; font-size:13px; color:#333;">${escapeHtml(message)}</div>
      </div>

      <div style="margin-top:16px;">
        <h3 style="font-family:'Oswald', sans-serif; font-size:17px; color:#006e94; font-weight:800; margin:0 0 6px;">Thank you!</h3>
        <p style="font-size:14px; font-weight:600; font-family:'Montserrat', Arial, sans-serif; margin:0;">ACE Community Team</p>
        <img src="https://res.cloudinary.com/drxxtbalj/image/upload/v1749796398/signature_yfgcr5.jpg" alt="Signature" style="width:140px; margin:8px 0 0" />
      </div>
    </div>

    <div style="border-top:2px solid #0077a1; margin:16px auto 10px; width:100%"></div>
    <h2 style="font-family:'Montserrat', sans-serif; color:#f26524; font-size:14px; font-weight:400; margin:18px 0 10px;">CONNECT THROUGH</h2>

    <div style="margin:8px 0 0 0;">
      <a href="https://facebook.com" style="display:inline-block; margin:0 6px;"><img src="https://res.cloudinary.com/drxxtbalj/image/upload/v1750056256/fb_dtj4ms_1_szfzog.png" alt="Facebook" style="width:16px; vertical-align:middle" /></a>
      <a href="https://instagram.com/acecommunity" style="display:inline-block; margin:0 6px;"><img src="https://res.cloudinary.com/drxxtbalj/image/upload/fl_preserve_transparency/v1749817001/insta_otiiz0.jpg" alt="Instagram" style="width:16px; vertical-align:middle" /></a>
    </div>

    <div style="border-top:2px solid #0077a1; margin:16px auto 10px; width:100%"></div>

    <div style="font-size:12px; margin-top:8px; color:#0077a1; font-family:'Montserrat','Segoe UI',sans-serif;">
      <a href="mailto:info@acecommunity.me" style="font-size:12px; font-weight:500; color:#0077a1; text-decoration:none; margin:0 4px;">info@acecommunity.me</a>
      |
      <a href="https://acecommunity.me" style="font-size:12px; font-weight:500; color:#0077a1; text-decoration:none; margin:0 4px;">www.acecommunity.me</a>
    </div>
  </div>
</body>
</html>`;
}

export function getScheduleCallTemplate({
  fullName = "-",
  email = "-",
  phone = "-",
  clubName = "-",
  preferredDate = "-",
  timeSlot = "-",
  otherInfo = "-",
} = {}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Schedule Call Request</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Oswald:wght@200..700&display=swap" rel="stylesheet">
</head>
<body style="font-family: 'Open Sans', 'Segoe UI', sans-serif; background:#fff; margin:40px auto; display:flex; justify-content:center; align-items:center; padding:0; color:#333; min-height:100vh;">
  <div style="width:380px; padding:25px; border:1px solid #eee; text-align:center; box-shadow:0 2px 8px rgba(0,0,0,0.05);">
    <div style="text-align:center">
      <img src="https://res.cloudinary.com/drxxtbalj/image/upload/v1749543604/paddlelogo_wi6bkp.png" alt="ACE Community" style="width:90px" />
    </div>

    <div style="border-top:2px solid #0077a1; margin:10px auto 18px; width:100%"></div>

    <div style="text-align:left">
      <h2 style="font-family:'Oswald', Arial, sans-serif; font-size:20px; color:#006e94; font-weight:700; margin:10px 0 0;">Hi!
        <span style="font-family:'Oswald', Arial, sans-serif; font-size:20px; color:#f26524; font-weight:400;"> Super Admin</span>,
      </h2>
      <p style="font-size:13px; font-weight:600; font-family:'Montserrat', Arial, sans-serif; margin:5px 0 12px;">A user submitted a request to schedule a call. Details are below:</p>

      <table style="width:100%; border-collapse:collapse; font-family:'Montserrat', Arial, sans-serif; font-size:13px;">
        <tr><td style="padding:6px 8px; color:#006e94; font-weight:700; width:120px;">Full Name</td><td style="padding:6px 8px;">${escapeHtml(fullName)}</td></tr>
        <tr><td style="padding:6px 8px; color:#006e94; font-weight:700;">Email</td><td style="padding:6px 8px;">${escapeHtml(email)}</td></tr>
        <tr><td style="padding:6px 8px; color:#006e94; font-weight:700;">Phone</td><td style="padding:6px 8px;">${escapeHtml(phone)}</td></tr>
        <tr><td style="padding:6px 8px; color:#006e94; font-weight:700;">Club Name</td><td style="padding:6px 8px;">${escapeHtml(clubName)}</td></tr>
        <tr><td style="padding:6px 8px; color:#006e94; font-weight:700;">Preferred Date</td><td style="padding:6px 8px;">${escapeHtml(preferredDate)}</td></tr>
        <tr><td style="padding:6px 8px; color:#006e94; font-weight:700;">Time Slot</td><td style="padding:6px 8px;">${escapeHtml(timeSlot)}</td></tr>
      </table>

      <p style="font-size:13px; font-weight:600; font-family:'Montserrat', Arial, sans-serif; margin:10px 0 8px;">Other Information</p>
      <div style="background:#f8fafb; border:1px solid #e6eef2; padding:12px; border-radius:6px; line-height:1.6; font-size:13px; color:#333; text-align:left;">${escapeHtml(otherInfo)}</div>
    </div>

    <div style="text-align:left">
      <h2 style="font-family:'Oswald', sans-serif; font-size:17.33px; color:#006e94; font-weight:800; margin:15px 0 10px;">Thank you!</h2>
      <p style="font-size:14px; font-weight:600; font-family:'Montserrat', Arial, sans-serif; margin:0; margin-top:3px;">ACE Community Team</p>
      <img src="https://res.cloudinary.com/drxxtbalj/image/upload/v1749796398/signature_yfgcr5.jpg" alt="Signature" style="width:140px; margin:0 auto 14px" />
    </div>

    <div style="border-top:2px solid #0077a1; margin:-13px auto; width:100%"></div>
    <h2 style="font-family:'Montserrat', sans-serif; color:#f26524; font-size:14px; font-weight:400; margin:35px 0 10px;">CONNECT THROUGH</h2>

    <div style="margin:10px 0">
      <a href="#"><img src="https://res.cloudinary.com/drxxtbalj/image/upload/v1750056256/fb_dtj4ms_1_szfzog.png" alt="Facebook" style="width:16px; margin:0 6px; vertical-align:middle" /></a>
      <a href="https://instagram.com/acecommunity"><img src="https://res.cloudinary.com/drxxtbalj/image/upload/fl_preserve_transparency/v1749817001/insta_otiiz0.jpg" alt="Instagram" style="width:16px; margin:0 6px; vertical-align:middle" /></a>
    </div>

    <div style="font-size:13px; margin-top:15px; color:#0077a1">
      <a href="mailto:info@acecommunity.me" style="font-family:'Montserrat','Segoe UI',sans-serif; font-size:12px; font-weight:500; color:#0077a1; text-decoration:none; margin:0 4px;">info@acecommunity.me</a>
      |
      <a href="https://acecommunity.me" style="font-family:'Montserrat','Segoe UI',sans-serif; font-size:12px; font-weight:500; color:#0077a1; text-decoration:none; margin:0 4px;">www.acecommunity.me</a>
    </div>
  </div>
</body>
</html>`;
}

