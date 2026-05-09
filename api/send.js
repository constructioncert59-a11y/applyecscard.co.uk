import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {

  // ONLY POST METHOD
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method Not Allowed"
    });
  }

  try {

    const data = req.body;

    // REQUIRED FIELDS CHECK
    if (!data.email || !data.full_name) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields"
      });
    }

    // CREATE HTML DATA
    const allDataHtml = Object.entries(data)
      .map(([key, value]) => {
        return `
          <p style="margin:6px 0;">
            <strong>${key}:</strong> ${value || "-"}
          </p>
        `;
      })
      .join("");

    // =========================
    // ADMIN EMAIL
    // =========================

    const adminEmail = await resend.emails.send({

      // TESTING EMAIL
      // CHANGE LATER AFTER DOMAIN VERIFY
      from: "onboarding@resend.dev",

      to: "applyecs4@gmail.com, ecscards@outlook.com",

      subject: "🔥 New ECS Booking",

      html: `
        <div style="font-family:Arial;padding:20px;">
          
          <h2>New ECS Booking Received</h2>

          ${allDataHtml}

        </div>
      `
    });

    // =========================
    // USER CONFIRMATION EMAIL
    // =========================

    const userEmail = await resend.emails.send({

      from: "onboarding@resend.dev",

      to: data.email,

      subject: "Booking Confirmation",

      html: `
        <div style="font-family:Arial;padding:20px;">

          <h2>Thank you ${data.full_name}</h2>

          <p>
            Your booking request has been received successfully.
          </p>

          <p>
            Our team will contact you shortly regarding your booking.
          </p>

          <br/>

          <h3>CITB Test Rules:</h3>

          <ul>
            <li>Arrive at least 15 minutes early</li>
            <li>Bring valid original ID</li>
            <li>Phones & bags must be stored in lockers</li>
            <li>Cheating may result in cancellation</li>
          </ul>

        </div>
      `
    });

    // SUCCESS RESPONSE
    return res.status(200).json({
      success: true,
      adminEmail,
      userEmail
    });

  } catch (error) {

    console.error("EMAIL ERROR:", error);

    return res.status(500).json({
      success: false,
      error: error.message || "Email sending failed"
    });
  }
}
