<?php
// cardbooking.php – ECS Card Application Handler

// --- CONFIG ---
// Where you want to receive application details:
$adminEmail = "booking@applyecscard.co.uk";

// Payment page (user will be redirected here after emails are sent)
$paymentUrl = "cardpayment.php"; // Same folder

// Website base URL (for image/file links in emails)
$siteBaseUrl = "https://applyecscard.co.uk/"; // Change if your install path is different

// Upload folder (must be writable, e.g. /uploads)
$uploadDir = __DIR__ . "/uploads/";

// --- MAIN ---
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    // Block direct access without form submission
    header("Location: /");
    exit;
}

// Helper: safely fetch POST values
function post_value($key) {
    return isset($_POST[$key]) ? trim($_POST[$key]) : "";
}

// --------- FORM VALUES (matching HTML form field names) ---------
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

$ecsCardType    = post_value("ecs_card_type");      // new / renewal / replacement
$ecsCardNumber  = post_value("ecs_card_number");
$expiryDate     = post_value("expiry_date");
$occupation     = post_value("occupation");
$employer       = post_value("employer");
$qualification  = post_value("qualification");
$hsTest         = post_value("hs_test");            // yes / no

$agreeTerms     = isset($_POST["agree_terms"]) ? "Yes" : "No";

// Approximate fee map (must match your front-end JS and website pricing)
// Here everything is a flat £79.00
$priceMap = [
    "new"         => "£79.00",
    "renewal"     => "£79.00",
    "replacement" => "£79.00"
];
$estimatedFee = isset($priceMap[$ecsCardType]) ? $priceMap[$ecsCardType] : "£0.00";

// --------- VALIDATION ---------
$errors = [];

// Required fields basic check
$requiredFields = [
    "Full name"              => $fullName,
    "Date of birth"          => $dob,
    "National Insurance number" => $niNumber,
    "Gender"                 => $gender,
    "Street address"         => $streetAddress,
    "Town / city"            => $city,
    "Postcode"               => $postcode,
    "Mobile number"          => $mobile,
    "Email"                  => $email,
    "Confirm email"          => $confirmEmail,
    "Application type"       => $ecsCardType,
    "Occupation / job title" => $occupation,
    "Health & Safety / HS&E test status" => $hsTest
];

foreach ($requiredFields as $label => $value) {
    if ($value === "") {
        $errors[] = $label . " is required.";
    }
}

// Email format check
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = "Please enter a valid email address.";
}

if ($email !== $confirmEmail) {
    $errors[] = "Email and Confirm Email do not match.";
}

// Terms check
if ($agreeTerms !== "Yes") {
    $errors[] = "You must confirm that your information is accurate and agree to the application terms.";
}

// File upload validation (photo + ID proof required)
if (!isset($_FILES["photo"]) || $_FILES["photo"]["error"] !== UPLOAD_ERR_OK) {
    $errors[] = "A passport-sized photo is required.";
}
if (!isset($_FILES["id_proof"]) || $_FILES["id_proof"]["error"] !== UPLOAD_ERR_OK) {
    $errors[] = "Identity proof (passport or driving licence) is required.";
}

// If the user has selected "yes" for H&S test, proof is required
if ($hsTest === "yes") {
    if (!isset($_FILES["hs_test_proof"]) || $_FILES["hs_test_proof"]["error"] !== UPLOAD_ERR_OK) {
        $errors[] = "Please upload proof of your Health & Safety / HS&E test (as you selected Yes).";
    }
}

// If there are errors, show a simple error page
if (!empty($errors)) {
    echo "<!DOCTYPE html><html><head><meta charset='UTF-8'><title>Application Error</title></head><body>";
    echo "<h2>There was a problem with your ECS card application.</h2>";
    echo "<ul>";
    foreach ($errors as $err) {
        echo "<li>" . htmlspecialchars($err) . "</li>";
    }
    echo "</ul>";
    echo "<p><a href='javascript:history.back()'>Go back and correct the form.</a></p>";
    echo "</body></html>";
    exit;
}

// --------- HANDLE FILE UPLOADS ---------
if (!is_dir($uploadDir)) {
    @mkdir($uploadDir, 0775, true);
}

// Helper for uploads
function handle_upload($fieldName, $uploadDir) {
    if (!isset($_FILES[$fieldName]) || $_FILES[$fieldName]['error'] !== UPLOAD_ERR_OK) {
        return ""; // optional / failed
    }

    $fileTmp  = $_FILES[$fieldName]['tmp_name'];
    $fileName = basename($_FILES[$fieldName]['name']);

    // Remove risky characters
    $fileName = preg_replace("/[^a-zA-Z0-9_\.\-]/", "_", $fileName);

    // Add timestamp to make unique
    $targetPath = $uploadDir . date("Ymd_His") . "_" . $fileName;

    if (move_uploaded_file($fileTmp, $targetPath)) {
        // Return a relative path suitable for building a public URL
        return "uploads/" . basename($targetPath);
    }

    return "";
}

$hsProofPath = handle_upload("hs_test_proof", $uploadDir); // optional (except when yes)
$photoPath   = handle_upload("photo", $uploadDir);
$idPath      = handle_upload("id_proof", $uploadDir);

// Simple security: prevent header injection
$cleanEmail = str_replace(["\r", "\n"], "", $email);
$cleanName  = str_replace(["\r", "\n"], "", $fullName);

// Human-readable card type
$cardTypeLabel = $ecsCardType;
if ($ecsCardType === "new")         $cardTypeLabel = "New ECS Card";
if ($ecsCardType === "renewal")     $cardTypeLabel = "Renewal";
if ($ecsCardType === "replacement") $cardTypeLabel = "Replacement / Upgrade";

// ---------- FILE CELLS FOR EMAIL (LINK + PREVIEW) ----------

// Admin email – photo preview + link
if ($photoPath) {
    $photoUrl = htmlspecialchars($siteBaseUrl . $photoPath, ENT_QUOTES);
    $photoCellAdmin = "<a href='{$photoUrl}' target='_blank'>View photo</a><br>"
        . "<img src='{$photoUrl}' alt='Photo' style='max-width:150px;border:1px solid #ddd;margin-top:5px;'>";
} else {
    $photoCellAdmin = "Upload failed";
}

// Admin email – H&S proof link
if ($hsProofPath) {
    $hsUrl = htmlspecialchars($siteBaseUrl . $hsProofPath, ENT_QUOTES);
    $hsProofCellAdmin = "<a href='{$hsUrl}' target='_blank'>View H&amp;S proof</a>";
} else {
    $hsProofCellAdmin = "Not provided / upload failed";
}

// Admin email – ID proof link
if ($idPath) {
    $idUrl = htmlspecialchars($siteBaseUrl . $idPath, ENT_QUOTES);
    $idCellAdmin = "<a href='{$idUrl}' target='_blank'>View ID proof</a>";
} else {
    $idCellAdmin = "Upload failed";
}

// User email – links only (photo + ID + H&S if available)
$photoCellUser = $photoPath
    ? "<a href='" . htmlspecialchars($siteBaseUrl . $photoPath, ENT_QUOTES) . "' target='_blank'>View your photo</a>"
    : "Not available";

$hsProofCellUser = $hsProofPath
    ? "<a href='" . htmlspecialchars($siteBaseUrl . $hsProofPath, ENT_QUOTES) . "' target='_blank'>View your Health &amp; Safety proof</a>"
    : "Not available";

$idCellUser = $idPath
    ? "<a href='" . htmlspecialchars($siteBaseUrl . $idPath, ENT_QUOTES) . "' target='_blank'>View your ID proof</a>"
    : "Not available";

// ---------- EMAIL TO ADMIN (HTML, PRO FORMAT) ----------
$adminSubject = "New ECS Card Application - " . $cleanName;

$adminMessage = "
<html>
<head>
<meta charset='UTF-8'>
<style>
  body { font-family: Arial, sans-serif; font-size: 14px; color: #333; }
  .box { border:1px solid #eee; padding:15px; max-width:700px; }
  h2 { color:#005a9c; }
  table { width:100%; border-collapse: collapse; }
  th, td { text-align:left; padding:6px 4px; border-bottom:1px solid #f0f0f0; vertical-align:top; }
  th { width:40%; font-weight:600; }
</style>
</head>
<body>
<div class='box'>
  <h2>New ECS Card Application</h2>
  <p>An ECS card application has been submitted via the Apply ECS website.</p>

  <h3>Applicant Details</h3>
  <table>
    <tr><th>Full name</th><td>" . htmlspecialchars($fullName) . "</td></tr>
    <tr><th>Date of birth</th><td>" . htmlspecialchars($dob) . "</td></tr>
    <tr><th>National Insurance number</th><td>" . htmlspecialchars($niNumber) . "</td></tr>
    <tr><th>Gender</th><td>" . htmlspecialchars($gender) . "</td></tr>
  </table>

  <h3>Contact Details</h3>
  <table>
    <tr><th>Street address</th><td>" . htmlspecialchars($streetAddress) . "</td></tr>
    <tr><th>Town / city</th><td>" . htmlspecialchars($city) . "</td></tr>
    <tr><th>Postcode</th><td>" . htmlspecialchars($postcode) . "</td></tr>
    <tr><th>Mobile</th><td>" . htmlspecialchars($mobile) . "</td></tr>
    <tr><th>Email</th><td>" . htmlspecialchars($email) . "</td></tr>
  </table>

  <h3>Card & Employment</h3>
  <table>
    <tr><th>Application type</th><td>" . htmlspecialchars($cardTypeLabel) . "</td></tr>
    <tr><th>Current / previous ECS card number</th><td>" . htmlspecialchars($ecsCardNumber) . "</td></tr>
    <tr><th>Expiry date (if renewal)</th><td>" . htmlspecialchars($expiryDate) . "</td></tr>
    <tr><th>Occupation / job title</th><td>" . htmlspecialchars($occupation) . "</td></tr>
    <tr><th>Employer</th><td>" . htmlspecialchars($employer) . "</td></tr>
    <tr><th>Main qualification / NVQ</th><td>" . htmlspecialchars($qualification) . "</td></tr>
    <tr><th>Health &amp; Safety / HS&E test in the last 2 years</th><td>" . htmlspecialchars($hsTest) . "</td></tr>
  </table>

  <h3>Uploads (stored on server)</h3>
  <table>
    <tr><th>H&amp;S test proof</th><td>" . $hsProofCellAdmin . "</td></tr>
    <tr><th>Photo</th><td>" . $photoCellAdmin . "</td></tr>
    <tr><th>ID proof</th><td>" . $idCellAdmin . "</td></tr>
  </table>

  <h3>Fee & Consent</h3>
  <table>
    <tr><th>Estimated fee</th><td>" . htmlspecialchars($estimatedFee) . "</td></tr>
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

// ---------- EMAIL TO USER (CONFIRMATION - HTML) ----------
$userSubject = "Your ECS Card Application - Apply ECS";

$userMessage = "
<html>
<head>
<meta charset='UTF-8'>
<style>
  body { font-family: Arial, sans-serif; font-size: 14px; color: #333; }
  .box { border:1px solid #eee; padding:15px; max-width:700px; }
  h2 { color:#005a9c; }
  table { width:100%; border-collapse: collapse; }
  th, td { text-align:left; padding:6px 4px; border-bottom:1px solid #f0f0f0; vertical-align:top; }
  th { width:40%; font-weight:600; }
</style>
</head>
<body>
<div class='box'>
  <h2>Thank you for your ECS card application</h2>
  <p>Dear " . htmlspecialchars($fullName) . ",</p>
  <p>
    Thank you for submitting your ECS card application online. Our team will review your details
    and contact you shortly to confirm your route, fee and next steps.
  </p>

  <h3>Summary of your application</h3>
  <table>
    <tr><th>Application type</th><td>" . htmlspecialchars($cardTypeLabel) . "</td></tr>
    <tr><th>Occupation / job title</th><td>" . htmlspecialchars($occupation) . "</td></tr>
    <tr><th>Employer</th><td>" . htmlspecialchars($employer) . "</td></tr>
    <tr><th>Main qualification</th><td>" . htmlspecialchars($qualification) . "</td></tr>
    <tr><th>Health &amp; Safety / HS&E test status</th><td>" . htmlspecialchars($hsTest) . "</td></tr>
    <tr><th>Estimated fee</th><td>" . htmlspecialchars($estimatedFee) . "</td></tr>
  </table>

  <h3>Your uploaded files</h3>
  <table>
    <tr><th>Photo</th><td>" . $photoCellUser . "</td></tr>
    <tr><th>H&amp;S proof</th><td>" . $hsProofCellUser . "</td></tr>
    <tr><th>ID proof</th><td>" . $idCellUser . "</td></tr>
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
// Try to send both emails
$adminMailSent = mail($adminEmail, $adminSubject, $adminMessage, $headersAdmin);
$userMailSent  = mail($cleanEmail, $userSubject, $userMessage, $headersUser);

// If both emails were sent successfully, redirect to cardpayment.php
if ($adminMailSent && $userMailSent) {
    header("Location: " . $paymentUrl);
    exit;
} else {
    // Fallback – if any email fails
    echo "<!DOCTYPE html><html><head><meta charset='UTF-8'><title>Application Error</title></head><body>";
    echo "<h2>There was a problem submitting your application.</h2>";
    echo "<p>We could not send confirmation emails at this time.</p>";
    echo "<p>Please try again later or contact us directly at ";
    echo "<a href='mailto:booking@applyecscard.co.uk'>booking@applyecscard.co.uk</a>.</p>";
    echo "<p><a href='javascript:history.back()'>Go back to the form</a></p>";
    echo "</body></html>";
    exit;
}
?>
