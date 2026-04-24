import { Resend } from "resend";

const resend = new Resend(process.env.re_9bJiM34e_6QqMF4SXKEMYwaDMgHTYAnEw);

export default async function handler(req, res) {
  if (req.method === "POST") {

    const data = req.body;

    // 👉 ALL DATA HTML me convert
    const allDataHtml = Object.entries(data)
      .map(([key, value]) => `<p><strong>${key}:</strong> ${value}</p>`)
      .join("");

    try {
      // ✅ ADMIN EMAIL (tumhe sab data milega)
      await resend.emails.send({
        from: "onboarding@resend.dev",
        to: "applyecs4@gmail.com",
        subject: "🔥 New ECS Booking Full Data",
        html: `<h2>Full User Data</h2>${allDataHtml}`
      });

      // ✅ USER CONFIRMATION EMAIL
      await resend.emails.send({
        from: "onboarding@resend.dev",
        to: data.email,
        subject: "Booking Confirmation",
        html: `
          <h2>Thank you ${data.full_name}</h2>
          <p>Your booking request has been received.</p>
          <p>We will contact you soon.</p>
        `
      });

      return res.status(200).json({ success: true });

    } catch (error) {
      return res.status(500).json({ error });
    }
  }
}
