import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
<<<<<<< HEAD
  output: 'export',
  trailingSlash: true,
=======
>>>>>>> 3696b98 (initial scaffold)
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
