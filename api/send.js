import { Resend } from "resend";

// =========================
// BODY SIZE LIMIT
// =========================

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "20mb"
    }
  }
};

// =========================
// RESEND
// =========================

const resend = new Resend(
  process.env.RESEND_API_KEY
);

// =========================
// API HANDLER
// =========================

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

    // =========================
    // REQUIRED FIELDS
    // =========================

    if (
      !data.email ||
      !data.full_name
    ) {

      return res.status(400).json({
        success: false,
        error:
          "Email and full_name are required"
      });

    }

    // =========================
    // EMAIL VALIDATION
    // =========================

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

        content:
          data.photo.split(",")[1]

      });

    }

    // ID PROOF
    if (
      typeof data.id_proof === "string" &&
      data.id_proof.startsWith("data:")
    ) {

      attachments.push({

        filename: "id-proof.png",

        content:
          data.id_proof.split(",")[1]

      });

    }

    // HS TEST PROOF
    if (
      typeof data.hs_test_proof === "string" &&
      data.hs_test_proof.startsWith("data:")
    ) {

      attachments.push({

        filename: "hs-proof.png",

        content:
          data.hs_test_proof.split(",")[1]

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

                <strong>
                  ${String(key)}
                </strong>

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

      from:
        "ECS Booking <onboarding@resend.dev>",

      to:
        "applyecs4@gmail.com",

      reply_to:
        data.email,

      subject:
        `🔥 New ECS Booking - ${data.full_name}`,

      attachments,

      html: `
        <div style="
          font-family:Arial;
          background:#f5f5f5;
          padding:30px;
        ">

          <div style="
            max-width:700px;
            margin:auto;
            background:#ffffff;
            border-radius:12px;
            padding:30px;
          ">

            <h2>
              New ECS Booking Received
            </h2>

            <table style="
              width:100%;
              border-collapse:collapse;
              margin-top:20px;
            ">

              ${allDataHtml}

            </table>

          </div>

        </div>
      `
    });

    // =========================
    // USER CONFIRMATION EMAIL
    // =========================

    await resend.emails.send({

      from:
        "ECS Booking <onboarding@resend.dev>",

      to:
        data.email,

      subject:
        "✅ ECS Booking Confirmation",

      html: `
        <div style="
          font-family:Arial;
          background:#f4f4f4;
          padding:30px;
          line-height:1.7;
        ">

          <div style="
            max-width:700px;
            margin:auto;
            background:#ffffff;
            border-radius:12px;
            padding:30px;
          ">

            <h1 style="
              color:#2e7d32;
              margin-bottom:20px;
            ">
              ✅ Booking Confirmed
            </h1>

            <p>
              Hello
              <strong>
                ${data.full_name}
              </strong>,
            </p>

            <p>
              Thank you for submitting your ECS booking application.
              Your form has been received successfully.
            </p>

            <p>
              Our team will review your application
              and contact you shortly.
            </p>

            <hr style="
              margin:25px 0;
              border:none;
              border-top:1px solid #ddd;
            " />

            <h3>
              Submitted Details
            </h3>

            <table style="
              width:100%;
              border-collapse:collapse;
              margin-top:15px;
            ">

              <tr>
                <td style="
                  padding:10px;
                  border:1px solid #ddd;
                ">
                  Full Name
                </td>

                <td style="
                  padding:10px;
                  border:1px solid #ddd;
                ">
                  ${data.full_name || "-"}
                </td>
              </tr>

              <tr>
                <td style="
                  padding:10px;
                  border:1px solid #ddd;
                ">
                  Email
                </td>

                <td style="
                  padding:10px;
                  border:1px solid #ddd;
                ">
                  ${data.email || "-"}
                </td>
              </tr>

              <tr>
                <td style="
                  padding:10px;
                  border:1px solid #ddd;
                ">
                  Mobile
                </td>

                <td style="
                  padding:10px;
                  border:1px solid #ddd;
                ">
                  ${data.mobile || "-"}
                </td>
              </tr>

            </table>

            <br>

            <p>
              Regards,<br>
              <strong>
                ECS Team
              </strong>
            </p>

          </div>

        </div>
      `
    });

    // =========================
    // SUCCESS RESPONSE
    // =========================

    return res.status(200).json({

      success: true,

      message:
        "Emails sent successfully"

    });

  } catch (error) {

    console.error(
      "EMAIL ERROR:",
      error
    );

    return res.status(500).json({

      success: false,

      error:
        error.message ||
        "Internal Server Error"

    });

  }

}
