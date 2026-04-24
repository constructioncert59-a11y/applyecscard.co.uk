import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const data = req.body;

    if (!data.email || !data.full_name) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const allDataHtml = Object.entries(data)
      .map(([key, value]) => `<p><strong>${key}:</strong> ${value || "-"}</p>`)
      .join("");

    // ADMIN EMAIL
    await resend.emails.send({
      from: "booking@applyecscard.co.uk",
      to: "applyecs4@gmail.com",
      subject: "🔥 New ECS Booking",
      html: `<h2>New Booking</h2>${allDataHtml}`
    });

    // USER EMAIL
    await resend.emails.send({
      from: "booking@applyecscard.co.uk",
      to: data.email,
      subject: "Booking Confirmation",
      html: `<h2>Thank you ${data.full_name}</h2>`
    });

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).json({ error: "Email sending failed" });
  }
}
