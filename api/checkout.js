module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }
    // डेटा को लॉग कर सकते हैं (optional)
    console.log(req.body);
    // Stripe पर रीडायरेक्ट
    return res.redirect(302, 'https://buy.stripe.com/dRm6oz0Sj1nffCP8IBeUU00');
};
