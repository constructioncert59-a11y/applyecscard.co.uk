import { Resend } from "resend";

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

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(data.email)) {

      return res.status(400).json({
        success: false,
        error: "Invalid email address"
      });

    }

    // =========================
    // REMOVE FILE URLS FROM TABLE
    // =========================

    const normalFields = { ...data };

    delete normalFields.photo;
    delete normalFields.id_proof;
    delete normalFields.hs_test_proof;

    // =========================
    // CREATE TABLE HTML
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
    // FILE LINKS HTML
    // =========================

    const fileLinksHtml = `
      <tr>
        <td style="padding:10px;border:1px solid #ddd;">
          <strong>Photo</strong>
        </td>

        <td style="padding:10px;border:1px solid #ddd;">
          ${
            data.photo
              ? `<a href="${data.photo}" target="_blank">View Photo</a>`
              : "-"
          }
        </td>
      </tr>

      <tr>
        <td style="padding:10px;border:1px solid #ddd;">
          <strong>ID Proof</strong>
        </td>

        <td style="padding:10px;border:1px solid #ddd;">
          ${
            data.id_proof
              ? `<a href="${data.id_proof}" target="_blank">View ID Proof</a>`
              : "-"
          }
        </td>
      </tr>

      <tr>
        <td style="padding:10px;border:1px solid #ddd;">
          <strong>HS Test Proof</strong>
        </td>

        <td style="padding:10px;border:1px solid #ddd;">
          ${
            data.hs_test_proof
              ? `<a href="${data.hs_test_proof}" target="_blank">View HS Proof</a>`
              : "-"
          }
        </td>
      </tr>
    `;

    // =========================
    // ADMIN EMAIL
    // =========================

    await resend.emails.send({

      from: "ECS Booking <onboarding@resend.dev>",

      to: "applyecs4@gmail.com",

      reply_to: data.email,

      subject:
        `🔥 New ECS Booking - ${data.full_name}`,

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
              ${fileLinksHtml}
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
              Hello <strong>${data.full_name}</strong>,
            </p>

            <p>
              Thank you for submitting your ECS booking application.
              Your form has been received successfully.
            </p>

            <p>
              Our team will contact you shortly.
            </p>

            <hr style="
              margin:25px 0;
              border:none;
              border-top:1px solid #ddd;
            " />

            <table style="
              width:100%;
              border-collapse:collapse;
            ">

              <tr>
                <td style="padding:10px;border:1px solid #ddd;">
                  Full Name
                </td>

                <td style="padding:10px;border:1px solid #ddd;">
                  ${data.full_name || "-"}
                </td>
              </tr>

              <tr>
                <td style="padding:10px;border:1px solid #ddd;">
                  Email
                </td>

                <td style="padding:10px;border:1px solid #ddd;">
                  ${data.email || "-"}
                </td>
              </tr>

              <tr>
                <td style="padding:10px;border:1px solid #ddd;">
                  Mobile
                </td>

                <td style="padding:10px;border:1px solid #ddd;">
                  ${data.mobile || "-"}
                </td>
              </tr>

            </table>

            <br>

            <p>
              Regards,<br>
              <strong>ECS Team</strong>
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
