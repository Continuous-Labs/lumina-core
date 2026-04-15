import type { NextConfig } from "next";
import { withLumina } from '@continuouslabs/lumina-next';

const nextConfig: NextConfig = {
  /* config options here */
};

export default withLumina(nextConfig, { locales: ['en', 'es'] });
