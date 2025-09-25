// pages/api/auth/logout.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import cookie from 'cookie';

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.setHeader(
    'Set-Cookie',
    cookie.serialize('token', '', {
      httpOnly: true,
      secure: false,           // set true on HTTPS
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    })
  );
  res.status(200).json({ success: true });
}
