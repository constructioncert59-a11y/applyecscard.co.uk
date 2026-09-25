exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ success: false, error: "Method Not Allowed" })
    };
  }

  try {
    const data = JSON.parse(event.body || "{}");

    const isTestBooking = data.form_type === "test_booking";

    if (!data.email || !data.full_name) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, error: "Full Name and Email required" })
      };
    }

    const attachments = [];

    function extFromDataUrl(dataUrl, fallback) {
      const match = /^data:([^;]+);base64,/.exec(dataUrl || "");
      if (!match) return fallback;
      const mime = match[1];
      if (mime === "image/jpeg") return "jpg";
      if (mime === "image/png") return "png";
      if (mime === "image/webp") return "webp";
      if (mime === "application/pdf") return "pdf";
      return fallback;
    }

    if (!isTestBooking) {
      if (typeof data.photo === "string" && data.photo.startsWith("data:")) {
        attachments.push({
          filename: "passport-photo." + extFromDataUrl(data.photo, "png"),
          content: data.photo.split(",")[1]
        });
      }
      if (typeof data.id_proof === "string" && data.id_proof.startsWith("data:")) {
        attachments.push({
          filename: "identity-proof." + extFromDataUrl(data.id_proof, "png"),
          content: data.id_proof.split(",")[1]
        });
      }
      if (typeof data.hs_test_proof === "string" && data.hs_test_proof.startsWith("data:")) {
        attachments.push({
          filename: "hs-test-proof.png",
          content: data.hs_test_proof.split(",")[1]
        });
      }
    }

    const normalFields = { ...data };
    delete normalFields.photo;
    delete normalFields.id_proof;
    delete normalFields.hs_test_proof;
    delete normalFields.form_type;

    const tableRows = Object.entries(normalFields)
      .map(([key, value]) => `
        <tr>
          <td style="padding:14px;border:1px solid #e5e5e5;background:#f8fafc;font-weight:600;text-transform:capitalize;width:35%;">
            ${key.replaceAll("_", " ")}
          </td>
          <td style="padding:14px;border:1px solid #e5e5e5;color:#111827;">
            ${value || " "}
          </td>
        </tr>
      `).join("");

    const adminHeading = isTestBooking ? "CITB TEST BOOKING" : "ECS CARD APPLICATION";
    const adminSubheading = isTestBooking ? "New test booking request received" : "New user booking received";
    const adminSubject = isTestBooking
      ? `📝 New CITB Test Booking - ${data.full_name}`
      : `🔥 New ECS Card Application - ${data.full_name}`;

    const uploadedDocLines = [];
    if (attachments.some(a => a.filename.startsWith("passport-photo"))) uploadedDocLines.push("Passport Size Photo Attached");
    if (attachments.some(a => a.filename.startsWith("identity-proof"))) uploadedDocLines.push("Identity Proof Attached");
    if (attachments.some(a => a.filename.startsWith("hs-test-proof"))) uploadedDocLines.push("HS Test Proof Attached");

    const attachmentsSectionHtml = (isTestBooking || uploadedDocLines.length === 0)
      ? ""
      : `
        <div style="margin-top:35px;padding:20px;background:#f8fafc;border-radius:12px;">
          <h3 style="margin-top:0;color:#111827;">Uploaded Documents</h3>
          <ul style="line-height:2;padding-left:20px;">
            ${uploadedDocLines.map(line => `<li>${line}</li>`).join("")}
          </ul>
        </div>
      `;

    const adminEmailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "Apply ECS <onboarding@resend.dev>",
        to: "applyecs4@gmail.com",
        reply_to: data.email,
        subject: adminSubject,
        attachments,
        html: `
          <div style="background:#f3f4f6;padding:40px;font-family:Arial,sans-serif;">
            <div style="max-width:800px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.08);">
              <div style="background:#0f172a;color:white;padding:30px;">
                <h1 style="margin:0;font-size:28px;">${adminHeading}</h1>
                <p style="margin-top:10px;opacity:0.8;">${adminSubheading}</p>
              </div>
              <div style="padding:35px;">
                <h2 style="margin-top:0;color:#111827;">${isTestBooking ? "Booking Details" : "Applicant Details"}</h2>
                <table style="width:100%;border-collapse:collapse;margin-top:25px;font-size:15px;">
                  ${tableRows}
                </table>
                ${attachmentsSectionHtml}
              </div>
              <div style="background:#f9fafb;padding:20px 35px;color:#6b7280;font-size:13px;border-top:1px solid #e5e7eb;">
                Generated automatically from Apply ECS Booking System
              </div>
            </div>
          </div>
        `
      })
    });

    if (!adminEmailRes.ok) {
      const errText = await adminEmailRes.text();
      throw new Error("Admin email failed: " + errText);
    }

    const userSubject = isTestBooking ? "✅ CITB Test Booking Confirmation" : "✅ ECS Application Confirmation";
    const userIntroText = isTestBooking
      ? "Your CITB Health, Safety & Environment test booking request has been received successfully."
      : "Your ECS Card application has been received successfully.";

    const userEmailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "Apply ECS <onboarding@resend.dev>",
        to: data.email,
        subject: userSubject,
        html: `
          <div style="background:#f3f4f6;padding:40px;font-family:Arial,sans-serif;">
            <div style="max-width:700px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;">
              <div style="background:#16a34a;color:white;padding:30px;">
                <h1 style="margin:0;">✅ ${isTestBooking ? "Booking Confirmed" : "Application Confirmed"}</h1>
              </div>
              <div style="padding:35px;">
                <p>Hello <strong>${data.full_name}</strong>,</p>
                <p>${userIntroText}</p>
                <p>Our team will review your ${isTestBooking ? "booking request" : "application"} and contact you shortly.</p>
                <div style="margin-top:25px;padding:20px;background:#f8fafc;border-radius:12px;">
                  <strong>Submitted Email:</strong> ${data.email}
                  <br><br>
                  <strong>Mobile:</strong> ${data.mobile || "-"}
                </div>
                <br>
                <p>Regards,<br><strong>ECS Team</strong></p>
              </div>
            </div>
          </div>
        `
      })
    });

    if (!userEmailRes.ok) {
      const errText = await userEmailRes.text();
      throw new Error("User email failed: " + errText);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: "Professional emails sent" })
    };

  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};
