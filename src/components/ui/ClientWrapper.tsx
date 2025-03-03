'use client';

import React, { ReactNode } from 'react';

interface ClientWrapperProps {
  children: ReactNode;
  onClick?: () => void;
  onBlur?: (e: React.FocusEvent<HTMLElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLElement>) => void;
  onMouseEnter?: (e: React.MouseEvent<HTMLElement>) => void;
  onMouseLeave?: (e: React.MouseEvent<HTMLElement>) => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * A generic client component wrapper for any component that needs event handlers
 * Use this in server components where you need to pass event handlers to client components
 */
export default function ClientWrapper({
  children,
  ...props
}: ClientWrapperProps) {
  return (
    <div 
      onClick={props.onClick}
      className={props.className}
      onMouseEnter={props.onMouseEnter}
      onMouseLeave={props.onMouseLeave}
      onBlur={props.onBlur}
      onFocus={props.onFocus}
      style={props.style as React.CSSProperties}
    >
      {children}
    </div>
  );
}