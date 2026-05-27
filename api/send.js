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
  background:#eef3f9;
  padding:50px 20px;
  font-family:Arial,sans-serif;
">

  <div id="receipt" style="
    max-width:1000px;
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
      color:#ffffff;
      padding:34px 45px;
      border-bottom:5px solid #00a3e0;
    ">

      <table width="100%">

        <tr>

          <td>

            <div style="
              font-size:44px;
              font-weight:800;
              letter-spacing:1px;
            ">
              ECS
            </div>

            <div style="
              margin-top:8px;
              font-size:16px;
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
              ✓ SUBMISSION VERIFIED
            </div>

          </td>

        </tr>

      </table>

    </div>

    <!-- MAIN -->

    <div style="
      padding:45px;
    ">

      <!-- TITLE -->

      <div style="
        margin-bottom:35px;
      ">

        <h1 style="
          margin:0;
          font-size:32px;
          color:#111827;
        ">
          ECS Card Application Receipt
        </h1>

        <p style="
          margin-top:14px;
          color:#4b5563;
          line-height:1.9;
          font-size:15px;
        ">
          This receipt confirms that the applicant information,
          uploaded documents and verification details have been
          securely received through the ECS application system.
        </p>

      </div>

      <!-- STATUS -->

      <div style="
        background:#f0fdf4;
        border:1px solid #bbf7d0;
        border-left:6px solid #16a34a;
        border-radius:16px;
        padding:24px;
        margin-bottom:35px;
      ">

        <div style="
          font-size:22px;
          font-weight:700;
          color:#166534;
        ">
          Application Status: Processing
        </div>

        <div style="
          margin-top:10px;
          color:#166534;
          line-height:1.9;
          font-size:15px;
        ">
          Supporting identity files and qualification documents
          were uploaded successfully and are pending verification.
        </div>

      </div>

      <!-- TABLE -->

      <div style="
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
          Applicant Information
        </div>

        <table style="
          width:100%;
          border-collapse:collapse;
          font-size:15px;
        ">

          ${tableRows}

        </table>

      </div>

      <!-- DOCUMENTS -->

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
          font-size:20px;
          font-weight:700;
          color:#111827;
        ">
          Uploaded Verification Documents
        </div>

        <div style="
          padding:30px;
          background:#ffffff;
        ">

          <table width="100%" style="
            border-collapse:separate;
            border-spacing:0 14px;
          ">

            <tr>

              <td style="
                padding:18px 20px;
                background:#f9fafb;
                border:1px solid #e5e7eb;
                border-radius:12px;
                font-weight:600;
                color:#111827;
              ">
                📎 Passport Size Photograph Uploaded
              </td>

            </tr>

            <tr>

              <td style="
                padding:18px 20px;
                background:#f9fafb;
                border:1px solid #e5e7eb;
                border-radius:12px;
                font-weight:600;
                color:#111827;
              ">
                📎 Identity Verification Document Uploaded
              </td>

            </tr>

            <tr>

              <td style="
                padding:18px 20px;
                background:#f9fafb;
                border:1px solid #e5e7eb;
                border-radius:12px;
                font-weight:600;
                color:#111827;
              ">
                📎 Health & Safety Qualification Proof Uploaded
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
        border-left:6px solid #2563eb;
        border-radius:18px;
        padding:30px;
      ">

        <div style="
          font-size:22px;
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
          Applicant has securely proceeded to payment processing
          for ECS application handling, verification and review services.
        </div>

      </div>

      <!-- REFERENCE -->

      <div style="
        margin-top:40px;
        background:#f8fafc;
        border:1px solid #e5e7eb;
        border-radius:18px;
        padding:28px;
      ">

        <table width="100%">

          <tr>

            <td>

              <div style="
                font-size:13px;
                color:#6b7280;
              ">
                Submission Reference
              </div>

              <div style="
                margin-top:8px;
                font-size:22px;
                font-weight:800;
                color:#111827;
                letter-spacing:1px;
              ">
                ECS-${Date.now()}
              </div>

            </td>

            <td align="right">

              <div style="
                font-size:13px;
                color:#6b7280;
              ">
                Verification Status
              </div>

              <div style="
                margin-top:8px;
                font-size:18px;
                font-weight:700;
                color:#16a34a;
              ">
                Pending Review
              </div>

            </td>

          </tr>

        </table>

      </div>

      <!-- PRINT BUTTON -->

      <div style="
        margin-top:45px;
        text-align:center;
      ">

        <button onclick="window.print()" style="
          background:#003366;
          color:#ffffff;
          border:none;
          padding:16px 34px;
          border-radius:10px;
          font-size:16px;
          font-weight:700;
          cursor:pointer;
          box-shadow:0 8px 20px rgba(0,51,102,0.25);
        ">
          🖨 Download / Print Receipt
        </button>

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

      This receipt confirms successful receipt of applicant information,
      uploaded identity documentation and ECS verification details
      through the secure online application portal.

      <br><br>

      Applications are processed following verification,
      qualification review and payment confirmation procedures.

    </div>

  </div>

</div>

<style>

@media print {

  body {

    background:#ffffff !important;

  }

  button {

    display:none !important;

  }

}

</style>

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
