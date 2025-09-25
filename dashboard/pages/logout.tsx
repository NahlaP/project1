// pages/logout.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Logout() {
  const r = useRouter();
  useEffect(() => {
    (async () => {
      try { await fetch('/api/auth/logout', { method: 'POST' }); } catch {}
      r.replace('/login');
    })();
  }, [r]);
  return null;
}
