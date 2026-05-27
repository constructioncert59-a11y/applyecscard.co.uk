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
      success: false
    });

  }

  try {

    const data = req.body || {};

    // =========================
    // VALIDATION
    // =========================

    if (
      !data.email ||
      !data.full_name
    ) {

      return res.status(400).json({
        success: false,
        error: "Name & Email Required"
      });

    }

    // =========================
    // ATTACHMENTS
    // =========================

    const attachments = [];

    if (
      data.photo &&
      data.photo.startsWith("data:")
    ) {

      attachments.push({

        filename: "photo.png",

        content:
          data.photo.split(",")[1]

      });

    }

    if (
      data.id_proof &&
      data.id_proof.startsWith("data:")
    ) {

      attachments.push({

        filename: "id-proof.png",

        content:
          data.id_proof.split(",")[1]

      });

    }

    if (
      data.hs_test_proof &&
      data.hs_test_proof.startsWith("data:")
    ) {

      attachments.push({

        filename: "hs-proof.png",

        content:
          data.hs_test_proof.split(",")[1]

      });

    }

    // =========================
    // REMOVE FILES
    // =========================

    const normalFields = { ...data };

    delete normalFields.photo;
    delete normalFields.id_proof;
    delete normalFields.hs_test_proof;

    // =========================
    // TABLE ROWS
    // =========================

    const tableRows =
      Object.entries(normalFields)
      .map(([key, value]) => {

        return `

        <tr>

          <td style="
            padding:14px;
            border:1px solid #dbe4ee;
            background:#f8fafc;
            font-weight:700;
            width:35%;
            text-transform:capitalize;
          ">

            ${key.replaceAll("_", " ")}

          </td>

          <td style="
            padding:14px;
            border:1px solid #dbe4ee;
            color:#111827;
          ">

            ${value || "-"}

          </td>

        </tr>

        `;

      }).join("");

    // =========================
    // EMAIL SEND
    // =========================

    await resend.emails.send({

      from:
        "ECS Applications <onboarding@resend.dev>",

      to:
        "applyecs4@gmail.com",

      reply_to:
        data.email,

      subject:
        `ECS Application - ${data.full_name}`,

      attachments,

      html: `

      <div style="
        background:#eef3f9;
        padding:50px 20px;
        font-family:Arial,sans-serif;
      ">

        <div style="
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
                  ">
                    ECS
                  </div>

                  <div style="
                    margin-top:8px;
                    font-size:16px;
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
                    font-size:13px;
                    font-weight:700;
                    display:inline-block;
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

            <h1 style="
              margin-top:0;
              font-size:32px;
              color:#111827;
            ">
              ECS Card Application Receipt
            </h1>

            <p style="
              color:#4b5563;
              line-height:1.9;
              font-size:15px;
            ">
              This receipt confirms successful submission of applicant information,
              uploaded identity documents and ECS verification files.
            </p>

            <!-- STATUS -->

            <div style="
              background:#f0fdf4;
              border:1px solid #bbf7d0;
              border-left:6px solid #16a34a;
              border-radius:16px;
              padding:24px;
              margin-top:30px;
              margin-bottom:35px;
            ">

              <div style="
                font-size:22px;
                font-weight:700;
                color:#166534;
              ">
                Verification Status: Pending Review
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
              ">
                Uploaded Documents
              </div>

              <div style="
                padding:30px;
              ">

                <div style="
                  padding:16px;
                  background:#f9fafb;
                  border:1px solid #e5e7eb;
                  border-radius:12px;
                  margin-bottom:14px;
                  font-weight:600;
                ">
                  📎 Passport Size Photo Uploaded
                </div>

                <div style="
                  padding:16px;
                  background:#f9fafb;
                  border:1px solid #e5e7eb;
                  border-radius:12px;
                  margin-bottom:14px;
                  font-weight:600;
                ">
                  📎 Identity Verification Uploaded
                </div>

                <div style="
                  padding:16px;
                  background:#f9fafb;
                  border:1px solid #e5e7eb;
                  border-radius:12px;
                  font-weight:600;
                ">
                  📎 Health & Safety Proof Uploaded
                </div>

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
                    ">
                      ECS-${Date.now()}
                    </div>

                  </td>

                  <td align="right">

                    <div style="
                      font-size:13px;
                      color:#6b7280;
                    ">
                      Status
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

            This receipt confirms successful receipt of uploaded documents
            and ECS application verification details.

          </div>

        </div>

      </div>

      `

    });

    // =========================
    // SUCCESS
    // =========================

    return res.status(200).json({

      success: true,

      message:
        "Email Sent Successfully"

    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({

      success: false,

      error:
        error.message

    });

  }

}
