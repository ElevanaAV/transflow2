// src/components/ui/ClientButtonWrapper.tsx
'use client';

import React from 'react';
import { Button, ButtonProps } from '@/components/ui/Button';

interface ClientButtonWrapperProps extends ButtonProps {
  onClick: () => void;
}

/**
 * A client component wrapper for Button to handle onClick events
 * Use this in server components where you need to pass onClick handlers
 */
export default function ClientButtonWrapper({ onClick, ...props }: ClientButtonWrapperProps) {
  return <Button onClick={onClick} {...props} />;
}