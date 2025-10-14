


// // og for dev
// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,
//   images: {
//     remotePatterns: [
//       { protocol: 'https', hostname: 'project1-uploads-12345.s3.ap-south-1.amazonaws.com' },
//     ],
//   },
//   async rewrites() {
//     const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN || 'http://127.0.0.1:5000';
//     const S3_BUCKET = process.env.NEXT_PUBLIC_S3_BUCKET || 'project1-uploads-12345';
//     const S3_REGION = process.env.NEXT_PUBLIC_S3_REGION || 'ap-south-1';
//     const S3_ORIGIN = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com`;

//     return [
//       // keep your client code working
//       { source: '/next-api/:path*', destination: '/api/:path*' },

//       // --- BYPASS: keep these handled by Next API ---
//       { source: '/api/email/:path*', destination: '/api/email/:path*' },
//       { source: '/api/emails', destination: '/api/emails' },

//       // everything else under /api/* goes to Express
//       { source: '/api/:path*', destination: `${BACKEND_ORIGIN}/api/:path*` },

//       // static from S3
//       { source: '/sections/:path*', destination: `${S3_ORIGIN}/sections/:path*` },
//     ];
//   },
// };

// module.exports = nextConfig;





/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Images: allow your UAE S3 bucket
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: `${process.env.NEXT_PUBLIC_S3_BUCKET}.s3.${process.env.NEXT_PUBLIC_S3_REGION}.amazonaws.com`,
      },
    ],
  },

  async rewrites() {
    const BACKEND_ORIGIN =
      process.env.BACKEND_ORIGIN || 'http://127.0.0.1:5000';

    const S3_BUCKET =
      process.env.NEXT_PUBLIC_S3_BUCKET || 'project1-uploads-uae-12345';
    const S3_REGION =
      process.env.NEXT_PUBLIC_S3_REGION || 'me-central-1';
    const S3_ORIGIN = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com`;

    return [
      // Keep Next API routes local
      { source: '/next-api/:path*', destination: '/api/:path*' },

      // Bypass: these stay on Next
      { source: '/api/email/:path*', destination: '/api/email/:path*' },
      { source: '/api/emails', destination: '/api/emails' },

      // Everything else to Express on EC2
      { source: '/api/:path*', destination: `${BACKEND_ORIGIN}/api/:path*` },

      // Static from S3 (sections images, etc.)
      { source: '/sections/:path*', destination: `${S3_ORIGIN}/sections/:path*` },
    ];
  },
};

module.exports = nextConfig;
