import { Resend } from "resend";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "4mb" // realistic — Vercel hard-caps body at 4.5mb regardless of this value
    }
  }
};

const resend = new Resend(process.env.RESEND_API_KEY);

// Same value Vercel enforces at the platform level (bytes)
const MAX_BODY_BYTES = 4.5 * 1024 * 1024;

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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  try {
    const data = req.body || {};

    // Rough payload size check (base64 fields are the bulk of it)
    const approxSize = JSON.stringify(data).length;
    if (approxSize > MAX_BODY_BYTES) {
      return res.status(413).json({
        success: false,
        error: "Files too large. Please upload photo and ID under ~1.5MB each (compressed) and try again."
      });
    }

    // =========================
    // VALIDATION
    // =========================
    if (!data.email || !data.full_name) {
      return res.status(400).json({ success: false, error: "Full Name and Email required" });
    }

    if (!data.id_proof || typeof data.id_proof !== "string" || !data.id_proof.startsWith("data:")) {
      return res.status(400).json({ success: false, error: "ID document upload is required" });
    }

    if (!data.photo || typeof data.photo !== "string" || !data.photo.startsWith("data:")) {
      return res.status(400).json({ success: false, error: "Photo upload is required" });
    }

    // =========================
    // ATTACHMENTS
    // =========================
    const attachments = [];

    attachments.push({
      filename: "passport-photo." + extFromDataUrl(data.photo, "png"),
      content: data.photo.split(",")[1]
    });

    attachments.push({
      filename: "identity-proof." + extFromDataUrl(data.id_proof, "png"),
      content: data.id_proof.split(",")[1]
    });

    if (typeof data.hs_test_proof === "string" && data.hs_test_proof.startsWith("data:")) {
      attachments.push({
        filename: "hs-test-proof." + extFromDataUrl(data.hs_test_proof, "png"),
        content: data.hs_test_proof.split(",")[1]
      });
    }

    // =========================
    // REMOVE FILES FROM TABLE
    // =========================
    const normalFields = { ...data };
    delete normalFields.photo;
    delete normalFields.id_proof;
    delete normalFields.hs_test_proof;

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

    // =========================
    // SEND FROM ADDRESS
    // =========================
    // ⚠️ IMPORTANT: onboarding@resend.dev can ONLY deliver to the email
    // address you signed up to Resend with, until you verify your own
    // domain in Resend → Domains. Once applyecscard.co.uk is verified there,
    // change this to e.g. "Apply ECS <noreply@applyecscard.co.uk>"
    const FROM_ADDRESS = process.env.RESEND_FROM || "Apply ECS <onboarding@resend.dev>";

    // =========================
    // ADMIN EMAIL (isolated try/catch so a failure here doesn't
    // block the user confirmation email, and vice versa)
    // =========================
    let adminSent = false;
    let userSent = false;
    const errors = [];

    try {
      await resend.emails.send({
        from: FROM_ADDRESS,
        to: process.env.ADMIN_EMAIL || "applyecs4@gmail.com",
        reply_to: data.email,
        subject: `🔥 New ECS Card Application - ${data.full_name}`,
        attachments,
        html: `
          <div style="background:#f3f4f6;padding:40px;font-family:Arial,sans-serif;">
            <div style="max-width:800px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.08);">
              <div style="background:#0f172a;color:white;padding:30px;">
                <h1 style="margin:0;font-size:28px;">ECS CARD APPLICATION</h1>
                <p style="margin-top:10px;opacity:0.8;">New user booking received</p>
              </div>
              <div style="padding:35px;">
                <h2 style="margin-top:0;color:#111827;">Applicant Details</h2>
                <table style="width:100%;border-collapse:collapse;margin-top:25px;font-size:15px;">
                  ${tableRows}
                </table>
                <div style="margin-top:35px;padding:20px;background:#f8fafc;border-radius:12px;">
                  <h3 style="margin-top:0;color:#111827;">Uploaded Documents</h3>
                  <ul style="line-height:2;padding-left:20px;">
                    <li>Passport Size Photo Attached</li>
                    <li>Identity Proof Attached</li>
                    ${data.hs_test_proof ? "<li>HS Test Proof Attached</li>" : ""}
                  </ul>
                </div>
              </div>
              <div style="background:#f9fafb;padding:20px 35px;color:#6b7280;font-size:13px;border-top:1px solid #e5e7eb;">
                Generated automatically from Apply ECS Booking System
              </div>
            </div>
          </div>
        `
      });
      adminSent = true;
    } catch (err) {
      console.error("Admin email failed:", err);
      errors.push(`admin: ${err.message}`);
    }

    try {
      await resend.emails.send({
        from: FROM_ADDRESS,
        to: data.email,
        subject: "✅ ECS Application Confirmation",
        html: `
          <div style="background:#f3f4f6;padding:40px;font-family:Arial,sans-serif;">
            <div style="max-width:700px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;">
              <div style="background:#16a34a;color:white;padding:30px;">
                <h1 style="margin:0;">✅ Application Confirmed</h1>
              </div>
              <div style="padding:35px;">
                <p>Hello <strong>${data.full_name}</strong>,</p>
                <p>Your ECS Card application has been received successfully.</p>
                <p>Our team will review your application and contact you shortly.</p>
                <div style="margin-top:25px;padding:20px;background:#f8fafc;border-radius:12px;">
                  <strong>Submitted Email:</strong> ${data.email}<br><br>
                  <strong>Mobile:</strong> ${data.mobile || "-"}
                </div>
                <br>
                <p>Regards,<br><strong>ECS Team</strong></p>
              </div>
            </div>
          </div>
        `
      });
      userSent = true;
    } catch (err) {
      console.error("User confirmation email failed:", err);
      errors.push(`user: ${err.message}`);
    }

    // Application data (admin email) reaching you is the critical part —
    // treat that as success even if the user confirmation email fails
    // (commonly due to unverified sending domain in Resend).
    if (!adminSent) {
      return res.status(500).json({ success: false, error: "Could not deliver application to admin.", details: errors });
    }

    return res.status(200).json({
      success: true,
      adminSent,
      userSent,
      warning: userSent ? undefined : "Application received, but confirmation email to applicant failed — likely an unverified sending domain in Resend.",
      details: errors.length ? errors : undefined
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
