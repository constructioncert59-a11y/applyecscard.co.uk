import { Resend } from "resend";

// =========================
// BODY SIZE LIMIT
// =========================

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "50mb"
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

    // =========================
    // GET DATA
    // =========================

    const data = req.body || {};

    console.log("FULL DATA:", data);

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
          "Email and Full Name required"
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
        error:
          "Invalid Email"
      });

    }

    // =========================
    // REMOVE FILES FROM HTML TABLE
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
    // CREATE TABLE
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
        "Apply ECS <onboarding@resend.dev>",

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
            background:#fff;
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

    console.log(
      "ADMIN EMAIL SENT"
    );

    // =========================
    // USER CONFIRMATION EMAIL
    // =========================

    await resend.emails.send({

      from:
        "Apply ECS <onboarding@resend.dev>",

      to:
        data.email,

      subject:
        "✅ ECS Booking Confirmation",

      html: `

        <div style="
          font-family:Arial;
          background:#f4f4f4;
          padding:30px;
        ">

          <div style="
            max-width:700px;
            margin:auto;
            background:#fff;
            border-radius:12px;
            padding:30px;
          ">

            <h1 style="
              color:green;
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
              Your ECS booking has been received successfully.
            </p>

            <p>
              Our team will contact you shortly.
            </p>

            <hr>

            <h3>
              Your Details
            </h3>

            <table style="
              width:100%;
              border-collapse:collapse;
            ">

              <tr>

                <td style="
                  border:1px solid #ddd;
                  padding:10px;
                ">
                  Full Name
                </td>

                <td style="
                  border:1px solid #ddd;
                  padding:10px;
                ">
                  ${data.full_name || "-"}
                </td>

              </tr>

              <tr>

                <td style="
                  border:1px solid #ddd;
                  padding:10px;
                ">
                  Email
                </td>

                <td style="
                  border:1px solid #ddd;
                  padding:10px;
                ">
                  ${data.email || "-"}
                </td>

              </tr>

              <tr>

                <td style="
                  border:1px solid #ddd;
                  padding:10px;
                ">
                  Mobile
                </td>

                <td style="
                  border:1px solid #ddd;
                  padding:10px;
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

    console.log(
      "USER EMAIL SENT"
    );

    // =========================
    // SUCCESS
    // =========================

    return res.status(200).json({

      success: true,

      message:
        "Both emails sent successfully"

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
