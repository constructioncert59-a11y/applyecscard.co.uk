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

    // NORMAL FIELDS
    const normalFields = { ...data };

    delete normalFields.photo;
    delete normalFields.id_proof;
    delete normalFields.hs_test_proof;

    // TABLE HTML
    const allDataHtml = Object.entries(normalFields)
      .map(([key, value]) => `
        <tr>
          <td style="
            padding:10px;
            border:1px solid #ddd;
            background:#f5f5f5;
          ">
            <strong>${key}</strong>
          </td>

          <td style="
            padding:10px;
            border:1px solid #ddd;
          ">
            ${value || "-"}
          </td>
        </tr>
      `)
      .join("");

    // ATTACHMENTS
    const attachments = [];

    // PHOTO
    if (
      data.photo &&
      data.photo.startsWith("data:")
    ) {

      attachments.push({
        filename: "photo.png",
        content: data.photo.split(",")[1],
      });
    }

    // ID PROOF
    if (
      data.id_proof &&
      data.id_proof.startsWith("data:")
    ) {

      attachments.push({
        filename: "id-proof.png",
        content: data.id_proof.split(",")[1],
      });
    }

    // HS TEST PROOF
    if (
      data.hs_test_proof &&
      data.hs_test_proof.startsWith("data:")
    ) {

      attachments.push({
        filename: "hs-proof.png",
        content: data.hs_test_proof.split(",")[1],
      });
    }

    // =========================
    // ADMIN EMAIL
    // =========================

    await resend.emails.send({

      from: "ECS Booking <onboarding@resend.dev>",

      to: "applyecs4@gmail.com",

      reply_to: data.email,

      subject: `🔥 New ECS Booking - ${data.full_name}`,

      attachments,

      html: `
        <div style="
          font-family:Arial;
          padding:20px;
        ">

          <h2>
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

          <br>

          <p>
            Uploaded files are attached with this email.
          </p>

        </div>
      `,
    });

    // =========================
    // USER EMAIL
    // =========================

    await resend.emails.send({

      from: "ECS Booking <onboarding@resend.dev>",

      to: data.email,

      subject: "✅ ECS Booking Confirmation",

      html: `
        <div style="
          font-family:Arial;
          padding:20px;
        ">

          <h2>
            Thank You ${data.full_name}
          </h2>

          <p>
            Your ECS booking request has been received successfully.
          </p>

          <p>
            Our team will contact you shortly.
          </p>

          <br>

          <h3>
            Your Submitted Details
          </h3>

          <table
            style="
              width:100%;
              border-collapse:collapse;
            "
          >
            ${allDataHtml}
          </table>

        </div>
      `,
    });

    return res.status(200).json({
      success: true,
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
