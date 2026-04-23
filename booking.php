<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {

    // ===== Your email address =====
    $adminEmail = "kdm88268@gmail.com"; // Change to your email

    // ===== Get form values =====
    $cscsCard = $_POST['cscsCard'] ?? '';
    $cscs_card_type = $_POST['cscs_card_type'] ?? '';
    $first_name = $_POST['first_name'] ?? '';
    $surname = $_POST['surname'] ?? '';
    $dob = $_POST['dob'] ?? '';
    $test_type = $_POST['test_type'] ?? '';
    $test_language = $_POST['test_language'] ?? '';
    $test_category = $_POST['test_category'] ?? '';
    $test_centre = $_POST['test_centre'] ?? '';
    $test_date = $_POST['test_date'] ?? '';
    $test_time = $_POST['test_time'] ?? '';
    $street_address = $_POST['street_address'] ?? '';
    $city = $_POST['city'] ?? '';
    $county = $_POST['county'] ?? '';
    $country = $_POST['country'] ?? '';
    $address_postcode = $_POST['address_postcode'] ?? '';
    $mobile = $_POST['mobile'] ?? '';
    $email = $_POST['email'] ?? '';

    // ===== Email to Admin =====
    $subject_admin = "New CSCS Test Booking from $first_name $surname";
    $message_admin = "
    New booking received:

    Name: $first_name $surname
    CSCS Card: $cscsCard
    Card Type: $cscs_card_type
    DOB: $dob
    Test Type: $test_type
    Language: $test_language
    Category: $test_category
    Test Centre: $test_centre
    Date: $test_date
    Time: $test_time
    Address: $street_address, $city, $county, $country, $address_postcode
    Mobile: $mobile
    Email: $email
    ";

    $headers_admin = "From: noreply@yourdomain.com\r\n";

    // ===== Email to User =====
    $subject_user = "Booking Confirmation - CSCS Test";
    $message_user = "
    Dear $first_name,

    Thank you for booking your CSCS Test with us.  
    Here are your booking details:

    CSCS Card: $cscsCard
    Card Type: $cscs_card_type
    Test Type: $test_type
    Test Centre: $test_centre
    Date: $test_date
    Time: $test_time

    We will contact you soon with confirmation.  
    - CSCS Booking Team
    ";

    $headers_user = "From: noreply@yourdomain.com\r\n";

    // ===== Send emails =====
    $mail_admin = mail($adminEmail, $subject_admin, $message_admin, $headers_admin);
    $mail_user = mail($email, $subject_user, $message_user, $headers_user);

    if ($mail_admin && $mail_user) {
        echo "<h2>Booking submitted successfully! Please check your email.</h2>";
    } else {
        echo "<h2>Sorry, there was an error. Please try again.</h2>";
    }
} else {
    echo "Invalid request.";
}
?>
