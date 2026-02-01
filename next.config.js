/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/gradient_descent_playground',
  assetPrefix: '/gradient_descent_playground',
  trailingSlash: true,
};

module.exports = nextConfig;
