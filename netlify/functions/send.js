// netlify/functions/send.js
//
// This function receives the JSON payload from book.html's fetch("/.netlify/functions/send", ...)
// and sends a booking notification email using the Resend API.
//
// Required Netlify environment variable:
//   RESEND_API_KEY  -> your Resend API key (Netlify dashboard > Site settings > Environment variables)
//
// IMPORTANT: Resend requires the "from" address to be on a domain you have verified in Resend.
// If applyecscard.co.uk is not yet verified in your Resend account, sending will fail.
// See https://resend.com/domains to verify your domain, then update FROM_EMAIL below.

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const TO_EMAIL = "booking@applyecscard.co.uk";     // where booking notifications are sent
const FROM_EMAIL = "bookings@applyecscard.co.uk";  // must be on a domain verified in Resend

exports.handler = async function (event) {
  // Only allow POST
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

  // Basic required-field check (mirrors the required fields in the form)
  const requiredFields = [
    "full_name",
    "dob",
    "ni_number",
    "email",
    "confirm_email",
    "mobile",
    "street_address",
    "city",
    "postcode",
    "test_type",
    "test_centre",
    "test_date",
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

  // Build a readable HTML summary of the booking
  const rows = Object.entries(data)
    .map(
      ([key, value]) =>
        `<tr><td style="padding:4px 8px;font-weight:600;">${escapeHtml(key)}</td><td style="padding:4px 8px;">${escapeHtml(
          String(value)
        )}</td></tr>`
    )
    .join("");

  const htmlBody = `
    <h2>New CITB Test Booking Request</h2>
    <table style="border-collapse:collapse;">${rows}</table>
  `;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [TO_EMAIL],
        reply_to: data.email,
        subject: `New CITB Booking Request – ${data.full_name}`,
        html: htmlBody,
      }),
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
