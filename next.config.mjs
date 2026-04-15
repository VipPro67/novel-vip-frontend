import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts")

/** @type {import('next').NextConfig} */
const nextConfig = {
	async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: 'http://YOUR_LIGHTSAIL_IP:8080/:path*', 
      },
    ]
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "novelvip.s3.ap-southeast-2.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "*.s3.*.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "s3.ap-southeast-2.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
      }
    ],
  },
  // Performance optimizations
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-icons",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-dialog",
      "@radix-ui/react-alert-dialog",
      "@radix-ui/react-tabs",
      "@radix-ui/react-select",
    ],
  },
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? {
      exclude: ["error", "warn"],
    } : false,
  },
  // Bundle analyzer (optional, uncomment when needed)
  // webpack: (config, { isServer }) => {
  //   if (!isServer && process.env.ANALYZE === 'true') {
  //     const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
  //     config.plugins.push(
  //       new BundleAnalyzerPlugin({
  //         analyzerMode: 'static',
  //         reportFilename: './analyze.html',
  //       })
  //     )
  //   }
  //   return config
  // },
	
}


export default withNextIntl(nextConfig)
