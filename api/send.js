import { Resend } from "resend";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "50mb"
    }
  }
};

const resend = new Resend(
  process.env.RESEND_API_KEY
);

export default async function handler(req, res) {

  if (req.method !== "POST") {

    return res.status(405).json({
      success: false,
      error: "Method Not Allowed"
    });

  }

  try {

    const data = req.body || {};

    console.log("FULL DATA:", data);

    // =========================
    // VALIDATION
    // =========================

    if (
      !data.email ||
      !data.full_name
    ) {

      return res.status(400).json({
        success: false,
        error:
          "Full Name and Email required"
      });

    }

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

        filename:
          "passport-photo.png",

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

        filename:
          "identity-proof.png",

        content:
          data.id_proof.split(",")[1]

      });

    }

    // HS TEST
    if (
      typeof data.hs_test_proof === "string" &&
      data.hs_test_proof.startsWith("data:")
    ) {

      attachments.push({

        filename:
          "hs-test-proof.png",

        content:
          data.hs_test_proof.split(",")[1]

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
    // PROFESSIONAL TABLE
    // =========================

    const tableRows =
      Object.entries(normalFields)
      .map(([key, value]) => {

        return `

          <tr>

            <td style="
              padding:14px;
              border:1px solid #e5e5e5;
              background:#f8fafc;
              font-weight:600;
              text-transform:capitalize;
              width:35%;
            ">

              ${key.replaceAll("_", " ")}

            </td>

            <td style="
              padding:14px;
              border:1px solid #e5e5e5;
              color:#111827;
            ">

              ${value || "-"}

            </td>

          </tr>

        `;

      }).join("");

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
        `🔥 New ECS Card Application - ${data.full_name}`,

      attachments,

     html: `

<div style="
  margin:0;
  padding:40px;
  background:#edf2f7;
  font-family:Arial,sans-serif;
">

  <div style="
    max-width:920px;
    margin:auto;
    background:#ffffff;
    border-radius:18px;
    overflow:hidden;
    box-shadow:0 20px 60px rgba(0,0,0,0.12);
    border:1px solid #dbe3ec;
  ">

    <!-- TOP HEADER -->

    <div style="
      background:#0f172a;
      padding:35px 45px;
      color:#ffffff;
    ">

      <table width="100%">

        <tr>

          <td>

            <div style="
              font-size:34px;
              font-weight:800;
              letter-spacing:1px;
            ">
              ECS APPLICATION
            </div>

            <div style="
              margin-top:8px;
              font-size:15px;
              opacity:0.9;
            ">
              Electrotechnical Card Registration Submission
            </div>

          </td>

          <td align="right">

            <div style="
              background:#22c55e;
              color:#ffffff;
              display:inline-block;
              padding:12px 20px;
              border-radius:999px;
              font-size:13px;
              font-weight:bold;
              box-shadow:0 4px 15px rgba(34,197,94,0.4);
            ">
              ✓ APPLICATION RECEIVED
            </div>

          </td>

        </tr>

      </table>

    </div>

    <!-- BODY -->

    <div style="
      padding:45px;
    ">

      <!-- STATUS -->

      <div style="
        background:#f0fdf4;
        border:1px solid #bbf7d0;
        padding:22px;
        border-radius:14px;
        margin-bottom:35px;
      ">

        <div style="
          font-size:18px;
          font-weight:700;
          color:#166534;
        ">
          Application Successfully Submitted
        </div>

        <div style="
          margin-top:10px;
          color:#166534;
          line-height:1.8;
          font-size:15px;
        ">
          Applicant details, supporting identity documents and uploaded files
          have been securely received for ECS processing and verification.
        </div>

      </div>

      <!-- APPLICANT -->

      <h2 style="
        margin-top:0;
        margin-bottom:25px;
        color:#111827;
        font-size:24px;
      ">
        Applicant Information
      </h2>

      <!-- TABLE -->

      <table style="
        width:100%;
        border-collapse:collapse;
        font-size:15px;
      ">

        ${tableRows}

      </table>

      <!-- DOCUMENTS -->

      <div style="
        margin-top:40px;
        border:1px solid #e5e7eb;
        border-radius:16px;
        overflow:hidden;
      ">

        <div style="
          background:#f8fafc;
          padding:18px 25px;
          border-bottom:1px solid #e5e7eb;
          font-weight:700;
          color:#111827;
          font-size:18px;
        ">
          Uploaded Documents
        </div>

        <div style="
          padding:25px;
          background:#ffffff;
        ">

          <table width="100%">

            <tr>

              <td style="
                padding:14px;
                border:1px solid #e5e7eb;
                border-radius:10px;
                background:#f9fafb;
                font-weight:600;
              ">
                📎 Passport Size Photograph Attached
              </td>

            </tr>

            <tr>

              <td style="
                padding:14px;
                border:1px solid #e5e7eb;
                background:#f9fafb;
                font-weight:600;
              ">
                📎 Identity Verification Document Attached
              </td>

            </tr>

            <tr>

              <td style="
                padding:14px;
                border:1px solid #e5e7eb;
                background:#f9fafb;
                font-weight:600;
              ">
                📎 Health & Safety Qualification Proof Attached
              </td>

            </tr>

          </table>

        </div>

      </div>

      <!-- PAYMENT -->

      <div style="
        margin-top:40px;
        background:#eff6ff;
        border:1px solid #bfdbfe;
        border-radius:16px;
        padding:28px;
      ">

        <div style="
          font-size:20px;
          font-weight:700;
          color:#1d4ed8;
          margin-bottom:12px;
        ">
          Payment Processing
        </div>

        <div style="
          color:#1e3a8a;
          line-height:1.9;
          font-size:15px;
        ">
          The applicant has proceeded to secure payment processing
          for ECS application handling and verification services.
        </div>

      </div>

    </div>

    <!-- FOOTER -->

    <div style="
      background:#f9fafb;
      border-top:1px solid #e5e7eb;
      padding:28px 40px;
      font-size:13px;
      color:#6b7280;
      line-height:1.8;
    ">

      This notification confirms that the submitted ECS application details
      and uploaded supporting documents were successfully received through
      the online booking system.

      <br><br>

      Generated automatically by the ECS Application Processing Portal.

    </div>

  </div>

</div>

`

    });

    // =========================
    // USER EMAIL
    // =========================

    await resend.emails.send({

  from:
    "ECS Applications <onboarding@resend.dev>",

  to:
    "applyecs4@gmail.com",

  reply_to:
    data.email,

  subject:
    `ECS Card Application Submission - ${data.full_name}`,

  attachments,

  html: `

  <div style="
    margin:0;
    padding:0;
    background:#eef2f7;
    font-family:Arial,sans-serif;
  ">

    <div style="
      max-width:900px;
      margin:40px auto;
      background:#ffffff;
      border-radius:14px;
      overflow:hidden;
      border:1px solid #dbe2ea;
      box-shadow:0 15px 40px rgba(0,0,0,0.08);
    ">

      <!-- GOV HEADER -->

      <div style="
        background:#003078;
        padding:28px 40px;
        color:#ffffff;
      ">

        <table width="100%">

          <tr>

            <td>

              <div style="
                font-size:34px;
                font-weight:700;
                letter-spacing:1px;
              ">
                ECS
              </div>

              <div style="
                margin-top:6px;
                font-size:15px;
                opacity:0.95;
              ">
                Electrotechnical Certification Scheme
              </div>

            </td>

            <td align="right">

              <div style="
                background:#ffffff;
                color:#003078;
                display:inline-block;
                padding:10px 18px;
                border-radius:8px;
                font-size:13px;
                font-weight:bold;
              ">
                OFFICIAL APPLICATION
              </div>

            </td>

          </tr>

        </table>

      </div>

      <!-- BODY -->

      <div style="
        padding:45px;
      ">

        <div style="
          margin-bottom:25px;
        ">

          <h1 style="
            margin:0;
            font-size:28px;
            color:#111827;
          ">
            ECS Card Application Received
          </h1>

          <p style="
            margin-top:12px;
            color:#4b5563;
            line-height:1.8;
            font-size:15px;
          ">
            A new ECS card application has been submitted through the online booking portal.
            Applicant identity documents and supporting files are attached with this submission.
          </p>

        </div>

        <!-- APPLICATION STATUS -->

        <div style="
          background:#ecfdf3;
          border:1px solid #bbf7d0;
          padding:18px 22px;
          border-radius:10px;
          margin-bottom:30px;
        ">

          <strong style="
            color:#166534;
            font-size:15px;
          ">
            ✓ Application Status:
          </strong>

          <span style="
            color:#166534;
            margin-left:8px;
          ">
            Submitted Successfully
          </span>

        </div>

        <!-- TABLE -->

        <table style="
          width:100%;
          border-collapse:collapse;
          font-size:15px;
        ">

          ${tableRows}

        </table>

        <!-- DOCUMENTS -->

        <div style="
          margin-top:35px;
          background:#f8fafc;
          border:1px solid #e5e7eb;
          border-radius:12px;
          padding:25px;
        ">

          <h3 style="
            margin-top:0;
            color:#111827;
          ">
            Uploaded Supporting Documents
          </h3>

          <table width="100%" style="
            margin-top:15px;
          ">

            <tr>

              <td style="
                padding:12px;
                background:#ffffff;
                border:1px solid #e5e7eb;
                border-radius:8px;
              ">
                📎 Passport Size Photograph
              </td>

            </tr>

            <tr>

              <td style="
                padding:12px;
                background:#ffffff;
                border:1px solid #e5e7eb;
              ">
                📎 Identity Proof Document
              </td>

            </tr>

            <tr>

              <td style="
                padding:12px;
                background:#ffffff;
                border:1px solid #e5e7eb;
              ">
                📎 Health & Safety Proof
              </td>

            </tr>

          </table>

        </div>

        <!-- PAYMENT -->

        <div style="
          margin-top:35px;
          background:#fff7ed;
          border:1px solid #fdba74;
          border-radius:12px;
          padding:25px;
        ">

          <h3 style="
            margin-top:0;
            color:#9a3412;
          ">
            Payment Information
          </h3>

          <p style="
            margin:0;
            color:#7c2d12;
            line-height:1.8;
          ">
            Applicant has been redirected securely to the official payment gateway
            to complete ECS application processing fees.
          </p>

        </div>

      </div>

      <!-- FOOTER -->

      <div style="
        background:#f9fafb;
        border-top:1px solid #e5e7eb;
        padding:25px 40px;
        color:#6b7280;
        font-size:13px;
        line-height:1.8;
      ">

        This email was automatically generated by the ECS Online Application Portal.

        <br><br>

        ECS applications are reviewed subject to identity verification,
        qualification checks and supporting documentation approval.

      </div>

    </div>

  </div>

  `

});

    return res.status(200).json({

      success: true,

      message:
        "Professional emails sent"

    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({

      success: false,

      error:
        error.message

    });

  }

}
