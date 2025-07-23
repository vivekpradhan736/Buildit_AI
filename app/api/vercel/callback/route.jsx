import axios from 'axios';

export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'No code provided' });
  }

  try {
    const response = await axios.post('https://api.vercel.com/v2/oauth/access_token', {
      client_id: process.env.NEXT_PUBLIC_VERCEL_CLIENT_ID,
      client_secret: process.env.NEXT_PUBLIC_VERCEL_CLIENT_SECRET,
      code,
      redirect_uri: process.env.NEXT_PUBLIC_VERCEL_REDIRECT_URI,
    });

    const { access_token, user_id } = response.data;

    // Store access_token in your database (e.g., Convex DB) associated with the user
    // Example: await convex.mutation('storeVercelToken', { userId: req.user.id, accessToken: access_token });

    res.redirect('/dashboard?vercel=success');
  } catch (error) {
    console.error('Vercel OAuth error:', error);
    res.redirect('/dashboard?vercel=error');
  }
}