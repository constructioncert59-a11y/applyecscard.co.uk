<?php
// book.php

// --- CONFIG ---
// Email where booking details should be sent:
$adminEmail = "booking@applyecscard.co.uk";

// Payment page (redirect after successful booking)
$paymentUrl = "payment.php"; // same site payment page

// --- MAIN ---
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    // Prevent direct access
    header("Location: /");
    exit;
}

// Helper: safe function for retrieving POST values
function post_value($key) {
    return isset($_POST[$key]) ? trim($_POST[$key]) : "";
}

// Form values
$ecsCard        = post_value("ecsCard");
$ecsCardType    = post_value("ecs_card_type");
$fullName       = post_value("full_name");
$dob            = post_value("dob");
$niNumber       = post_value("ni_number");
$gender         = post_value("gender");
$streetAddress  = post_value("street_address");
$city           = post_value("city");
$postcode       = post_value("postcode");
$mobile         = post_value("mobile");
$email          = post_value("email");
$confirmEmail   = post_value("confirm_email");
$testType       = post_value("test_type");
$testLanguage   = post_value("test_language");
$testCentre     = post_value("test_centre");
$testDate       = post_value("test_date");
$testTime       = post_value("test_time");
$agreeTerms     = isset($_POST["agree_terms"]) ? "Yes" : "No";

// Basic validation
$errors = [];

// Required fields validation
$requiredFields = [
    "ECS card route"      => $ecsCard,
    "Application type"    => $ecsCardType,
    "Full name"           => $fullName,
    "Date of birth"       => $dob,
    "NI number"           => $niNumber,
    "Gender"              => $gender,
    "Street address"      => $streetAddress,
    "Town / city"         => $city,
    "Postcode"            => $postcode,
    "Mobile number"       => $mobile,
    "Email"               => $email,
    "Confirm email"       => $confirmEmail,
    "Test type"           => $testType,
    "Test language"       => $testLanguage,
    "Test centre"         => $testCentre,
    "Preferred test date" => $testDate,
    "Preferred time"      => $testTime
];

foreach ($requiredFields as $label => $value) {
    if ($value === "") {
        $errors[] = $label . " is required.";
    }
}

// Email validation
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = "Please enter a valid email address.";
}

if ($email !== $confirmEmail) {
    $errors[] = "Email and Confirm Email do not match.";
}

// Terms and conditions check
if ($agreeTerms !== "Yes") {
    $errors[] = "You must agree to the booking terms and conditions.";
}

// If errors exist, show simple error page
if (!empty($errors)) {
    echo "<!DOCTYPE html><html><head><meta charset='UTF-8'><title>Booking Error</title></head><body>";
    echo "<h2>There was a problem with your booking.</h2>";
    echo "<ul>";
    foreach ($errors as $err) {
        echo "<li>" . htmlspecialchars($err) . "</li>";
    }
    echo "</ul>";
    echo "<p><a href='javascript:history.back()'>Go back and correct the form.</a></p>";
    echo "</body></html>";
    exit;
}

// Simple security: prevent header injection
$cleanEmail = str_replace(["\r", "\n"], "", $email);
$cleanName  = str_replace(["\r", "\n"], "", $fullName);

// ---------- EMAIL TO ADMIN ----------
$adminSubject = "New CITB Test Booking Request (ECS) - " . $cleanName;

$adminMessage = "
<html>
<head>
<meta charset='UTF-8'>
<style>
  body { font-family: Arial, sans-serif; font-size: 14px; color: #333; }
  .box { border:1px solid #eee; padding:15px; max-width:600px; }
  h2 { color:#005a9c; }
  table { width:100%; border-collapse: collapse; }
  th, td { text-align:left; padding:6px 4px; border-bottom:1px solid #f0f0f0; }
  th { width:40%; font-weight:600; }
</style>
</head>
<body>
<div class='box'>
  <h2>New CITB HS&E Test Booking Request</h2>
  <p>A new booking request has been submitted via the Apply ECS website.</p>

  <h3>Applicant Details</h3>
  <table>
    <tr><th>ECS card route</th><td>" . htmlspecialchars($ecsCard) . "</td></tr>
    <tr><th>Application type</th><td>" . htmlspecialchars($ecsCardType) . "</td></tr>
    <tr><th>Full name</th><td>" . htmlspecialchars($fullName) . "</td></tr>
    <tr><th>Date of birth</th><td>" . htmlspecialchars($dob) . "</td></tr>
    <tr><th>NI number</th><td>" . htmlspecialchars($niNumber) . "</td></tr>
    <tr><th>Gender</th><td>" . htmlspecialchars($gender) . "</td></tr>
  </table>

  <h3>Address</h3>
  <table>
    <tr><th>Street address</th><td>" . htmlspecialchars($streetAddress) . "</td></tr>
    <tr><th>Town / city</th><td>" . htmlspecialchars($city) . "</td></tr>
    <tr><th>Postcode</th><td>" . htmlspecialchars($postcode) . "</td></tr>
  </table>

  <h3>Contact</h3>
  <table>
    <tr><th>Mobile</th><td>" . htmlspecialchars($mobile) . "</td></tr>
    <tr><th>Email</th><td>" . htmlspecialchars($email) . "</td></tr>
  </table>

  <h3>Test Details</h3>
  <table>
    <tr><th>Test type</th><td>" . htmlspecialchars($testType) . "</td></tr>
    <tr><th>Language</th><td>" . htmlspecialchars($testLanguage) . "</td></tr>
    <tr><th>Preferred centre</th><td>" . htmlspecialchars($testCentre) . "</td></tr>
    <tr><th>Preferred date</th><td>" . htmlspecialchars($testDate) . "</td></tr>
    <tr><th>Preferred time</th><td>" . htmlspecialchars($testTime) . "</td></tr>
    <tr><th>Agreed to terms</th><td>" . htmlspecialchars($agreeTerms) . "</td></tr>
  </table>

  <p style='margin-top:15px;font-size:12px;color:#777;'>
    Submitted at: " . date("Y-m-d H:i:s") . " (server time)
  </p>
</div>
</body>
</html>
";

$headersAdmin  = "MIME-Version: 1.0\r\n";
$headersAdmin .= "Content-Type: text/html; charset=UTF-8\r\n";
$headersAdmin .= "From: Apply ECS <no-reply@applyecscard.co.uk>\r\n";
$headersAdmin .= "Reply-To: " . $cleanEmail . "\r\n";

// ---------- EMAIL TO USER ----------
$userSubject = "Your CITB Test Booking Request - Apply ECS";

$userMessage = "
<html>
<head>
<meta charset='UTF-8'>
<style>
  body { font-family: Arial, sans-serif; font-size: 14px; color: #333; }
  .box { border:1px solid #eee; padding:15px; max-width:600px; }
  h2 { color:#005a9c; }
  table { width:100%; border-collapse: collapse; }
  th, td { text-align:left; padding:6px 4px; border-bottom:1px solid #f0f0f0; }
  th { width:40%; font-weight:600; }
</style>
</head>
<body>
<div class='box'>
  <h2>Thank you for your booking request</h2>
  <p>Dear " . htmlspecialchars($fullName) . ",</p>
  <p>
    Thank you for submitting your CITB Health, Safety &amp; Environment test
    booking request for an ECS card. Our team will review your details and
    contact you shortly to confirm your test slot and payment.
  </p>

  <h3>Summary of your request</h3>
  <table>
    <tr><th>ECS card route</th><td>" . htmlspecialchars($ecsCard) . "</td></tr>
    <tr><th>Application type</th><td>" . htmlspecialchars($ecsCardType) . "</td></tr>
    <tr><th>Test type</th><td>" . htmlspecialchars($testType) . "</td></tr>
    <tr><th>Language</th><td>" . htmlspecialchars($testLanguage) . "</td></tr>
    <tr><th>Preferred centre</th><td>" . htmlspecialchars($testCentre) . "</td></tr>
    <tr><th>Preferred date</th><td>" . htmlspecialchars($testDate) . "</td></tr>
    <tr><th>Preferred time</th><td>" . htmlspecialchars($testTime) . "</td></tr>
  </table>

  <p style='margin-top:15px;'>
    If any of the above details are incorrect, please reply to this email as soon as possible.
  </p>

  <p>Kind regards,<br>
  <strong>Apply ECS</strong><br>
  <a href='mailto:booking@applyecscard.co.uk'>booking@applyecscard.co.uk</a><br>
  <a href='https://applyecscard.co.uk'>https://applyecscard.co.uk</a></p>
</div>
</body>
</html>
";

$headersUser  = "MIME-Version: 1.0\r\n";
$headersUser .= "Content-Type: text/html; charset=UTF-8\r\n";
$headersUser .= "From: Apply ECS <no-reply@applyecscard.co.uk>\r\n";
$headersUser .= "Reply-To: booking@applyecscard.co.uk\r\n";

// ---------- SEND EMAILS ----------
$adminMailSent = mail($adminEmail, $adminSubject, $adminMessage, $headersAdmin);
$userMailSent  = mail($cleanEmail, $userSubject, $userMessage, $headersUser);

// If both emails sent successfully → redirect to payment
if ($adminMailSent && $userMailSent) {
    header("Location: " . $paymentUrl);
    exit;
} else {
    // fallback – if any email fails
    echo "<!DOCTYPE html><html><head><meta charset='UTF-8'><title>Booking Error</title></head><body>";
    echo "<h2>There was a problem submitting your booking.</h2>";
    echo "<p>We could not send confirmation emails at this time.</p>";
    echo "<p>Please try again later or contact us directly at ";
    echo "<a href='mailto:booking@applyecscard.co.uk'>booking@applyecscard.co.uk</a>.</p>";
    echo "<p><a href='javascript:history.back()'>Go back to the form</a></p>";
    echo "</body></html>";
    exit;
}
?>
