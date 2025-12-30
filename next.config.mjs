import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  outputFileTracingRoot: __dirname,
  webpack: (config) => {
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil'
    })
    // Ensure webpack can resolve hls.js (drei's VideoTexture imports it)
    try {
      config.resolve = config.resolve || {}
      config.resolve.alias = config.resolve.alias || {}
      // Prefer the ESM build when resolving hls.js
      config.resolve.alias['hls.js'] = require.resolve('hls.js/dist/hls.mjs')
    } catch (e) {
      // ignore if package not installed yet
    }
    return config
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
