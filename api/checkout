const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
    // Only accept POST
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    try {
        const data = req.body;

        // Basic validation (optional, but good)
        const required = ['first_name', 'last_name', 'email', 'phone', 'address_line_1', 'city', 'postcode', 'terms_accepted'];
        for (let field of required) {
            if (!data[field] || data[field].trim() === '') {
                // If missing, still redirect to Stripe (or you can show error page)
                // For simplicity, we redirect to Stripe anyway (but you might want to handle errors)
                // You can also redirect back to form with error param
                return res.redirect(302, 'https://buy.stripe.com/dRm6oz0Sj1nffCP8IBeUU00');
            }
        }

        // Email confirmation check
        if (data.email !== data.confirm_email) {
            return res.redirect(302, 'https://buy.stripe.com/dRm6oz0Sj1nffCP8IBeUU00');
        }

        // --- Send email to booking@applyecscard.co.uk ---
        // If environment variables are not set, we skip sending and just redirect.
        // This prevents the whole process from failing.
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            try {
                const transporter = nodemailer.createTransport({
                    host: 'smtp.gmail.com',
                    port: 587,
                    secure: false,
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS,
                    },
                });

                const mailOptions = {
                    from: `"E-Learning Checkout" <${process.env.EMAIL_USER}>`,
                    to: 'booking@applyecscard.co.uk',
                    subject: 'New E-Learning Course Enquiry',
                    html: `
                        <h2>New Form Submission</h2>
                        <p><strong>First Name:</strong> ${data.first_name}</p>
                        <p><strong>Last Name:</strong> ${data.last_name}</p>
                        <p><strong>Email:</strong> ${data.email}</p>
                        <p><strong>Phone:</strong> ${data.phone}</p>
                        <p><strong>Date of Birth:</strong> ${data.dob_day} ${data.dob_month} ${data.dob_year}</p>
                        <p><strong>Company Name:</strong> ${data.company_name || 'N/A'}</p>
                        <p><strong>Limited Company:</strong> ${data.is_limited_company || 'N/A'}</p>
                        <p><strong>Address:</strong> ${data.address_line_1}, ${data.city}, ${data.postcode}</p>
                        <p><strong>Opt out of marketing:</strong> ${data.opt_out_email_marketing ? 'Yes' : 'No'}</p>
                        <p><strong>Terms accepted:</strong> ${data.terms_accepted ? 'Yes' : 'No'}</p>
                    `,
                };

                await transporter.sendMail(mailOptions);
            } catch (emailError) {
                console.error('Email sending failed:', emailError);
                // We still redirect to Stripe even if email fails.
            }
        } else {
            console.warn('EMAIL_USER or EMAIL_PASS not set. Skipping email.');
        }

        // --- Redirect to Stripe checkout ---
        return res.redirect(302, 'https://buy.stripe.com/dRm6oz0Sj1nffCP8IBeUU00');

    } catch (error) {
        console.error('Checkout API error:', error);
        // Even on error, redirect to Stripe (or a fallback)
        return res.redirect(302, 'https://buy.stripe.com/dRm6oz0Sj1nffCP8IBeUU00');
    }
};
