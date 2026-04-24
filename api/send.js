import { Resend } from "resend";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const form = formidable({
    multiples: true,
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("FORMIDABLE ERROR:", err); // 👈 LOG
      return res.status(500).json({ error: "Parsing error" });
    }

    try {
      // 👉 FIX array issue
      const email = Array.isArray(fields.email) ? fields.email[0] : fields.email;
      const name = Array.isArray(fields.full_name) ? fields.full_name[0] : fields.full_name;

      if (!email || !name) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const allDataHtml = Object.entries(fields)
        .map(([key, value]) => `<p><strong>${key}:</strong> ${value}</p>`)
        .join("");

      await resend.emails.send({
        from: "onboarding@resend.dev",
        to: "applyecs4@gmail.com",
        subject: "🔥 New ECS Booking",
        html: `<h2>New Booking</h2>${allDataHtml}`,
      });

      await resend.emails.send({
        from: "onboarding@resend.dev",
        to: email,
        subject: "Booking Confirmation",
        html: `<h2>Thank you ${name}</h2>`,
      });

      return res.status(200).json({ success: true });

    } catch (error) {
      console.error("ERROR:", error);
      return res.status(500).json({ error: "Email sending failed" });
    }
  });
}
