module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  const API_KEY = process.env.MAILCHIMP_API_KEY;
  const AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID;
  const DC = API_KEY.split('-')[1];

  try {
    const response = await fetch(`https://${DC}.api.mailchimp.com/3.0/lists/${AUDIENCE_ID}/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        email_address: email,
        status: 'subscribed',
        tags: ['colorfix']
      })
    });

    const data = await response.json();

    if (response.ok || data.title === 'Member Exists') {
      return res.status(200).json({ success: true });
    } else {
      return res.status(400).json({ error: data.detail || 'Signup failed' });
    }
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
