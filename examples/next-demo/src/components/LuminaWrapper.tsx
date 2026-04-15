'use client';

import { LuminaProvider } from '@continuouslabs/lumina-react';
import React from 'react';

// Extract the provider into a client boundary
export function LuminaClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <LuminaProvider>
      {children}
    </LuminaProvider>
  );
}
