import { Resend } from "resend";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb"
    }
  }
};

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {

  // ONLY POST
  if (req.method !== "POST") {

    return res.status(405).json({
      success: false,
      error: "Method Not Allowed"
    });

  }

  try {

    const data = req.body || {};

    // REQUIRED FIELDS
    if (!data.email || !data.full_name) {

      return res.status(400).json({
        success: false,
        error: "Email and full_name are required"
      });

    }

    // EMAIL VALIDATION
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(data.email)) {

      return res.status(400).json({
        success: false,
        error: "Invalid email address"
      });

    }

    // =========================
    // REMOVE FILES FROM TABLE
    // =========================

    const normalFields = { ...data };

    delete normalFields.photo;
    delete normalFields.id_proof;
    delete normalFields.hs_test_proof;

    // =========================
    // ATTACHMENTS
    // =========================

    const attachments = [];

    // PHOTO
    if (
      typeof data.photo === "string" &&
      data.photo.startsWith("data:")
    ) {

      attachments.push({
        filename: "photo.png",
        content: data.photo.split(",")[1]
      });

    }

    // ID PROOF
    if (
      typeof data.id_proof === "string" &&
      data.id_proof.startsWith("data:")
    ) {

      attachments.push({
        filename: "id-proof.png",
        content: data.id_proof.split(",")[1]
      });

    }

    // HS TEST
    if (
      typeof data.hs_test_proof === "string" &&
      data.hs_test_proof.startsWith("data:")
    ) {

      attachments.push({
        filename: "hs-proof.png",
        content: data.hs_test_proof.split(",")[1]
      });

    }

    // =========================
    // TABLE HTML
    // =========================

    const allDataHtml =
      Object.entries(normalFields)
        .map(([key, value]) => {

          return `
            <tr>
              <td style="
                padding:10px;
                border:1px solid #ddd;
                background:#f5f5f5;
              ">
                <strong>${String(key)}</strong>
              </td>

              <td style="
                padding:10px;
                border:1px solid #ddd;
              ">
                ${String(value || "-")}
              </td>
            </tr>
          `;

        })
        .join("");

    // =========================
    // ADMIN EMAIL
    // =========================

    await resend.emails.send({

      from: "ECS Booking <onboarding@resend.dev>",

      to: "applyecs4@gmail.com",

      reply_to: data.email,

      subject:
        `🔥 New ECS Booking - ${data.full_name}`,

      attachments,

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

            <h2>
              New ECS Booking Received
            </h2>

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

    // =========================
    // USER EMAIL
    // =========================

    await resend.emails.send({

      from: "ECS Booking <onboarding@resend.dev>",

      to: data.email,

      subject:
        "✅ ECS Booking Confirmation",

      html: `
        <div style="
          font-family:Arial;
          padding:20px;
        ">

          <h2>
            Thank you ${data.full_name}
          </h2>

          <p>
            Your ECS booking request
            has been received.
          </p>

        </div>
      `
    });

    // SUCCESS JSON
    return res.status(200).json({
      success: true,
      message: "Emails sent successfully"
    });

  } catch (error) {

    console.error("EMAIL ERROR:", error);

    return res.status(500).json({
      success: false,
      error:
        error.message ||
        "Internal Server Error"
    });

  }

}
