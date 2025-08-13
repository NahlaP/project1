// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,
// };

// module.exports = nextConfig;


// C:\Users\97158\Desktop\project1\dashboard\next.config.js

/** @type {import('next').NextConfig} */
const BACKEND_ORIGIN =
  process.env.BACKEND_ORIGIN || 'http://3.109.207.179'; // use http://localhost:5000 for local dev if you want

const nextConfig = {
  reactStrictMode: true,

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${BACKEND_ORIGIN}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
