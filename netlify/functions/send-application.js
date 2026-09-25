// netlify/functions/send-application.js
//
// Handles submissions from ecscardbooking.html (the ECS card APPLICATION form,
// separate from the CITB test booking form which uses send.js).
// Emails the application details via Resend, with any uploaded files
// (photo, ID proof, H&S test proof) attached to the email.
//
// Required Netlify environment variable:
//   RESEND_API_KEY  -> same key already set up for send.js
//
// IMPORTANT: FROM_EMAIL must be on a domain verified in Resend (resend.com/domains),
// otherwise sending will fail even with a valid API key.

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const TO_EMAIL = "booking@applyecscard.co.uk";     // where applications are sent
const FROM_EMAIL = "bookings@applyecscard.co.uk";  // must be verified in Resend

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ success: false, error: "Method not allowed" }),
    };
  }

  if (!RESEND_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: "Server is missing RESEND_API_KEY. Add it in Netlify > Site settings > Environment variables.",
      }),
    };
  }

  let data;
  try {
    data = JSON.parse(event.body || "{}");
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, error: "Invalid JSON body" }),
    };
  }

  const requiredFields = [
    "full_name",
    "dob",
    "ni_number",
    "gender",
    "street_address",
    "city",
    "postcode",
    "mobile",
    "email",
    "confirm_email",
    "ecs_card_type",
    "occupation",
    "hs_test",
  ];
  const missing = requiredFields.filter((f) => !data[f]);
  if (missing.length) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        success: false,
        error: "Missing required fields: " + missing.join(", "),
      }),
    };
  }

  if (data.email !== data.confirm_email) {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, error: "Email addresses do not match." }),
    };
  }

  // Build attachments from any base64 data URLs sent by the form.
  // Resend expects { filename, content } where content is base64 WITHOUT the
  // "data:<mime>;base64," prefix, so we strip that off here.
  const attachments = [];
  const fileFields = [
    { key: "photo", filename: "passport-photo" },
    { key: "id_proof", filename: "id-proof" },
    { key: "hs_test_proof", filename: "hs-test-proof" },
  ];

  for (const { key, filename } of fileFields) {
    const dataUrl = data[key];
    if (typeof dataUrl === "string" && dataUrl.startsWith("data:")) {
      const match = dataUrl.match(/^data:(.+?);base64,(.+)$/);
      if (match) {
        const mimeType = match[1];
        const base64Content = match[2];
        const ext = mimeType.split("/")[1] || "bin";
        attachments.push({
          filename: `${filename}.${ext}`,
          content: base64Content,
        });
      }
    }
  }

  // Build a readable HTML summary (excluding the raw base64 file data)
  const rows = Object.entries(data)
    .filter(([key]) => !["photo", "id_proof", "hs_test_proof"].includes(key))
    .map(
      ([key, value]) =>
        `<tr><td style="padding:4px 8px;font-weight:600;">${escapeHtml(key)}</td><td style="padding:4px 8px;">${escapeHtml(
          String(value)
        )}</td></tr>`
    )
    .join("");

  const htmlBody = `
    <h2>New ECS Card Application</h2>
    <table style="border-collapse:collapse;">${rows}</table>
    <p>${attachments.length} file(s) attached.</p>
  `;

  try {
    const emailPayload = {
      from: FROM_EMAIL,
      to: [TO_EMAIL],
      reply_to: data.email,
      subject: `New ECS Card Application – ${data.full_name}`,
      html: htmlBody,
    };

    if (attachments.length) {
      emailPayload.attachments = attachments;
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailPayload),
    });

    const resendResult = await response.json();

    if (!response.ok) {
      return {
        statusCode: 502,
        body: JSON.stringify({
          success: false,
          error: (resendResult && resendResult.message) || "Failed to send email via Resend.",
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: err.message || "Unknown server error" }),
    };
  }
};

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
