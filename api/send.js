import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {

  // ONLY ALLOW POST
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method Not Allowed"
    });
  }

  try {

    const data = req.body;

    // REQUIRED FIELDS
    if (!data.email || !data.full_name) {
      return res.status(400).json({
        success: false,
        error: "Email and full_name are required"
      });
    }

    // EMAIL VALIDATION
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(data.email)) {
      return res.status(400).json({
        success: false,
        error: "Invalid email address"
      });
    }

    // =========================
    // CREATE ADMIN TABLE HTML
    // =========================

    const allDataHtml = Object.entries(data)
      .map(([key, value]) => `
        <tr>
          <td style="padding:10px;border:1px solid #ddd;background:#f5f5f5;">
            <strong>${key}</strong>
          </td>

          <td style="padding:10px;border:1px solid #ddd;">
            ${value ? value : "-"}
          </td>
        </tr>
      `)
      .join("");

    // =========================
    // SEND ADMIN EMAIL
    // =========================

    const adminResponse = await resend.emails.send({

      from: "ECS Booking <onboarding@resend.dev>",

      to: "applyecs4@gmail.com",

      reply_to: data.email,

      subject: `🔥 New ECS Booking - ${data.full_name}`,

      html: `
        <div style="font-family:Arial;padding:20px;">

          <h2>New ECS Booking Received</h2>

          <p>
            A new booking has been submitted from the website.
          </p>

          <table 
            style="
              width:100%;
              border-collapse:collapse;
              margin-top:20px;
            "
          >
            ${allDataHtml}
          </table>

        </div>
      `
    });

    console.log("ADMIN EMAIL SUCCESS:", adminResponse);

    // =========================
    // SEND USER CONFIRMATION
    // =========================

    const userResponse = await resend.emails.send({

      from: "ECS Booking <onboarding@resend.dev>",

      to: data.email,

      subject: "✅ ECS Booking Confirmation",

      html: `
        <div style="font-family:Arial;padding:20px;line-height:1.6;">

          <h2>
            Thank you, ${data.full_name}
          </h2>

          <p>
            Your ECS booking request has been received successfully.
          </p>

          <p>
            Our team will contact you shortly regarding your booking.
          </p>

          <hr style="margin:25px 0;" />

          <h3>Your Submitted Details:</h3>

          <table 
            style="
              width:100%;
              border-collapse:collapse;
              margin-top:15px;
            "
          >
            ${allDataHtml}
          </table>

          <br>

          <h3>CITB Test Rules:</h3>

          <ul>
            <li>Arrive at least 15 minutes early</li>
            <li>Bring valid original ID</li>
            <li>Phones & bags must be stored in lockers</li>
            <li>Cheating may result in cancellation</li>
          </ul>

          <br>

          <p>
            Regards,<br>
            ECS Cards Team
          </p>

        </div>
      `
    });

    console.log("USER EMAIL SUCCESS:", userResponse);

    // =========================
    // SUCCESS RESPONSE
    // =========================

    return res.status(200).json({
      success: true,
      message: "Emails sent successfully",
      adminResponse,
      userResponse
    });

  } catch (error) {

    console.error("EMAIL ERROR:", error);

    return res.status(500).json({
      success: false,
      error: error.message || "Email sending failed"
    });
  }
}
