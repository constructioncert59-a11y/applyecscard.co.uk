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
  margin:0;
  padding:50px 20px;
  background:#eef3f9;
  font-family:Arial,sans-serif;
">

  <div style="
    max-width:850px;
    margin:auto;
    background:#ffffff;
    border-radius:18px;
    overflow:hidden;
    border:1px solid #dbe4ee;
    box-shadow:0 20px 60px rgba(0,0,0,0.10);
  ">

    <!-- HEADER -->

    <div style="
      background:#003366;
      padding:34px 45px;
      color:#ffffff;
      border-bottom:5px solid #00a3e0;
    ">

      <table width="100%">

        <tr>

          <td>

            <div style="
              font-size:42px;
              font-weight:800;
              letter-spacing:1px;
            ">
              ECS
            </div>

            <div style="
              margin-top:8px;
              font-size:15px;
              opacity:0.95;
            ">
              Electrotechnical Certification Services
            </div>

          </td>

          <td align="right">

            <div style="
              background:#16a34a;
              color:#ffffff;
              padding:12px 24px;
              border-radius:999px;
              display:inline-block;
              font-size:13px;
              font-weight:700;
              letter-spacing:.5px;
            ">
              ✓ BOOKING CONFIRMED
            </div>

          </td>

        </tr>

      </table>

    </div>

    <!-- BODY -->

    <div style="
      padding:45px;
    ">

      <!-- TITLE -->

      <h1 style="
        margin-top:0;
        font-size:30px;
        color:#111827;
      ">
        ECS Booking Confirmation
      </h1>

      <p style="
        margin-top:14px;
        color:#4b5563;
        line-height:1.9;
        font-size:15px;
      ">
        Dear
        <strong>
          ${data.full_name}
        </strong>,
        your ECS application has been successfully submitted
        through the online booking portal.
      </p>

      <!-- STATUS -->

      <div style="
        margin-top:30px;
        background:#f0fdf4;
        border:1px solid #bbf7d0;
        border-left:6px solid #16a34a;
        border-radius:16px;
        padding:24px;
      ">

        <div style="
          font-size:21px;
          font-weight:700;
          color:#166534;
        ">
          Application Status: Confirmed
        </div>

        <div style="
          margin-top:10px;
          color:#166534;
          line-height:1.9;
          font-size:15px;
        ">
          Your uploaded details and supporting verification
          documents have been received successfully and are
          currently under review.
        </div>

      </div>

      <!-- DETAILS -->

      <div style="
        margin-top:40px;
        border:1px solid #dbe4ee;
        border-radius:18px;
        overflow:hidden;
      ">

        <div style="
          background:#f8fafc;
          padding:18px 25px;
          border-bottom:1px solid #e5e7eb;
          font-size:22px;
          font-weight:700;
          color:#111827;
        ">
          Applicant Details
        </div>

        <table style="
          width:100%;
          border-collapse:collapse;
          font-size:15px;
        ">

          <tr>

            <td style="
              border:1px solid #e5e7eb;
              padding:16px;
              background:#f9fafb;
              font-weight:700;
              width:35%;
            ">
              Full Name
            </td>

            <td style="
              border:1px solid #e5e7eb;
              padding:16px;
            ">
              ${data.full_name || "-"}
            </td>

          </tr>

          <tr>

            <td style="
              border:1px solid #e5e7eb;
              padding:16px;
              background:#f9fafb;
              font-weight:700;
            ">
              Email Address
            </td>

            <td style="
              border:1px solid #e5e7eb;
              padding:16px;
            ">
              ${data.email || "-"}
            </td>

          </tr>

          <tr>

            <td style="
              border:1px solid #e5e7eb;
              padding:16px;
              background:#f9fafb;
              font-weight:700;
            ">
              Mobile Number
            </td>

            <td style="
              border:1px solid #e5e7eb;
              padding:16px;
            ">
              ${data.mobile || "-"}
            </td>

          </tr>

        </table>

      </div>

      <!-- REFERENCE -->

      <div style="
        margin-top:35px;
        background:#eff6ff;
        border:1px solid #bfdbfe;
        border-left:6px solid #2563eb;
        border-radius:16px;
        padding:28px;
      ">

        <table width="100%">

          <tr>

            <td>

              <div style="
                font-size:13px;
                color:#6b7280;
              ">
                Application Reference
              </div>

              <div style="
                margin-top:8px;
                font-size:22px;
                font-weight:800;
                color:#111827;
              ">
                ECS-${Date.now()}
              </div>

            </td>

            <td align="right">

              <div style="
                font-size:13px;
                color:#6b7280;
              ">
                Current Status
              </div>

              <div style="
                margin-top:8px;
                font-size:18px;
                font-weight:700;
                color:#16a34a;
              ">
                Under Review
              </div>

            </td>

          </tr>

        </table>

      </div>

      <!-- BUTTON -->

      <div style="
        margin-top:40px;
        text-align:center;
      ">

        <a href="https://www.ecscard.org.uk/" style="
          background:#003366;
          color:#ffffff;
          text-decoration:none;
          padding:16px 32px;
          border-radius:10px;
          display:inline-block;
          font-size:15px;
          font-weight:700;
          box-shadow:0 8px 20px rgba(0,51,102,0.20);
        ">
          View ECS Information
        </a>

      </div>

    </div>

    <!-- FOOTER -->

    <div style="
      background:#f8fafc;
      border-top:1px solid #e5e7eb;
      padding:30px 40px;
      color:#6b7280;
      font-size:13px;
      line-height:1.9;
    ">

      This email confirms successful receipt of your ECS
      application details and supporting verification documents.

      <br><br>

      Applications are reviewed following document verification,
      qualification checks and payment confirmation procedures.

    </div>

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
 
