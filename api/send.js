import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {

  // ONLY POST REQUEST
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

    // CREATE ADMIN HTML
    const allDataHtml = Object.entries(data)
      .map(([key, value]) => `
        <tr>
          <td style="padding:10px;border:1px solid #ddd;">
            <strong>${key}</strong>
          </td>

          <td style="padding:10px;border:1px solid #ddd;">
            ${value || "-"}
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

      subject: "🔥 New ECS Booking",

      html: `
        <div style="font-family:Arial;padding:20px;">

          <h2>New ECS Booking Received</h2>

          <table 
            style="
              width:100%;
              border-collapse:collapse;
            "
          >
            ${allDataHtml}
          </table>

        </div>
      `
    });

    console.log("ADMIN EMAIL:", adminResponse);

    // =========================
    // SEND USER EMAIL
    // =========================

    const userResponse = await resend.emails.send({

      from: "ECS Booking <onboarding@resend.dev>",

      to: data.email,

      subject: "Booking Confirmation",

      html: `
        <div style="font-family:Arial;padding:20px;">

          <h2>Thank you ${data.full_name}</h2>

          <p>
            Your ECS booking request has been received successfully.
          </p>

          <p>
            Our team will contact you shortly regarding your booking.
          </p>

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

    console.log("USER EMAIL:", userResponse);

    // SUCCESS
    return res.status(200).json({
      success: true,
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
