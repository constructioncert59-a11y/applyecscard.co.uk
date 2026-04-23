<?php
// ---------------------------
// CONFIGURATION
// ---------------------------

// Admin email where you want to receive messages
$adminEmail = "booking@applyecscard.co.uk";

// Email subject for admin
$adminSubject = "New Contact Enquiry - Apply ECS";

// Confirmation message to user
$userSubject = "We Received Your Enquiry - Apply ECS";

// Contact page URL (popup ke baad yahin redirect hoga)
$redirectUrl = "contact.html"; // agar file naam kuch aur hai to yahan change kar dena

// ---------------------------
// ONLY PROCESS POST REQUEST
// ---------------------------
if ($_SERVER["REQUEST_METHOD"] === "POST") {

    // Clean input values
    function clean_input($field) {
        return isset($_POST[$field]) ? htmlspecialchars(trim($_POST[$field]), ENT_QUOTES, 'UTF-8') : "";
    }

    $name    = clean_input("name");
    $phone   = clean_input("phone");
    $email   = clean_input("email");
    $subject = clean_input("subject");
    $message = clean_input("message");

    // ---------------------------
    // Basic Required Validation
    // ---------------------------
    if ($name === "" || $email === "" || $subject === "" || $message === "") {
        $errorMsg = "Please fill in all required fields.";
        echo "<script>alert(" . json_encode($errorMsg) . "); window.location.href = " . json_encode($redirectUrl) . ";</script>";
        exit;
    }

    // ---------------------------
    // Map subject value to label
    // ---------------------------
    switch ($subject) {
        case "ecs-card":
            $subjectLabel = "Apply for ECS Card";
            break;
        case "ecs-test":
            $subjectLabel = "Book ECS Test";
            break;
        case "support":
            $subjectLabel = "General Support";
            break;
        default:
            $subjectLabel = $subject;
            break;
    }

    // ---------------------------
    // SEND EMAIL TO ADMIN
    // ---------------------------
    $adminBody = "
        <h2>New Contact Enquiry</h2>
        <p><strong>Name:</strong> {$name}</p>
        <p><strong>Email:</strong> {$email}</p>
        <p><strong>Phone:</strong> {$phone}</p>
        <p><strong>Enquiry Type:</strong> {$subjectLabel}</p>
        <p><strong>Message:</strong><br>" . nl2br($message) . "</p>
    ";

    $headers  = "MIME-Version: 1.0\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8\r\n";
    // From domain tumhari site ka rakha hai deliverability ke liye
    $headers .= "Reply-To: {$email}\r\n";

    @mail($adminEmail, $adminSubject, $adminBody, $headers);

    // ---------------------------
    // SEND CONFIRMATION TO USER
    // ---------------------------
    $userBody = "
        <p>Hello {$name},</p>
        <p>Thank you for contacting <strong>Apply ECS</strong>.</p>
        <p>We have received your enquiry and our team will get back to you shortly.</p>

        <p><strong>Your submitted details:</strong></p>
        <p><strong>Enquiry type:</strong> {$subjectLabel}</p>
        <p><strong>Phone:</strong> {$phone}</p>
        <p><strong>Message:</strong><br>" . nl2br($message) . "</p>

        <br>
        <p>Regards,<br>Apply ECS Support Team</p>
    ";

    $userHeaders  = "MIME-Version: 1.0\r\n";
    $userHeaders .= "Content-type:text/html;charset=UTF-8\r\n";
    
    @mail($email, $userSubject, $userBody, $userHeaders);

    // ---------------------------
    // POPUP CONFIRMATION + REDIRECT
    // ---------------------------
    $popupMsg = "Thank you, {$name}. Your enquiry has been sent. We will contact you soon.";
    echo "<script>
        alert(" . json_encode($popupMsg) . ");
        window.location.href = " . json_encode($redirectUrl) . ";
    </script>";
    exit;
}
?>
    