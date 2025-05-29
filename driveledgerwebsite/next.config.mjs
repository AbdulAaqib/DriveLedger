/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'opensea.io',
        port: '',
        pathname: '/item/matic/0xb6d0ceccb62541ffe71d5ca7776920d8abf2705d/**',
      },
      {
        protocol: 'https',
        hostname: 'gateway.pinata.cloud',
        port: '',
        pathname: '/ipfs/**',
      },
      {
        protocol: 'https',
        hostname: 'coffee-electoral-shrimp-180.mypinata.cloud',
        port: '',
        pathname: '/ipfs/**',
      },
      // Allow all subdomains of mypinata.cloud
      {
        protocol: 'https',
        hostname: '**.mypinata.cloud',
        port: '',
        pathname: '/ipfs/**',
      },
    ],
  },
}

export default nextConfig 