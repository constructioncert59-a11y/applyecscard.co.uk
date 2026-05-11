import { Resend } from "resend";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "25mb",
    },
  },
};

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method Not Allowed",
    });
  }

  try {

    const data = req.body;

    // REQUIRED FIELDS
    if (!data.email || !data.full_name) {
      return res.status(400).json({
        success: false,
        error: "Email and full_name are required",
      });
    }

    // EMAIL VALIDATION
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(data.email)) {
      return res.status(400).json({
        success: false,
        error: "Invalid email address",
      });
    }

    // REMOVE FILES FROM TABLE
    const normalFields = { ...data };

    delete normalFields.photo;
    delete normalFields.id_proof;
    delete normalFields.hs_test_proof;

    // ATTACHMENTS
    const attachments = [];

    const addAttachment = (fileData, filename) => {
      if (
        fileData &&
        typeof fileData === "string" &&
        fileData.startsWith("data:")
      ) {
        attachments.push({
          filename,
          content: fileData.split(",")[1],
        });
      }
    };

    addAttachment(data.photo, "photo.png");
    addAttachment(data.id_proof, "id-proof.png");
    addAttachment(data.hs_test_proof, "hs-proof.png");

    // CREATE TABLE
    const allDataHtml = Object.entries(normalFields)
      .map(([key, value]) => {

        const safeKey = String(key)
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");

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
    // ADMIN EMAIL
    // =========================

    const adminResponse = await resend.emails.send({

      // IMPORTANT
      // CHANGE THIS AFTER DOMAIN VERIFY
      from: "Build Cert <booking@applyecscard.co.uk>",

      to: "applyecs4@gmail.com",

      reply_to: data.email,

      subject: `🔥 New ECS Booking - ${data.full_name}`,

      attachments,

      html: `
        <div style="font-family:Arial;padding:20px;background:#f9f9f9;">

          <div style="
            max-width:700px;
            margin:auto;
            background:white;
            padding:25px;
            border-radius:12px;
          ">

            <h2>New ECS Booking Received</h2>

            <p>A new ECS booking request has been submitted.</p>

            <table style="
              width:100%;
              border-collapse:collapse;
              margin-top:20px;
            ">
              ${allDataHtml}
            </table>

            <br>

            <p>Uploaded files are attached with this email.</p>

          </div>

        </div>
      `,
    });

    console.log("ADMIN EMAIL SUCCESS:", adminResponse);

    // =========================
    // USER CONFIRMATION
    // =========================

    const userResponse = await resend.emails.send({

      // IMPORTANT
      // CHANGE THIS AFTER DOMAIN VERIFY
      from: "Build Cert <booking@applyecscard.co.uk>",

      to: data.email,

      reply_to: "booking@applyecscard.co.uk",

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

            <h3>ECS Test Rules</h3>

            <ul>
              <li>Arrive at least 15 minutes early</li>
              <li>Bring valid original ID</li>
              <li>Phones & bags must be stored in lockers</li>
              <li>Cheating may result in cancellation</li>
            </ul>

            <br>

            <p>
              Regards,<br>
              Build Cert Team
            </p>

          </div>

        </div>
      `,
    });

    console.log("USER EMAIL SUCCESS:", userResponse);

    return res.status(200).json({
      success: true,
      message: "Emails sent successfully",
      adminResponse,
      userResponse,
    });

  } catch (error) {

    console.error("EMAIL ERROR:", error);

    return res.status(500).json({
      success: false,
      error: error.message || "Email sending failed",
    });
  }
}
