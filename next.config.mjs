/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        // Opcional, pero recomendado: limitar el puerto si es necesario.
        // port: '',
        // Opcional, pero recomendado: limitar el path si es necesario.
        // pathname: '/wikipedia/commons/thumb/**',
      },
    ],
  },
};

export default nextConfig;