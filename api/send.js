import { Resend } from "resend";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false, // ❗ required for file upload
  },
};

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const form = formidable({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: "File parsing error" });
    }

    try {
      // 👉 validation
      if (!fields.email || !fields.full_name) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // 👉 HTML data
      const allDataHtml = Object.entries(fields)
        .map(([key, value]) => `<p><strong>${key}:</strong> ${value || "-"}</p>`)
        .join("");

      // 👉 attachments prepare
      const attachments = [];

      if (files.photo) {
        attachments.push({
          filename: files.photo.originalFilename,
          content: fs.readFileSync(files.photo.filepath),
        });
      }

      if (files.id_proof) {
        attachments.push({
          filename: files.id_proof.originalFilename,
          content: fs.readFileSync(files.id_proof.filepath),
        });
      }

      if (files.hs_test_proof) {
        attachments.push({
          filename: files.hs_test_proof.originalFilename,
          content: fs.readFileSync(files.hs_test_proof.filepath),
        });
      }

      // ✅ ADMIN EMAIL (full data + files)
      await resend.emails.send({
        from: "booking@applyecscard.co.uk",
        to: "applyecs4@gmail.com",
        subject: "🔥 New ECS Booking (Full Data + Files)",
        html: `
          <h2>New Booking Received</h2>
          ${allDataHtml}
        `,
        attachments: attachments,
      });

      // ✅ USER EMAIL
      await resend.emails.send({
        from: "booking@applyecscard.co.uk",
        to: fields.email,
        subject: "Booking Confirmation",
        html: `
          <h2>Thank you ${fields.full_name}</h2>
          <p>Your booking request has been received successfully.</p>
        `,
      });

      return res.status(200).json({ success: true });

    } catch (error) {
      console.error("ERROR:", error);
      return res.status(500).json({ error: "Email sending failed" });
    }
  });
}
