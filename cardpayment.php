<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Unique order reference (e.g., ECS-483920)
$reference = 'ECS-' . mt_rand(100000, 999999);
?>
<!DOCTYPE html>
<html lang="en-GB">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>ECS Card Application · Secure UK Payment</title>

    <!-- Google Font & Font Awesome -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <!-- PayPal SDK -->
<script src="https://www.paypal.com/sdk/js?client-id=AWSmpBm8ZuJoH3CrmaXUQxIBv5UlW3iYPRbBf80GJl9G1YqG8JFt7XgWkizD3u9VpogUmIQ8j7Xg8u_J&currency=GBP"></script>

    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        :root {
            --bg: #f8fafc;
            --card: #ffffff;
            --primary: #1e3a8a;    /* UK blue */
            --primary-dark: #0f2b6d;
            --accent: #2c7a4d;     /* British racing green */
            --accent-soft: #e6f3ec;
            --muted: #475569;
            --border: #e2e8f0;
            --text: #0f172a;
            --shadow: 0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.02);
        }

        body {
            font-family: 'Inter', sans-serif;
            background: var(--bg);
            color: var(--text);
            line-height: 1.5;
        }

        /* Top bar */
        .topbar {
            background: var(--primary-dark);
            color: #f1f5f9;
            font-size: 0.75rem;
            padding: 0.6rem 1rem;
            display: flex;
            justify-content: center;
            gap: 2rem;
            flex-wrap: wrap;
        }

        .topbar span {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
        }

        /* Header */
        .header {
            background: white;
            padding: 0.8rem 2rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            border-bottom: 1px solid var(--border);
        }

        .header-left {
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .header-logo {
            width: 2.6rem;
            height: 2.6rem;
            background: linear-gradient(145deg, var(--primary), var(--accent));
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            font-size: 1.3rem;
            color: white;
        }

        .header-title {
            font-size: 1.3rem;
            font-weight: 700;
            color: var(--primary);
        }

        .header-sub {
            font-size: 0.7rem;
            color: var(--muted);
        }

        .header-right {
            display: flex;
            gap: 1.5rem;
            align-items: center;
            font-size: 0.85rem;
        }

        .header-right a {
            color: var(--primary);
            text-decoration: none;
            font-weight: 500;
            display: inline-flex;
            align-items: center;
            gap: 0.3rem;
        }

        /* Main container */
        .page {
            max-width: 1200px;
            margin: 2rem auto 3rem;
            padding: 0 1.5rem;
        }

        .breadcrumb {
            font-size: 0.75rem;
            color: var(--muted);
            margin-bottom: 1rem;
        }

        .page-head {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            flex-wrap: wrap;
            margin-bottom: 2rem;
            border-bottom: 2px solid var(--border);
            padding-bottom: 1rem;
        }

        .page-head h1 {
            font-size: 2rem;
            font-weight: 700;
            color: var(--primary);
            letter-spacing: -0.01em;
        }

        .badge-ref {
            background: var(--accent-soft);
            border-radius: 40px;
            padding: 0.5rem 1.2rem;
            font-size: 0.85rem;
            font-weight: 500;
            color: var(--accent);
        }

        /* Two column layout */
        .layout {
            display: grid;
            grid-template-columns: 1fr 0.9fr;
            gap: 2rem;
        }

        @media (max-width: 800px) {
            .layout {
                grid-template-columns: 1fr;
            }
        }

        /* Cards */
        .card {
            background: var(--card);
            border-radius: 28px;
            padding: 2rem;
            box-shadow: var(--shadow);
            border: 1px solid var(--border);
        }

        .card-title {
            font-size: 0.7rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--accent);
            margin-bottom: 0.5rem;
        }

        .card h2 {
            font-size: 1.6rem;
            font-weight: 700;
            margin-bottom: 0.75rem;
            color: var(--primary);
        }

        .card p {
            color: var(--muted);
            margin-bottom: 1.2rem;
        }

        .summary-list {
            list-style: none;
            margin: 1.2rem 0;
        }

        .summary-list li {
            display: flex;
            gap: 0.75rem;
            margin-bottom: 0.8rem;
            font-size: 0.9rem;
        }

        .summary-list i {
            color: var(--accent);
            margin-top: 0.1rem;
        }

        .order-meta {
            background: #f8fafc;
            border-radius: 20px;
            padding: 1rem 1.2rem;
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            font-size: 0.85rem;
            margin: 1.5rem 0;
        }

        .price-box {
            background: var(--accent-soft);
            border-radius: 24px;
            padding: 1.2rem 1.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            margin-bottom: 2rem;
        }

        .price-main {
            font-size: 2.2rem;
            font-weight: 800;
            color: var(--primary);
        }

        /* Payment buttons: side by side on desktop, stack on mobile */
        .payment-buttons {
            display: flex;
            gap: 1rem;
            margin: 1.5rem 0;
            flex-wrap: wrap;
        }

        .payment-buttons > * {
            flex: 1;
            min-width: 180px;
        }

        .btn-wise {
            background: var(--primary);
            color: white;
            border: none;
            padding: 0.9rem 1rem;
            border-radius: 48px;
            font-weight: 700;
            font-size: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.6rem;
            transition: all 0.2s;
            text-decoration: none;
            box-shadow: 0 4px 10px rgba(0,0,0,0.05);
            cursor: pointer;
        }

        .btn-wise:hover {
            background: var(--primary-dark);
            transform: translateY(-2px);
        }

        .btn-wise small {
            font-size: 0.7rem;
            font-weight: normal;
            opacity: 0.9;
        }

        #paypal-button-container {
            width: 100%;
        }

        .trust-badges {
            display: flex;
            flex-wrap: wrap;
            gap: 1.2rem;
            margin: 1.5rem 0;
            font-size: 0.85rem;
        }

        .trust-badges span {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .methods {
            display: flex;
            gap: 1rem;
            align-items: center;
            margin: 1rem 0;
            flex-wrap: wrap;
        }

        .methods img {
            height: 28px;
            opacity: 0.7;
            transition: opacity 0.2s;
        }

        .methods img:hover {
            opacity: 1;
        }

        .guarantee {
            background: #fef9e3;
            border-left: 4px solid #e6b422;
            padding: 1rem;
            border-radius: 16px;
            font-size: 0.85rem;
            margin: 1.2rem 0;
        }

        .help-text {
            margin-top: 1.5rem;
            font-size: 0.8rem;
            color: var(--muted);
            border-top: 1px dashed var(--border);
            padding-top: 1rem;
        }

        .help-text a {
            color: var(--primary);
            text-decoration: none;
        }

        .flag-uk {
            display: inline-block;
            width: 1.2rem;
            height: 0.9rem;
            background: linear-gradient(180deg, #012169 0%, #012169 33%, #fff 33%, #fff 66%, #c8102e 66%, #c8102e 100%);
            border-radius: 2px;
            margin-right: 0.3rem;
        }

        .footer-trust {
            max-width: 900px;
            margin: 2.5rem auto 0;
            text-align: center;
            font-size: 0.8rem;
            background: #eef3fa;
            padding: 1rem 1.5rem;
            border-radius: 50px;
            color: var(--primary);
        }

        hr {
            margin: 1.2rem 0;
            border: 0;
            border-top: 1px solid var(--border);
        }
    </style>
</head>
<body>

<!-- UK centric top bar -->
<div class="topbar">
    <span><i class="fas fa-flag-checkered"></i>ECS Card Partner</span>
    <span><i class="fas fa-lock"></i> FCA Regulated Payments</span>
    <span><i class="fas fa-envelope"></i> UK Support 7 days</span>
</div>

<!-- Header -->
<header class="header">
    <div class="header-left">
        <div class="header-logo">ECS</div>
        <div>
            <div class="header-title">ECS CARD</div>
            <div class="header-sub">UK Construction Skills Certification</div>
        </div>
    </div>
    <div class="header-right">
        <a href="mailto:booking@applyecscard.co.uk"><i class="fas fa-envelope"></i>booking@applyecscard.co.uk</a>
    </div>
</header>

<main class="page">

    <div class="page-head">
        <h1>ECS Card Application<br><span style="font-size:1rem; font-weight:normal;">Fast‑track UK service</span></h1>
        <div class="badge-ref">
            <i class="far fa-file-alt"></i> Order Ref: <strong><?php echo htmlspecialchars($reference); ?></strong>
        </div>
    </div>

    <div class="layout">
        <!-- LEFT COLUMN: Order summary & payment -->
        <div class="card">
            <div class="card-title">Secure checkout</div>
            <h2>ECS Card – £79</h2>
            <p>All‑inclusive application support + digital card in 24h.</p>
            <ul class="summary-list">
                <li><i class="fas fa-check-circle"></i> Official ECS card for construction & electrical</li>
                <li><i class="fas fa-check-circle"></i> Photo upload & eligibility verification</li>
                <li><i class="fas fa-check-circle"></i> Free replacement if lost or stolen</li>
            </ul>
            <div class="order-meta">
                <span><i class="fas fa-hashtag"></i> Reference: <?php echo htmlspecialchars($reference); ?></span>
                <span><i class="fas fa-bolt"></i> Fast‑track processing</span>
            </div>

                <div id="paypal-button-container"></div>
            <!-- Payment buttons: two links side by side -->
            <div class="price-box">
                <div class="price-main">£79.00 GBP</div>
                <div style="font-size:0.8rem;">No hidden fees • VAT included</div>
            </div>

            <div class="methods">
                <img src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Mastercard_2019_logo.svg" alt="Mastercard">
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal">
                <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" alt="Apple Pay">
                <img src="https://cdn.worldvectorlogo.com/logos/wise-2.svg" alt="Wise" style="height:28px;">
            </div>

            <div class="help-text">
                <i class="fas fa-shield-alt"></i> Your payment is processed by Wise or PayPal – we never see your card details. After payment you’ll receive a confirmation email with next steps.
            </div>
        </div>

        <!-- RIGHT COLUMN: Trust & UK relevance -->
        <div class="card">
            <div class="card-title">Why UK applicants choose us</div>
            <h2 style="font-size:1.4rem;">Trusted by 1500+ UK tradespeople</h2>
            <p>Fast, compliant, and fully UK‑based support.</p>
            <div class="trust-badges">
                <span><i class="fab fa-trustpilot" style="color:#00b67a;"></i> 4.9/5 Trustpilot</span>
                <span><i class="fas fa-pound-sign"></i> Best price guarantee</span>
                <span><i class="fas fa-headset"></i> UK support team</span>
            </div>
            <div class="guarantee">
                <i class="fas fa-hand-holding-heart"></i> <strong>30‑Day Money‑Back Guarantee</strong> – If you’re not satisfied, we’ll refund you in full, no questions asked.
            </div>
            <hr>
            <div class="payment-buttons">
                <!-- Wise external link -->
                <a href="https://www.paypal.com/ncp/payment/JT3UAL5V9U2WL" 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   class="btn-wise"
                   onclick="trackWiseClick()">
                    <i class="fas fa-globe"></i> Pay with PayPal
                    <small>PayPal
Cards, Apple Pay</small>
                </a>

                <!-- PayPal button container (SDK renders here) -->
            </div>
            <div class="payment-buttons">
                <!-- Wise external link -->
                <a href="https://wise.com/pay/r/eL6vPN0-2Exbxgo" 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   class="btn-wise"
                   onclick="trackWiseClick()">
                    <i class="fas fa-globe"></i> Pay with Wise
                    <small>Visa / Mastercard / Bank transfer</small>
                </a>

                <!-- PayPal button container (SDK renders here) -->
            </div>
            <div>
                <p style="font-weight:600; margin-bottom:0.5rem;"><i class="fas fa-check-circle" style="color:var(--accent);"></i> Approved payment partners</p>
                <ul style="font-size:0.85rem; list-style:none; padding-left:0;">
                    <li><i class="fas fa-check"></i> PayPal – Buyer Protection & all major cards</li>
                    <li><i class="fas fa-check"></i> Wise – FCA regulated, low fees for UK customers</li>
                    <li><i class="fas fa-check"></i> Instant confirmation & secure gateway</li>
                </ul>
            </div>
            <div class="help-text" style="border-top:none; margin-top:0;">
                <i class="fas fa-comments"></i> Need help? <a href="#">Live chat</a> • <a href="mailto:apply@ecscard.uk">Email</a> • <a href="#">FAQ</a>
                <br><span class="flag-uk"></span> <strong>UK office hours:</strong> Mon–Fri 9am–6pm, Sat 10am–2pm
            </div>
        </div>
    </div>

    <div class="footer-trust">
        <i class="fas fa-lock"></i> 256‑bit SSL encryption • FCA regulated payment partners • Your data is protected under UK GDPR
    </div>
</main>

<script>
    // Render PayPal button
    paypal.Buttons({
        style: {
            layout: 'vertical',
            color: 'gold',
            shape: 'pill',
            label: 'pay'
        },
        createOrder: function(data, actions) {
            return actions.order.create({
                purchase_units: [{
                    amount: {
                        value: '79.00',
                        currency_code: 'GBP'
                    },
                    description: 'ECS Card Application – Order <?php echo $reference; ?>'
                }],
                application_context: {
                    shipping_preference: 'NO_SHIPPING'
                }
            });
        },
        onApprove: function(data, actions) {
            return actions.order.capture().then(function(details) {
                alert('✅ Payment successful! Thank you, ' + details.payer.name.given_name + '. You will receive a confirmation email shortly.');
                // Optionally redirect to a thank you page
                // window.location.href = 'confirmation.php?ref=<?php echo $reference; ?>';
            });
        },
        onError: function(err) {
            console.error('PayPal error:', err);
            alert('Sorry, something went wrong. Please try again or choose Wise.');
        }
    }).render('#paypal-button-container');

    function trackWiseClick() {
        console.log('Wise payment selected for order <?php echo $reference; ?>');
        // Optional: send event to analytics
    }
</script>
</body>
</html>            