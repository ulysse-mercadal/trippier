// **************************************************************************
//
//  Trippier Project - Web App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import type { NextConfig } from 'next';
import fs from 'fs';
import path from 'path';

// Manual env loading from root
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0 && !key.startsWith('#')) {
      const value = valueParts
        .join('=')
        .trim()
        .replace(/^["']|["']$/g, '');
      process.env[key.trim()] = value;
    }
  });
}

const nextConfig: NextConfig = {
  env: {
    API_URL: process.env.API_URL,
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
  },
};

export default nextConfig;
