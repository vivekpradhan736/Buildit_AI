export default function handler(req, res) {
    const authUrl = process.env.NEXT_PUBLIC_VERCEL_AUTH_URL;
    res.redirect(authUrl);
  }