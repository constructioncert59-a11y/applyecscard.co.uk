import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method Not Allowed"
    });
  }

  try {

    const data = req.body;

    if (!data.email || !data.full_name) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields"
      });
    }

    // CREATE TABLE HTML
    const allDataHtml = Object.entries(data)
      .map(([key, value]) => {

        // IMAGE PREVIEW
        if (
          typeof value === "string" &&
          value.startsWith("data:image")
        ) {

          return `
            <tr>
              <td style="padding:10px;border:1px solid #ddd;">
                <strong>${key}</strong>
              </td>

              <td style="padding:10px;border:1px solid #ddd;">
                <img 
                  src="${value}" 
                  style="
                    max-width:250px;
                    border-radius:10px;
                  "
                />
              </td>
            </tr>
          `;
        }

        // NORMAL FIELD
        return `
          <tr>
            <td style="padding:10px;border:1px solid #ddd;">
              <strong>${key}</strong>
            </td>

            <td style="padding:10px;border:1px solid #ddd;">
              ${value || "-"}
            </td>
          </tr>
        `;
      })
      .join("");

    // ADMIN EMAIL
    await resend.emails.send({

      from: "ECS Booking <onboarding@resend.dev>",

      to: "applyecs4@gmail.com",

      reply_to: data.email,

      subject: `New ECS Booking - ${data.full_name}`,

      html: `
        <div style="font-family:Arial;padding:20px;">

          <h2>New ECS Booking</h2>

          <table 
            style="
              width:100%;
              border-collapse:collapse;
            "
          >
            ${allDataHtml}
          </table>

        </div>
      `
    });

    // USER EMAIL
    await resend.emails.send({

      from: "ECS Booking <onboarding@resend.dev>",

      to: data.email,

      subject: "Booking Confirmation",

      html: `
        <div style="font-family:Arial;padding:20px;">

          <h2>Thank You ${data.full_name}</h2>

          <p>
            Your booking has been received successfully.
          </p>

        </div>
      `
    });

    return res.status(200).json({
      success: true
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
