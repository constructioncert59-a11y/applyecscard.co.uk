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

    // =========================
    // REQUIRED FIELDS
    // =========================

    if (!data.email || !data.full_name) {
      return res.status(400).json({
        success: false,
        error: "Email and full_name are required"
      });
    }

    // =========================
    // EMAIL VALIDATION
    // =========================

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(data.email)) {
      return res.status(400).json({
        success: false,
        error: "Invalid email address"
      });
    }

    // =========================
    // CREATE TABLE HTML
    // =========================

    const allDataHtml = Object.entries(data)
      .map(([key, value]) => {

        // SAFE STRING
        const safeKey = String(key)
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");

        // =========================
        // FILE OBJECT SUPPORT
        // =========================

        if (typeof value === "object" && value !== null) {

          // IMAGE URL
          if (value.url) {

            const fileUrl = value.url;

            // IMAGE FILE
            if (
              fileUrl.includes(".jpg") ||
              fileUrl.includes(".jpeg") ||
              fileUrl.includes(".png") ||
              fileUrl.includes(".webp")
            ) {

              return `
                <tr>
                  <td style="padding:10px;border:1px solid #ddd;background:#f5f5f5;">
                    <strong>${safeKey}</strong>
                  </td>

                  <td style="padding:10px;border:1px solid #ddd;">
                    <img 
                      src="${fileUrl}" 
                      alt="${safeKey}" 
                      style="
                        max-width:220px;
                        border-radius:10px;
                        border:1px solid #ddd;
                      "
                    />
                    <br><br>

                    <a href="${fileUrl}" target="_blank">
                      View Full Image
                    </a>
                  </td>
                </tr>
              `;
            }

            // PDF OR OTHER FILE
            return `
              <tr>
                <td style="padding:10px;border:1px solid #ddd;background:#f5f5f5;">
                  <strong>${safeKey}</strong>
                </td>

                <td style="padding:10px;border:1px solid #ddd;">
                  <a href="${fileUrl}" target="_blank">
                    Open Uploaded File
                  </a>
                </td>
              </tr>
            `;
          }

          // FILE OBJECT WITHOUT URL
          return `
            <tr>
              <td style="padding:10px;border:1px solid #ddd;background:#f5f5f5;">
                <strong>${safeKey}</strong>
              </td>

              <td style="padding:10px;border:1px solid #ddd;">
                File Uploaded
              </td>
            </tr>
          `;
        }

        // =========================
        // IMAGE STRING SUPPORT
        // =========================

        if (
          typeof value === "string" &&
          (
            value.startsWith("http") ||
            value.startsWith("data:image")
          )
        ) {

          return `
            <tr>
              <td style="padding:10px;border:1px solid #ddd;background:#f5f5f5;">
                <strong>${safeKey}</strong>
              </td>

              <td style="padding:10px;border:1px solid #ddd;">
                <img 
                  src="${value}" 
                  alt="${safeKey}" 
                  style="
                    max-width:220px;
                    border-radius:10px;
                    border:1px solid #ddd;
                  "
                />
              </td>
            </tr>
          `;
        }

        // =========================
        // NORMAL TEXT
        // =========================

        const safeValue = String(value || "-")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");

        return `
          <tr>
            <td style="padding:10px;border:1px solid #ddd;background:#f5f5f5;">
              <strong>${safeKey}</strong>
            </td>

            <td style="padding:10px;border:1px solid #ddd;">
              ${safeValue}
            </td>
          </tr>
        `;
      })
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
        <div style="
          font-family:Arial;
          padding:20px;
          background:#f9f9f9;
        ">

          <div style="
            max-width:700px;
            margin:auto;
            background:white;
            padding:25px;
            border-radius:12px;
          ">

            <h2 style="margin-bottom:10px;">
              New ECS Booking Received
            </h2>

            <p>
              A new ECS booking request has been submitted.
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
        <div style="
          font-family:Arial;
          padding:20px;
          background:#f9f9f9;
          line-height:1.6;
        ">

          <div style="
            max-width:700px;
            margin:auto;
            background:white;
            padding:25px;
            border-radius:12px;
          ">

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

            <h3>Your Submitted Details</h3>

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

            <h3>CITB Test Rules</h3>

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
