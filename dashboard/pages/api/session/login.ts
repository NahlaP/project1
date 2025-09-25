// pages/api/auth/login.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import cookie from 'cookie';

const BACKEND = process.env.BACKEND_ORIGIN || 'http://3.109.207.179';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const r = await fetch(`${BACKEND}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    const data = await r.json().catch(() => ({}));

    if (!r.ok || !data?.token) {
      return res.status(r.status || 400).json({ success: false, message: data?.message || 'Login failed' });
    }

    // 7 days
    const maxAge = 7 * 24 * 60 * 60;
    res.setHeader(
      'Set-Cookie',
      cookie.serialize('token', data.token, {
        httpOnly: true,
        secure: false,            // set true when you serve over HTTPS
        sameSite: 'lax',
        path: '/',
        maxAge,
      })
    );

    return res.status(200).json({ success: true });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}
