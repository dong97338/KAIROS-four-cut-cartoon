/** @type {import('next').NextConfig} */
const {API_HOST, API_PORT} = process.env
module.exports = {
  rewrites: async () => [
    {
      source: '/api/:path*',
      destination: `http://${API_HOST}:${API_PORT}/api/:path*`
    }
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '**'
      }
    ]
  },
  reactStrictMode: true
}
