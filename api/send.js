import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const data = req.body;

    // 👉 Validation (important)
    if (!data.email || !data.full_name) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 👉 ALL DATA HTML format
    const allDataHtml = Object.entries(data)
      .map(([key, value]) => `<p><strong>${key}:</strong> ${value || "-"}</p>`)
      .join("");

    // ✅ ADMIN EMAIL (tumhe full data milega)
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "applyecs4@gmail.com",
      subject: "🔥 New ECS Booking Full Data",
      html: `
        <h2>New Booking Received</h2>
        ${allDataHtml}
      `
    });

    // ✅ USER CONFIRMATION EMAIL
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: data.email,
      subject: "Booking Confirmation",
      html: `
        <h2>Thank you ${data.full_name}</h2>
        <p>Your booking request has been received successfully.</p>
        <p>We will contact you shortly with further details.</p>
      `
    });

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).json({ error: "Email sending failed" });
  }
}
