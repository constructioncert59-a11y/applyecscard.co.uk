// Vercel serverless function. Prices are taken from catalog.json on the SERVER (never trusted from the browser).
// Needs env var STRIPE_SECRET_KEY  (and optional SITE_URL, e.g. https://applyecscard.co.uk)
const Stripe = require('stripe');
const catalog = Object.fromEntries(require('./catalog.json').map(c => [c.id, c]));

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  try {
    const { customer = {}, items = [] } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (!process.env.STRIPE_SECRET_KEY) return res.status(500).json({ error: 'Payment is not configured yet.' });
    if (!customer.email || !/^\S+@\S+\.\S+$/.test(customer.email)) return res.status(400).json({ error: 'Valid email required.' });
    const valid = items.filter(i => catalog[i.id] && i.qty > 0 && i.qty <= 50);
    if (!valid.length) return res.status(400).json({ error: 'Cart is empty.' });

    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    const line_items = valid.map(i => ({
      quantity: Math.floor(i.qty),
      price_data: { currency: 'gbp', unit_amount: Math.round(catalog[i.id].price * 100 * 1.2), // price incl. 20% VAT
        product_data: { name: catalog[i.id].name, description: catalog[i.id].type + ' (incl. 20% VAT)' } }
    }));
    const origin = process.env.SITE_URL || `https://${req.headers.host}`;
    const session = await stripe.checkout.sessions.create({
      mode: 'payment', line_items, customer_email: customer.email,
      metadata: { name: `${customer.first_name || ''} ${customer.last_name || ''}`.trim(), phone: customer.phone || '',
                  courses: valid.map(i => `${catalog[i.id].name} x${i.qty}`).join(' | ').slice(0, 480) },
      success_url: `${origin}/cart.html?paid=1`, cancel_url: `${origin}/cart.html`
    });
    return res.status(200).json({ url: session.url });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Could not start payment. Please try again.' });
  }
};
