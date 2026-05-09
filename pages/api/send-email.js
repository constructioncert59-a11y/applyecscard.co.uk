import { Resend } from "resend";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "20mb",
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

    console.log("FULL DATA:", data);

    let allDataHtml = "";

    // LOOP ALL DATA
    for (const key in data) {

      const value = data[key];

      // =========================
      // IMAGE FILES
      // =========================

      if (
        typeof value === "string" &&
        value.startsWith("data:image")
      ) {

        allDataHtml += `
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

              <img
                src="${value}"
                alt="${key}"
                style="
                  max-width:250px;
                  border-radius:10px;
                  border:1px solid #ccc;
                "
              />

            </td>
          </tr>
        `;

        continue;
      }

      // =========================
      // PDF FILES
      // =========================

      if (
        typeof value === "string" &&
        value.startsWith("data:application/pdf")
      ) {

        allDataHtml += `
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
              PDF Uploaded Successfully
            </td>
          </tr>
        `;

        continue;
      }

      // =========================
      // NORMAL TEXT
      // =========================

      allDataHtml += `
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
      `;
    }

    // =========================
    // ADMIN EMAIL
    // =========================

    await resend.emails.send({

      from: "ECS Booking <onboarding@resend.dev>",

      to: "applyecs4@gmail.com",

      reply_to: data.email,

      subject: `🔥 New ECS Booking - ${data.full_name}`,

      html: `
        <div style="
          font-family:Arial;
          padding:20px;
          background:#f9f9f9;
        ">

          <div style="
            max-width:800px;
            margin:auto;
            background:white;
            padding:25px;
            border-radius:12px;
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

          </div>

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
            Thank you ${data.full_name}
          </h2>

          <p>
            Your ECS booking request has been received successfully.
          </p>

          <p>
            We will contact you shortly.
          </p>

        </div>
      `,
    });

    return res.status(200).json({
      success: true,
    });

  } catch (error) {

    console.error("EMAIL ERROR:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
