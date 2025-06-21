import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    // ← serverActions を有効にする場合は “オブジェクト” で渡す
    serverActions: {}
  }
}

export default nextConfig
