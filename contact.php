<?php
// ---------------------------
// CONFIGURATION
// ---------------------------

// Admin email where you want to receive messages
$adminEmail = "booking@applyecscard.co.uk";

// Email subject for admin
$adminSubject = "New Contact Form Submission - Apply ECS";

// Confirmation message to user
$userSubject = "We Received Your Message - Apply ECS";

// ---------------------------
// ONLY PROCESS POST REQUEST
// ---------------------------
if ($_SERVER["REQUEST_METHOD"] === "POST") {

    // Clean input values
    function clean_input($field) {
        return isset($_POST[$field]) ? htmlspecialchars(trim($_POST[$field])) : "";
    }

    $name = clean_input("name");
    $email = clean_input("email");
    $phone = clean_input("phone");   // <-- Added phone number
    $subject = clean_input("subject");
    $message = clean_input("message");

    // ---------------------------
    // SEND EMAIL TO ADMIN
    // ---------------------------
    $adminBody = "
        <h2>New Contact Message Received</h2>
        <p><strong>Name:</strong> {$name}</p>
        <p><strong>Email:</strong> {$email}</p>
        <p><strong>Phone:</strong> {$phone}</p>
        <p><strong>Subject:</strong> {$subject}</p>
        <p><strong>Message:</strong><br>{$message}</p>
    ";

    $headers  = "MIME-Version: 1.0\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8\r\n";
    $headers .= "From: {$name} <{$email}>\r\n";

    mail($adminEmail, $adminSubject, $adminBody, $headers);

    // ---------------------------
    // SEND CONFIRMATION TO USER
    // ---------------------------
    $userBody = "
        <p>Hello {$name},</p>
        <p>Thank you for contacting <strong>Apply ECS</strong>.  
        We have received your message and our team will reply shortly.</p>

        <p><strong>Your submitted details:</strong></p>
        <p>Email: {$email}</p>
        <p>Phone: {$phone}</p>
        <p>Subject: {$subject}</p>
        <p>Message: {$message}</p>

        <br>
        <p>Regards,<br>Apply ECS Support Team</p>
    ";

    $userHeaders  = "MIME-Version: 1.0\r\n";
    $userHeaders .= "Content-type:text/html;charset=UTF-8\r\n";

    mail($email, $userSubject, $userBody, $userHeaders);

    // ---------------------------
    // SHOW CONFIRMATION ON SAME PAGE
    // ---------------------------
    echo "
    <div style='
        width:100%;
        max-width:600px;
        margin:40px auto;
        padding:20px;
        border-radius:10px;
        background:#e8f8e8;
        color:#065f08;
        font-family:Arial,sans-serif;
        text-align:center;
        border:1px solid #b6e7b6;
    '>
        <h2>Message Sent Successfully ✔</h2>
        <p>Thank you, <strong>{$name}</strong>.</p>
        <p>Your message has been sent. Our team will contact you soon.</p>
    </div>
    ";

    exit;
}
?>
    